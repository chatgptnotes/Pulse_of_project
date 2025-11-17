-- Fix testing_tracker table to allow optional bug_report_id
-- This allows test cases to be created without linking to a bug report

-- Step 1: Make bug_report_id column nullable
ALTER TABLE testing_tracker
ALTER COLUMN bug_report_id DROP NOT NULL;

-- Step 2: Add a comment to the column for documentation
COMMENT ON COLUMN testing_tracker.bug_report_id IS 'Optional reference to a bug report. Can be NULL for general test cases.';

-- Verify the change
SELECT
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_name = 'testing_tracker'
AND column_name = 'bug_report_id';
