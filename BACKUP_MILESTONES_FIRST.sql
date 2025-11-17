-- =====================================================
-- STEP 1: BACKUP EXISTING MILESTONES DATA
-- =====================================================
-- Run this FIRST to backup your milestone data
-- This creates permanent backup tables (not temporary)
-- =====================================================

-- Create backup table for milestones (permanent, not temp)
DROP TABLE IF EXISTS public.milestones_backup_permanent CASCADE;
CREATE TABLE public.milestones_backup_permanent AS
SELECT * FROM public.project_milestones;

-- Create backup table for projects (permanent, not temp)
DROP TABLE IF EXISTS public.projects_backup_permanent CASCADE;
CREATE TABLE public.projects_backup_permanent AS
SELECT * FROM public.projects;

-- Verify backups
DO $$
DECLARE
  milestone_backup_count INTEGER;
  project_backup_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO milestone_backup_count FROM public.milestones_backup_permanent;
  SELECT COUNT(*) INTO project_backup_count FROM public.projects_backup_permanent;

  RAISE NOTICE '✅ Backed up % milestones', milestone_backup_count;
  RAISE NOTICE '✅ Backed up % projects', project_backup_count;

  IF milestone_backup_count = 0 THEN
    RAISE WARNING '⚠️ No milestones found to backup!';
  END IF;
END $$;

-- Show what was backed up
SELECT 'MILESTONES BACKUP' as backup_type, COUNT(*) as count FROM public.milestones_backup_permanent
UNION ALL
SELECT 'PROJECTS BACKUP' as backup_type, COUNT(*) as count FROM public.projects_backup_permanent;

-- Show sample of backed up milestones
SELECT project_id, milestone_id, name, status, progress
FROM public.milestones_backup_permanent
ORDER BY project_id, "order"
LIMIT 20;
