-- =====================================================
-- CHECK ADMIN_PROJECTS TABLE AND DATA
-- =====================================================
-- Run this query in Supabase SQL Editor to diagnose the issue
-- =====================================================

-- 1. Check if admin_projects table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'admin_projects'
) as table_exists;

-- 2. If table exists, check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'admin_projects';

-- 3. Check policies on admin_projects
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'admin_projects';

-- 4. Count total projects
SELECT COUNT(*) as total_projects FROM public.admin_projects;

-- 5. Check if neurosense-360 exists
SELECT * FROM public.admin_projects WHERE id = 'neurosense-360';

-- 6. List all projects (first 20)
SELECT id, name, client, status, priority, progress
FROM public.admin_projects
ORDER BY priority, name
LIMIT 20;

-- 7. Check user_projects table
SELECT COUNT(*) as total_user_project_assignments FROM public.user_projects;

-- 8. Check specific user's projects
-- Get first user from users table
SELECT u.id, u.email, u.role,
       (SELECT COUNT(*) FROM public.user_projects WHERE user_id = u.id) as assigned_projects_count
FROM public.users u
WHERE u.role != 'super_admin'
LIMIT 5;

-- 9. Test get_user_projects function exists
SELECT EXISTS (
  SELECT FROM information_schema.routines
  WHERE routine_schema = 'public'
  AND routine_name = 'get_user_projects'
) as function_exists;

-- 10. If function exists, test it with first non-admin user
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Get first non-admin user
  SELECT id INTO test_user_id FROM public.users WHERE role != 'super_admin' LIMIT 1;

  IF test_user_id IS NOT NULL THEN
    RAISE NOTICE 'Testing get_user_projects function with user: %', test_user_id;
    -- Note: You'll need to run this separately:
    -- SELECT * FROM get_user_projects('user-id-here');
  ELSE
    RAISE NOTICE 'No non-admin users found to test with';
  END IF;
END $$;
