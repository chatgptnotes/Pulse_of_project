-- Fix: Make reported_by and assigned_to fields nullable
-- These fields should be optional since not all bugs need to be assigned immediately

-- Make reported_by nullable
ALTER TABLE bug_reports
ALTER COLUMN reported_by DROP NOT NULL;

-- Make assigned_to nullable (if it's not already)
ALTER TABLE bug_reports
ALTER COLUMN assigned_to DROP NOT NULL;

-- Verify the changes
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'bug_reports'
  AND column_name IN ('reported_by', 'assigned_to');

COMMENT ON COLUMN bug_reports.reported_by IS 'UUID of team member who reported the bug (optional)';
COMMENT ON COLUMN bug_reports.assigned_to IS 'UUID of team member assigned to fix the bug (optional)';

SELECT 'Fix applied successfully - reported_by and assigned_to are now nullable' AS result;
