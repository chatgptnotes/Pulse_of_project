-- =====================================================
-- ADD PRIORITY COLUMN TO admin_projects
-- =====================================================

-- Add priority column if it doesn't exist
ALTER TABLE public.admin_projects
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 3;

-- Update existing projects with default priority
UPDATE public.admin_projects
SET priority = 3
WHERE priority IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_admin_projects_priority ON public.admin_projects(priority);

-- Verify the column was added
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'admin_projects'
AND column_name = 'priority';

-- Show updated table structure
SELECT project_id, name, priority, overall_progress
FROM public.admin_projects
ORDER BY priority, overall_progress DESC
LIMIT 10;
