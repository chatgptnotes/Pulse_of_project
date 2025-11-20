-- Migration: Move deliverable completion data from project_milestones.deliverables to deliverable_progress table
-- This script extracts deliverable data from the JSONB column and inserts it into the dedicated table

-- Step 1: Insert all deliverables from project_milestones into deliverable_progress table
INSERT INTO public.deliverable_progress (
  project_id,
  milestone_id,
  deliverable_id,
  deliverable_text,
  completed,
  completed_at
)
SELECT
  pm.project_id,
  pm.id as milestone_id,
  (deliverable->>'id')::text as deliverable_id,
  (deliverable->>'text')::text as deliverable_text,
  COALESCE((deliverable->>'completed')::boolean, false) as completed,
  CASE
    WHEN (deliverable->>'completed')::boolean = true THEN NOW()
    ELSE NULL
  END as completed_at
FROM
  public.project_milestones pm,
  jsonb_array_elements(pm.deliverables) as deliverable
WHERE
  pm.deliverables IS NOT NULL
  AND jsonb_array_length(pm.deliverables) > 0
ON CONFLICT (project_id, milestone_id, deliverable_id)
DO UPDATE SET
  completed = EXCLUDED.completed,
  completed_at = EXCLUDED.completed_at,
  deliverable_text = EXCLUDED.deliverable_text;

-- Step 2: Clear the deliverables column from project_milestones table
-- Note: We keep the column structure for metadata, but remove completion status
UPDATE public.project_milestones
SET deliverables = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', deliverable->>'id',
      'text', deliverable->>'text'
      -- Remove 'completed' field - it's now in deliverable_progress table
    )
  )
  FROM jsonb_array_elements(deliverables) as deliverable
)
WHERE deliverables IS NOT NULL
  AND jsonb_array_length(deliverables) > 0;

-- Verification queries (run these to check the migration)
-- 1. Count deliverables in progress table
SELECT COUNT(*) as total_deliverables_in_progress_table FROM public.deliverable_progress;

-- 2. Show sample data from progress table
SELECT * FROM public.deliverable_progress LIMIT 10;

-- 3. Check that deliverables in milestones no longer have 'completed' field
SELECT
  id,
  name,
  deliverables
FROM public.project_milestones
WHERE deliverables IS NOT NULL
LIMIT 5;
