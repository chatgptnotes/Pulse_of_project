-- =====================================================
-- CHECK AND FIX USER PROJECT ASSIGNMENT
-- =====================================================

-- 1. Check if user BK exists
SELECT id, email, full_name, role
FROM public.users
WHERE email = 'murali@gmail.com';

-- 2. Check if neurosense-mvp project exists in admin_projects
SELECT id, project_id, name, overall_progress, status
FROM public.admin_projects
WHERE project_id = 'neurosense-mvp';

-- 3. Check if user has been assigned to neurosense-mvp
SELECT
  up.*,
  u.email,
  ap.name as project_name
FROM public.user_projects up
JOIN public.users u ON up.user_id = u.id
JOIN public.admin_projects ap ON up.project_id = ap.project_id
WHERE u.email = 'murali@gmail.com'
AND up.project_id = 'neurosense-mvp';

-- 4. If not assigned, assign the project to user BK
-- First get the user ID
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM public.users
  WHERE email = 'murali@gmail.com';

  IF v_user_id IS NOT NULL THEN
    -- Assign neurosense-mvp project to user
    INSERT INTO public.user_projects (
      user_id,
      project_id,
      can_edit,
      can_view_detailed_plan,
      can_upload_documents,
      can_manage_bugs,
      can_access_testing,
      can_upload_project_docs,
      can_view_metrics,
      can_view_timeline
    ) VALUES (
      v_user_id,
      'neurosense-mvp',
      false,
      false,
      true,
      true,
      true,
      true,
      true,
      true
    )
    ON CONFLICT (user_id, project_id)
    DO UPDATE SET
      can_upload_documents = true,
      can_manage_bugs = true,
      can_access_testing = true,
      can_upload_project_docs = true,
      can_view_metrics = true,
      can_view_timeline = true;

    RAISE NOTICE '✅ Project assigned/updated for user: murali@gmail.com';
  ELSE
    RAISE NOTICE '❌ User not found: murali@gmail.com';
  END IF;
END $$;

-- 5. Check milestones exist for neurosense-mvp
SELECT COUNT(*) as milestone_count
FROM public.project_milestones
WHERE project_id = 'neurosense-mvp';

-- 6. Show sample milestones
SELECT milestone_id, name, status, progress, "order"
FROM public.project_milestones
WHERE project_id = 'neurosense-mvp'
ORDER BY "order"
LIMIT 5;

-- 7. Verify the assignment worked
SELECT
  u.email,
  u.role,
  up.project_id,
  ap.name as project_name,
  up.can_upload_documents,
  up.can_manage_bugs,
  up.can_view_timeline
FROM public.user_projects up
JOIN public.users u ON up.user_id = u.id
JOIN public.admin_projects ap ON up.project_id = ap.project_id
WHERE u.email = 'murali@gmail.com'
AND up.project_id = 'neurosense-mvp';
