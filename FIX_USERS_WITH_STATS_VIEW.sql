-- =====================================================
-- FIX: Create users_with_stats view
-- =====================================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.users_with_stats CASCADE;

-- Create the users_with_stats view
CREATE OR REPLACE VIEW public.users_with_stats AS
SELECT
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.is_active,
  u.last_login,
  u.created_at,
  u.updated_at,
  COUNT(DISTINCT up.project_id) as project_count,
  ARRAY_AGG(DISTINCT up.project_id) FILTER (WHERE up.project_id IS NOT NULL) as assigned_projects
FROM public.users u
LEFT JOIN public.user_projects up ON u.id = up.user_id
GROUP BY u.id, u.email, u.full_name, u.role, u.is_active, u.last_login, u.created_at, u.updated_at;

-- Enable RLS on the view (optional, but good practice)
ALTER VIEW public.users_with_stats SET (security_barrier = true);

-- Grant permissions
GRANT SELECT ON public.users_with_stats TO authenticated;
GRANT SELECT ON public.users_with_stats TO anon;

-- Verify the view works
SELECT * FROM public.users_with_stats;

-- Count users in the view
SELECT COUNT(*) as total_users FROM public.users_with_stats;
