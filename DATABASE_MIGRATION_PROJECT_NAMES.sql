-- DATABASE MIGRATION: Remove project_name constraint to allow all projects
-- This migration allows each project to have its own isolated bug list

-- ======================================================================
-- STEP 1: Remove the old CHECK constraint (if it exists)
-- ======================================================================

-- First, find the constraint name
SELECT conname
FROM pg_constraint
WHERE conrelid = 'bug_reports'::regclass
  AND contype = 'c';

-- Drop the constraint (replace 'bug_reports_project_name_check' with actual name if different)
ALTER TABLE bug_reports
DROP CONSTRAINT IF EXISTS bug_reports_project_name_check;

-- ======================================================================
-- STEP 2: Verify the constraint is removed
-- ======================================================================

-- Check that no CHECK constraints exist on project_name
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'bug_reports'::regclass;

-- ======================================================================
-- STEP 3: Update existing data (optional - for data cleanup)
-- ======================================================================

-- If you want to rename existing LinkList bugs to linkist-nfc:
-- UPDATE bug_reports
-- SET project_name = 'linkist-nfc'
-- WHERE project_name = 'LinkList';

-- If you want to rename existing Neuro360 bugs to neurosense-360:
-- UPDATE bug_reports
-- SET project_name = 'neurosense-360'
-- WHERE project_name = 'Neuro360';

-- ======================================================================
-- STEP 4: Verify current bug data
-- ======================================================================

-- See all unique project names in the database
SELECT DISTINCT project_name, COUNT(*) as bug_count
FROM bug_reports
GROUP BY project_name
ORDER BY bug_count DESC;

-- ======================================================================
-- STEP 5: (Optional) Add an index for better query performance
-- ======================================================================

-- Create index on project_name for faster filtering
CREATE INDEX IF NOT EXISTS idx_bug_reports_project_name
ON bug_reports(project_name);

-- ======================================================================
-- VERIFICATION QUERIES
-- ======================================================================

-- Test inserting a bug for a new project (e.g., 4csecure)
-- This should now work without errors:
/*
INSERT INTO bug_reports (
  project_name,
  sno,
  date,
  module,
  screen,
  snag,
  severity,
  status,
  testing_status
) VALUES (
  '4csecure',
  1,
  CURRENT_DATE,
  'Test Module',
  'Test Screen',
  'Test bug for verification',
  'P3',
  'Open',
  'Pending'
);
*/

-- Query bugs by project
-- SELECT * FROM bug_reports WHERE project_name = '4csecure';
-- SELECT * FROM bug_reports WHERE project_name = 'linkist-nfc';
-- SELECT * FROM bug_reports WHERE project_name = 'neurosense-360';

-- ======================================================================
-- ROLLBACK (if needed)
-- ======================================================================
-- If you need to restore the old constraint:
/*
ALTER TABLE bug_reports
ADD CONSTRAINT bug_reports_project_name_check
CHECK (project_name IN ('LinkList', 'Neuro360'));
*/
