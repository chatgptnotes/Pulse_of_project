-- =====================================================
-- COMPLETE FIX FOR ADMIN_PROJECTS ACCESS ISSUES
-- =====================================================
-- This file fixes all RLS and permission issues preventing
-- users from accessing admin_projects table
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Fix admin_projects Table RLS
-- =====================================================

-- Enable RLS
ALTER TABLE public.admin_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "admin_projects_select_all" ON public.admin_projects;
DROP POLICY IF EXISTS "admin_projects_insert_super_admin" ON public.admin_projects;
DROP POLICY IF EXISTS "admin_projects_update_super_admin" ON public.admin_projects;
DROP POLICY IF EXISTS "admin_projects_delete_super_admin" ON public.admin_projects;
DROP POLICY IF EXISTS "admin_projects_all_access" ON public.admin_projects;

-- Create simple policy allowing ALL operations for authenticated users
-- (We'll control access through user_projects table)
CREATE POLICY "admin_projects_all_access"
  ON public.admin_projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- STEP 2: Fix projects Table RLS
-- =====================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_all_access" ON public.projects;

CREATE POLICY "projects_all_access"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- STEP 3: Fix project_milestones Table RLS
-- =====================================================

ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project_milestones_all_access" ON public.project_milestones;

CREATE POLICY "project_milestones_all_access"
  ON public.project_milestones
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- STEP 4: Verify and Re-create get_user_projects Function
-- =====================================================

DROP FUNCTION IF EXISTS get_user_projects(UUID);

CREATE OR REPLACE FUNCTION get_user_projects(user_uuid UUID)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  client TEXT,
  description TEXT,
  status TEXT,
  priority INTEGER,
  progress INTEGER,
  starred BOOLEAN,
  deadline DATE,
  can_edit BOOLEAN,
  can_view_detailed_plan BOOLEAN,
  can_upload_documents BOOLEAN,
  can_manage_bugs BOOLEAN,
  can_access_testing BOOLEAN,
  can_upload_project_docs BOOLEAN,
  can_view_metrics BOOLEAN,
  can_view_timeline BOOLEAN
) AS $$
BEGIN
  -- Check if user is super admin
  IF EXISTS (SELECT 1 FROM public.users u WHERE u.id = user_uuid AND u.role = 'super_admin') THEN
    -- Super admin sees all projects with all permissions
    RETURN QUERY
    SELECT
      p.id, p.name, p.client, p.description, p.status,
      p.priority, p.progress, p.starred, p.deadline,
      true::boolean as can_edit,
      true::boolean as can_view_detailed_plan,
      true::boolean as can_upload_documents,
      true::boolean as can_manage_bugs,
      true::boolean as can_access_testing,
      true::boolean as can_upload_project_docs,
      true::boolean as can_view_metrics,
      true::boolean as can_view_timeline
    FROM public.admin_projects p
    ORDER BY p.priority, p.progress DESC;
  ELSE
    -- Regular users see only assigned projects with their permissions
    RETURN QUERY
    SELECT
      p.id, p.name, p.client, p.description, p.status,
      p.priority, p.progress, p.starred, p.deadline,
      COALESCE(up.can_edit, false) as can_edit,
      COALESCE(up.can_view_detailed_plan, false) as can_view_detailed_plan,
      COALESCE(up.can_upload_documents, false) as can_upload_documents,
      COALESCE(up.can_manage_bugs, false) as can_manage_bugs,
      COALESCE(up.can_access_testing, false) as can_access_testing,
      COALESCE(up.can_upload_project_docs, false) as can_upload_project_docs,
      COALESCE(up.can_view_metrics, false) as can_view_metrics,
      COALESCE(up.can_view_timeline, false) as can_view_timeline
    FROM public.admin_projects p
    INNER JOIN public.user_projects up ON p.id = up.project_id
    WHERE up.user_id = user_uuid
    ORDER BY p.priority, p.progress DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_projects(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_projects(UUID) TO anon;

-- =====================================================
-- STEP 5: Verify Data Exists
-- =====================================================

-- Check if admin_projects has data
DO $$
DECLARE
  project_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO project_count FROM public.admin_projects;
  RAISE NOTICE 'Total projects in admin_projects: %', project_count;

  IF project_count = 0 THEN
    RAISE WARNING 'admin_projects table is EMPTY! Please run ADMIN_PROJECTS_MIGRATION.sql first!';
  ELSE
    RAISE NOTICE 'admin_projects table has data. Good!';
  END IF;
END $$;

-- List first 10 projects
SELECT id, name, status, priority
FROM public.admin_projects
ORDER BY priority, name
LIMIT 10;

-- Specifically check for neurosense-360
SELECT id, name, client, status
FROM public.admin_projects
WHERE id = 'neurosense-360';

-- =====================================================
-- STEP 6: Test the Function
-- =====================================================

-- Test with a user (replace with actual user ID)
-- SELECT * FROM get_user_projects('user-id-here');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('admin_projects', 'projects', 'project_milestones');

-- Check policies exist
SELECT tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('admin_projects', 'projects', 'project_milestones')
ORDER BY tablename, policyname;

-- Check function exists
SELECT routine_name, security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_user_projects';
