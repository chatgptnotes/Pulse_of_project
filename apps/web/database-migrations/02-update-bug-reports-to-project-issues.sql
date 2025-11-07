-- Migration: Transform bug_reports to project_issues with enhanced types
-- Purpose: Add issue types, team member tracking, and rename for broader scope
-- Date: 2025-11-07

-- Step 1: Add new columns to existing bug_reports table
ALTER TABLE bug_reports
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'bug'
  CHECK (type IN ('bug', 'suggestion', 'enhancement', 'announcement', 'feature_request')),
ADD COLUMN IF NOT EXISTS reported_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL;

-- Step 2: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bug_reports_type ON bug_reports(type);
CREATE INDEX IF NOT EXISTS idx_bug_reports_reported_by ON bug_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_bug_reports_assigned_to ON bug_reports(assigned_to);

-- Step 3: Rename table (optional - uncomment if you want to rename)
-- ALTER TABLE bug_reports RENAME TO project_issues;

-- Step 4: Add comments for documentation
COMMENT ON COLUMN bug_reports.type IS 'Type of issue: bug, suggestion, enhancement, announcement, or feature_request';
COMMENT ON COLUMN bug_reports.reported_by IS 'Team member who reported this issue';
COMMENT ON COLUMN bug_reports.assigned_to IS 'Team member assigned to work on this issue';

-- Step 5: Update existing records to have default type
UPDATE bug_reports
SET type = 'bug'
WHERE type IS NULL;

-- Verification query
SELECT
  type,
  COUNT(*) as count
FROM bug_reports
GROUP BY type
ORDER BY type;
