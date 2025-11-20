-- =====================================================
-- IMPORT PROJECT MILESTONES FROM CSV
-- =====================================================
-- This script imports milestone data from project_milestones_rows.csv
-- Uses UUID for primary key, TEXT for milestone_id
-- =====================================================

-- =====================================================
-- STEP 1: Ensure tables exist with UUID schema
-- =====================================================

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  client TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status TEXT DEFAULT 'active',
  overall_progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create project_milestones table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id TEXT UNIQUE NOT NULL,
  project_uuid UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  progress INTEGER DEFAULT 0,
  deliverables JSONB DEFAULT '[]'::jsonb,
  assigned_to TEXT[] DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',
  "order" INTEGER DEFAULT 0,
  color TEXT DEFAULT '#4F46E5',
  kpis JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- STEP 2: Create projects for all project_ids in CSV
-- =====================================================

-- Insert unique projects from the milestone data
INSERT INTO public.projects (project_id, name, description, client, start_date, end_date, status, overall_progress)
VALUES
  ('4csecure-full-stack', '4CSecure Full Stack', 'Complete security guide distribution platform', '4CSecure', '2025-11-06', '2026-01-15', 'active', 90),
  ('4csecure', '4CSecure', 'Security guide platform', '4CSecure', '2025-08-01', '2026-02-10', 'active', 99),
  ('adamrit-hms', 'ADAMRIT', 'Hospital management system', 'Healthcare', '2025-11-01', '2026-04-01', 'active', 25),
  ('betser-life', 'Betser Life Landing Page', 'AI agent Bhelp app landing page', 'Betser', '2025-11-01', '2026-02-20', 'active', 35),
  ('call-center-betser', 'Call Center for Betser', 'Connect to economystic.ai', 'Betser', '2025-11-01', '2026-02-15', 'active', 45),
  ('economystic-ai', 'Economystic.ai', 'Business operations platform', 'Betser', '2025-09-01', '2026-02-01', 'active', 55),
  ('headz-android', 'Headz Android App', 'Android app for hair styling', 'Headz', '2025-09-01', '2026-01-25', 'active', 65),
  ('headz-ios', 'Headz iOS App', 'iOS app for hair styling', 'Headz', '2025-09-01', '2026-01-20', 'active', 70),
  ('headz-stylemy', 'Headz - StyleMy.hair', 'AI hair styling platform', 'Headz', '2025-08-01', '2026-01-15', 'active', 80),
  ('linkist-nfc', 'Linkist NFC', 'NFC business card platform', 'Linkist', '2025-10-01', '2025-10-16', 'active', 90),
  ('linkist-mvp', 'Linkist MVP', 'Linkist minimum viable product', 'Linkist', '2025-11-06', '2026-01-15', 'active', 50),
  ('neurosense-mvp', 'NeuroSense360 MVP', 'Brain health platform MVP', 'Limitless Brain Wellness', '2025-11-12', '2026-01-24', 'active', 65),
  ('orma', 'Orma', 'Business management platform', 'Orma', '2025-09-01', '2026-01-31', 'active', 72),
  ('proposify-ai', 'Proposify AI', 'AI generated business proposal', 'BettRoi', '2025-11-01', '2026-02-28', 'active', 30),
  ('project-progress-dashboard', 'Project Progress Dashboard', 'PulseOfProject.com', 'BettRoi', '2025-10-01', '2025-12-20', 'active', 85),
  ('pulseofpeople', 'PulseOfPeople.com', 'Voter sentiment and analytics', 'Political Analytics', '2025-10-01', '2026-03-01', 'active', 40)
ON CONFLICT (project_id) DO NOTHING;

-- =====================================================
-- STEP 3: Import milestone data from CSV
-- =====================================================

-- NOTE: Copy the data from CSV and paste here
-- Each INSERT will generate a new UUID for the primary key

-- 4csecure-full-stack milestones
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  '4csecure-full-stack-milestone-1',
  p.id,
  '4csecure-full-stack',
  'Phase 1: Foundation',
  'Phase 1 of project development',
  'completed',
  '2025-11-06 00:00:00'::timestamp,
  '2025-11-13 00:00:00'::timestamp,
  100,
  '[{"id":"4csecure-full-stack-del-1-1","text":"Complete core functionality","completed":true},{"id":"4csecure-full-stack-del-1-2","text":"Write documentation","completed":true},{"id":"4csecure-full-stack-del-1-3","text":"Pass quality checks","completed":true}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY[]::text[],
  1,
  '#4F46E5',
  '2025-11-06 10:38:46.515168'::timestamp,
  '2025-11-06 10:38:46.515168'::timestamp
FROM public.projects p WHERE p.project_id = '4csecure-full-stack'
ON CONFLICT (milestone_id) DO NOTHING;

-- Continue with all other milestones...
-- (I'll create a separate script to generate all INSERTs)

-- =====================================================
-- Alternative: Use COPY command to import from CSV
-- =====================================================
-- This is the recommended approach for large CSV files

-- First create a temporary table to load CSV data
CREATE TEMP TABLE temp_milestones (
  id TEXT,
  project_id TEXT,
  name TEXT,
  description TEXT,
  status TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  progress INTEGER,
  deliverables JSONB,
  assigned_to TEXT[],
  dependencies TEXT[],
  "order" INTEGER,
  color TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- IMPORTANT: Run this in psql or use Supabase's import feature
-- This assumes the CSV file is accessible
-- COPY temp_milestones FROM 'C:/Users/Hp/Downloads/project_milestones_rows.csv'
-- WITH (FORMAT CSV, HEADER TRUE, DELIMITER ',');

-- Then insert from temp table into actual table
INSERT INTO public.project_milestones (
  milestone_id,
  project_uuid,
  project_id,
  name,
  description,
  status,
  start_date,
  end_date,
  progress,
  deliverables,
  assigned_to,
  dependencies,
  "order",
  color,
  created_at,
  updated_at
)
SELECT
  t.id as milestone_id,
  p.id as project_uuid,
  t.project_id,
  t.name,
  t.description,
  t.status,
  t.start_date,
  t.end_date,
  t.progress,
  t.deliverables,
  t.assigned_to,
  t.dependencies,
  t."order",
  t.color,
  t.created_at,
  t.updated_at
FROM temp_milestones t
JOIN public.projects p ON p.project_id = t.project_id
ON CONFLICT (milestone_id) DO NOTHING;

-- Drop temp table
DROP TABLE temp_milestones;

-- =====================================================
-- Verification
-- =====================================================

SELECT COUNT(*) as total_milestones FROM public.project_milestones;

SELECT project_id, COUNT(*) as milestone_count
FROM public.project_milestones
GROUP BY project_id
ORDER BY milestone_count DESC;

SELECT milestone_id, name, status, progress
FROM public.project_milestones
WHERE project_id = 'neurosense-mvp'
ORDER BY "order";
