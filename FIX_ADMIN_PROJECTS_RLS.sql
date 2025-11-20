-- =====================================================
-- FIX ADMIN_PROJECTS TABLE RLS POLICIES
-- =====================================================
-- This fixes the 406 error and PGRST116 error when accessing admin_projects
-- Issue: RLS is blocking access to admin_projects table
-- =====================================================

-- 1. Check if table exists and has RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'admin_projects';

-- 2. Enable RLS on admin_projects (if not already enabled)
ALTER TABLE public.admin_projects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "admin_projects_select_all" ON public.admin_projects;
DROP POLICY IF EXISTS "admin_projects_insert_super_admin" ON public.admin_projects;
DROP POLICY IF EXISTS "admin_projects_update_super_admin" ON public.admin_projects;
DROP POLICY IF EXISTS "admin_projects_delete_super_admin" ON public.admin_projects;

-- 4. Create policy to allow ALL authenticated users to SELECT (read) projects
CREATE POLICY "admin_projects_select_all"
  ON public.admin_projects
  FOR SELECT
  USING (true);  -- Allow all authenticated users to read

-- 5. Create policies for super_admin to INSERT/UPDATE/DELETE
CREATE POLICY "admin_projects_insert_super_admin"
  ON public.admin_projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "admin_projects_update_super_admin"
  ON public.admin_projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "admin_projects_delete_super_admin"
  ON public.admin_projects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- 6. Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'admin_projects';

-- 7. Check if data exists in admin_projects
SELECT COUNT(*) as total_projects FROM public.admin_projects;
SELECT id, name, status FROM public.admin_projects ORDER BY priority, name LIMIT 10;

-- 8. Specifically check for neurosense-360 project
SELECT * FROM public.admin_projects WHERE id = 'neurosense-360';
