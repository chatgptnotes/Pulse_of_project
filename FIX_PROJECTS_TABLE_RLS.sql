-- =====================================================
-- FIX PROJECTS TABLE RLS POLICIES
-- =====================================================
-- Ensure projects table allows read access for all authenticated users
-- Only super_admin can modify
-- =====================================================

-- 1. Enable RLS on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "projects_select_all" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_all" ON public.projects;
DROP POLICY IF EXISTS "projects_update_all" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_super_admin" ON public.projects;

-- 3. Allow all authenticated users to SELECT projects
CREATE POLICY "projects_select_all"
  ON public.projects
  FOR SELECT
  USING (true);

-- 4. Allow INSERT for all authenticated users (needed for auto-create from admin_projects)
CREATE POLICY "projects_insert_all"
  ON public.projects
  FOR INSERT
  WITH CHECK (true);

-- 5. Allow UPDATE for all authenticated users (needed for saving project changes)
CREATE POLICY "projects_update_all"
  ON public.projects
  FOR UPDATE
  USING (true);

-- 6. Only super_admin can DELETE
CREATE POLICY "projects_delete_super_admin"
  ON public.projects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- 7. Also fix project_milestones table
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project_milestones_all_access" ON public.project_milestones;

CREATE POLICY "project_milestones_all_access"
  ON public.project_milestones
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 8. Verify policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('projects', 'project_milestones')
ORDER BY tablename, policyname;
