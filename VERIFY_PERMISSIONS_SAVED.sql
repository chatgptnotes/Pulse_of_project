-- =====================================================
-- VERIFY PERMISSIONS ARE BEING SAVED
-- Check if user permissions are properly stored in database
-- =====================================================

-- =====================================================
-- 1. VIEW ALL USER PROJECT ASSIGNMENTS WITH PERMISSIONS
-- =====================================================

SELECT
  up.id as assignment_id,
  u.email as user_email,
  u.full_name as user_name,
  p.name as project_name,
  p.id::text as project_id,
  up.can_edit,
  up.can_view_detailed_plan,
  up.can_upload_documents,
  up.can_manage_bugs,
  up.can_access_testing,
  up.can_upload_project_docs,
  up.can_view_metrics,
  up.can_view_timeline,
  up.assigned_at,
  up.notes
FROM user_projects up
JOIN users u ON up.user_id = u.id
JOIN admin_projects p ON up.project_id = p.id::text
ORDER BY up.assigned_at DESC;

-- =====================================================
-- 2. CHECK SPECIFIC USER'S PERMISSIONS
-- =====================================================

-- Replace 'bettroi@gmail.com' with the user email you want to check
SELECT
  u.email,
  u.full_name,
  p.name as project_name,
  up.can_edit as "Can Edit",
  up.can_view_detailed_plan as "View Detailed Plan",
  up.can_upload_documents as "Upload Documents",
  up.can_manage_bugs as "Manage Bugs",
  up.can_access_testing as "Access Testing",
  up.can_upload_project_docs as "Upload Project Docs",
  up.can_view_metrics as "View Metrics",
  up.can_view_timeline as "View Timeline"
FROM user_projects up
JOIN users u ON up.user_id = u.id
JOIN admin_projects p ON up.project_id = p.id::text
WHERE u.email = 'bettroi@gmail.com';

-- =====================================================
-- 3. CHECK IF PERMISSIONS ARE NULL (NOT SAVED)
-- =====================================================

-- This will show any assignments where permissions are NULL
SELECT
  u.email,
  p.name as project_name,
  CASE
    WHEN up.can_view_detailed_plan IS NULL THEN '❌ NULL'
    ELSE '✅ SET'
  END as detailed_plan_status,
  CASE
    WHEN up.can_upload_documents IS NULL THEN '❌ NULL'
    ELSE '✅ SET'
  END as upload_docs_status,
  CASE
    WHEN up.can_manage_bugs IS NULL THEN '❌ NULL'
    ELSE '✅ SET'
  END as manage_bugs_status
FROM user_projects up
JOIN users u ON up.user_id = u.id
JOIN admin_projects p ON up.project_id = p.id::text
WHERE up.can_view_detailed_plan IS NULL
   OR up.can_upload_documents IS NULL
   OR up.can_manage_bugs IS NULL;

-- =====================================================
-- 4. COUNT USERS BY PERMISSION TYPE
-- =====================================================

SELECT
  COUNT(*) FILTER (WHERE can_edit = true) as users_with_edit,
  COUNT(*) FILTER (WHERE can_view_detailed_plan = true) as users_can_view_plan,
  COUNT(*) FILTER (WHERE can_upload_documents = true) as users_can_upload_docs,
  COUNT(*) FILTER (WHERE can_manage_bugs = true) as users_can_manage_bugs,
  COUNT(*) FILTER (WHERE can_access_testing = true) as users_can_test,
  COUNT(*) as total_assignments
FROM user_projects;

-- =====================================================
-- 5. CHECK TABLE STRUCTURE (ENSURE COLUMNS EXIST)
-- =====================================================

SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_projects'
  AND column_name LIKE 'can_%'
ORDER BY column_name;

-- =====================================================
-- 6. TEST UPSERT FUNCTIONALITY
-- =====================================================

-- This will show you if the upsert is working
-- Check the most recent assignments
SELECT
  up.id,
  u.email,
  p.name,
  up.can_edit,
  up.can_view_detailed_plan,
  up.can_upload_documents,
  up.assigned_at,
  up.notes
FROM user_projects up
JOIN users u ON up.user_id = u.id
JOIN admin_projects p ON up.project_id = p.id::text
ORDER BY up.assigned_at DESC
LIMIT 10;

-- =====================================================
-- INTERPRETATION GUIDE
-- =====================================================
-- ✅ If you see TRUE/FALSE values: Permissions are saving correctly
-- ❌ If you see NULL values: Permissions are NOT saving
--
-- Common issues:
-- 1. NULL values = Column exists but not being set
-- 2. Column not found error = Migration not run
-- 3. No rows = User has no project assignments
-- =====================================================
