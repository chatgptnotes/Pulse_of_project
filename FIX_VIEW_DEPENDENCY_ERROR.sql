-- =====================================================
-- FIX VIEW DEPENDENCY ERROR
-- =====================================================
-- This fixes the error:
-- "cannot alter type of a column used by a view or rule"
-- "rule _RETURN on view users_with_stats depends on column project_id"
-- =====================================================

-- =====================================================
-- STEP 1: Drop the users_with_stats view
-- =====================================================

DROP VIEW IF EXISTS public.users_with_stats CASCADE;

-- =====================================================
-- STEP 2: Now you can run the main migration
-- =====================================================
-- After running this, run MIGRATE_TO_UUID_PRIMARY_KEYS.sql

-- =====================================================
-- STEP 3: Recreate users_with_stats view (if needed)
-- =====================================================
-- This view will be recreated after the migration
-- It will use the new schema with UUID primary keys

CREATE OR REPLACE VIEW public.users_with_stats AS
SELECT
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.is_active,
  u.created_at,
  u.updated_at,
  COUNT(DISTINCT up.project_id) as assigned_projects_count,
  ARRAY_AGG(DISTINCT ap.project_id) FILTER (WHERE ap.project_id IS NOT NULL) as project_ids,
  ARRAY_AGG(DISTINCT ap.name) FILTER (WHERE ap.name IS NOT NULL) as project_names
FROM public.users u
LEFT JOIN public.user_projects up ON u.id = up.user_id
LEFT JOIN public.admin_projects ap ON up.project_id = ap.project_id
GROUP BY u.id, u.email, u.full_name, u.role, u.is_active, u.created_at, u.updated_at;

-- Grant permissions
GRANT SELECT ON public.users_with_stats TO authenticated;

RAISE NOTICE '✅ View dependency fixed - users_with_stats recreated';
