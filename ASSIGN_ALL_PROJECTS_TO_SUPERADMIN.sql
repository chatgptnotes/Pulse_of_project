-- =====================================================
-- ASSIGN ALL PROJECTS TO SUPER ADMIN USERS
-- =====================================================

-- First, let's check which users are super_admin
SELECT id, email, role FROM public.users WHERE role = 'super_admin';

-- Assign all projects to all super_admin users
INSERT INTO public.user_projects (user_id, project_id)
SELECT u.id, ap.project_id
FROM public.users u
CROSS JOIN public.admin_projects ap
WHERE u.role = 'super_admin'
ON CONFLICT (user_id, project_id) DO NOTHING;

-- Verify assignments
SELECT
  u.email,
  u.role,
  COUNT(up.project_id) as assigned_projects
FROM public.users u
LEFT JOIN public.user_projects up ON u.id = up.user_id
GROUP BY u.id, u.email, u.role
ORDER BY u.email;

-- Show all project assignments
SELECT
  u.email,
  u.role,
  up.project_id,
  ap.name as project_name
FROM public.user_projects up
JOIN public.users u ON up.user_id = u.id
JOIN public.admin_projects ap ON up.project_id = ap.project_id
ORDER BY u.email, ap.name;
