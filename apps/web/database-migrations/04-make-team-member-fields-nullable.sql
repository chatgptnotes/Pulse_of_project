-- Migration: Make team member fields nullable in bug_reports table
-- This ensures reported_by and assigned_to can be NULL (optional fields)

-- Make reported_by nullable
ALTER TABLE bug_reports
ALTER COLUMN reported_by DROP NOT NULL;

-- Make assigned_to nullable
ALTER TABLE bug_reports
ALTER COLUMN assigned_to DROP NOT NULL;

-- Also ensure type has a default value
ALTER TABLE bug_reports
ALTER COLUMN type SET DEFAULT 'bug';

-- Verify the changes
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'bug_reports'
AND column_name IN ('type', 'reported_by', 'assigned_to');
