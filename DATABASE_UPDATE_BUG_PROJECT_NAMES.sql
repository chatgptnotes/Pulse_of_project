-- DATABASE DATA MIGRATION: Update bug project names to match new project IDs
-- This migration updates existing bugs to use the actual project IDs

-- ======================================================================
-- STEP 1: Check current bug distribution
-- ======================================================================

-- See what project names currently exist
SELECT project_name, COUNT(*) as bug_count
FROM bug_reports
GROUP BY project_name
ORDER BY bug_count DESC;

-- ======================================================================
-- STEP 2: Update LinkList bugs to linkist-nfc
-- ======================================================================

-- Update all LinkList bugs to use linkist-nfc project ID
UPDATE bug_reports
SET project_name = 'linkist-nfc'
WHERE project_name = 'LinkList';

-- Verify the update
SELECT COUNT(*) as linkist_bugs
FROM bug_reports
WHERE project_name = 'linkist-nfc';

-- ======================================================================
-- STEP 3: Update Neuro360 bugs to neurosense-360
-- ======================================================================

-- Update all Neuro360 bugs to use neurosense-360 project ID
UPDATE bug_reports
SET project_name = 'neurosense-360'
WHERE project_name = 'Neuro360';

-- Verify the update
SELECT COUNT(*) as neuro_bugs
FROM bug_reports
WHERE project_name = 'neurosense-360';

-- ======================================================================
-- STEP 4: Verify final distribution
-- ======================================================================

-- Check updated bug distribution
SELECT project_name, COUNT(*) as bug_count
FROM bug_reports
GROUP BY project_name
ORDER BY project_name;

-- ======================================================================
-- EXPECTED RESULTS
-- ======================================================================

-- Before migration:
-- LinkList    | 39
-- Neuro360    | X

-- After migration:
-- linkist-nfc     | 39
-- neurosense-360  | X
-- 4csecure        | (any new bugs added)
-- other-projects  | (any new bugs added)

-- ======================================================================
-- ROLLBACK (if needed)
-- ======================================================================

-- If you need to restore the old names:
/*
UPDATE bug_reports
SET project_name = 'LinkList'
WHERE project_name = 'linkist-nfc';

UPDATE bug_reports
SET project_name = 'Neuro360'
WHERE project_name = 'neurosense-360';
*/
