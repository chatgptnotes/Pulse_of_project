-- =====================================================
-- GRANULAR PERMISSIONS MIGRATION
-- Add module-level permissions for users
-- =====================================================

-- =====================================================
-- 1. ADD PERMISSION COLUMNS TO user_projects
-- =====================================================

-- Add permission columns if they don't exist
DO $$
BEGIN
  -- Permission: Can view detailed project plan (Edit milestones, tasks, dates)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_projects' AND column_name = 'can_view_detailed_plan'
  ) THEN
    ALTER TABLE public.user_projects
    ADD COLUMN can_view_detailed_plan BOOLEAN DEFAULT false;
  END IF;

  -- Permission: Can upload documents
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_projects' AND column_name = 'can_upload_documents'
  ) THEN
    ALTER TABLE public.user_projects
    ADD COLUMN can_upload_documents BOOLEAN DEFAULT true;
  END IF;

  -- Permission: Can manage bugs and issues
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_projects' AND column_name = 'can_manage_bugs'
  ) THEN
    ALTER TABLE public.user_projects
    ADD COLUMN can_manage_bugs BOOLEAN DEFAULT true;
  END IF;

  -- Permission: Can access testing tracker
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_projects' AND column_name = 'can_access_testing'
  ) THEN
    ALTER TABLE public.user_projects
    ADD COLUMN can_access_testing BOOLEAN DEFAULT true;
  END IF;

  -- Permission: Can upload project documents
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_projects' AND column_name = 'can_upload_project_docs'
  ) THEN
    ALTER TABLE public.user_projects
    ADD COLUMN can_upload_project_docs BOOLEAN DEFAULT true;
  END IF;

  -- Permission: Can view dashboard metrics
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_projects' AND column_name = 'can_view_metrics'
  ) THEN
    ALTER TABLE public.user_projects
    ADD COLUMN can_view_metrics BOOLEAN DEFAULT true;
  END IF;

  -- Permission: Can view timeline/Gantt chart
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_projects' AND column_name = 'can_view_timeline'
  ) THEN
    ALTER TABLE public.user_projects
    ADD COLUMN can_view_timeline BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Create index for faster permission lookups
CREATE INDEX IF NOT EXISTS idx_user_projects_permissions
  ON public.user_projects(user_id, project_id);

-- =====================================================
-- 2. UPDATE project_assignments_detail VIEW
-- =====================================================

DROP VIEW IF EXISTS public.project_assignments_detail;

CREATE OR REPLACE VIEW public.project_assignments_detail AS
SELECT
  up.id as assignment_id,
  up.user_id,
  u.email as user_email,
  u.full_name as user_name,
  up.project_id,
  p.name as project_name,
  p.client,
  p.status as project_status,
  p.progress,
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
FROM public.user_projects up
JOIN public.users u ON up.user_id = u.id
JOIN public.admin_projects p ON up.project_id = p.id;

-- =====================================================
-- 3. UPDATE get_user_projects FUNCTION
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
  -- If super admin, return all projects with all permissions
  IF EXISTS (SELECT 1 FROM public.users WHERE id = user_uuid AND role = 'super_admin') THEN
    RETURN QUERY
    SELECT
      p.id, p.name, p.client, p.description, p.status,
      p.priority, p.progress, p.starred, p.deadline,
      true as can_edit,
      true as can_view_detailed_plan,
      true as can_upload_documents,
      true as can_manage_bugs,
      true as can_access_testing,
      true as can_upload_project_docs,
      true as can_view_metrics,
      true as can_view_timeline
    FROM public.admin_projects p
    ORDER BY p.priority, p.progress DESC;
  ELSE
    -- Return only assigned projects with their specific permissions
    RETURN QUERY
    SELECT
      p.id, p.name, p.client, p.description, p.status,
      p.priority, p.progress, p.starred, p.deadline,
      up.can_edit,
      up.can_view_detailed_plan,
      up.can_upload_documents,
      up.can_manage_bugs,
      up.can_access_testing,
      up.can_upload_project_docs,
      up.can_view_metrics,
      up.can_view_timeline
    FROM public.admin_projects p
    JOIN public.user_projects up ON p.id = up.project_id
    WHERE up.user_id = user_uuid
    ORDER BY p.priority, p.progress DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. UPDATE assign_project_to_user FUNCTION
-- =====================================================

DROP FUNCTION IF EXISTS assign_project_to_user(UUID, TEXT, BOOLEAN, TEXT);

CREATE OR REPLACE FUNCTION assign_project_to_user(
  p_user_id UUID,
  p_project_id TEXT,
  p_can_edit BOOLEAN DEFAULT false,
  p_notes TEXT DEFAULT NULL,
  p_can_view_detailed_plan BOOLEAN DEFAULT false,
  p_can_upload_documents BOOLEAN DEFAULT true,
  p_can_manage_bugs BOOLEAN DEFAULT true,
  p_can_access_testing BOOLEAN DEFAULT true,
  p_can_upload_project_docs BOOLEAN DEFAULT true,
  p_can_view_metrics BOOLEAN DEFAULT true,
  p_can_view_timeline BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
  assignment_id UUID;
BEGIN
  INSERT INTO public.user_projects (
    user_id,
    project_id,
    assigned_by,
    can_edit,
    notes,
    can_view_detailed_plan,
    can_upload_documents,
    can_manage_bugs,
    can_access_testing,
    can_upload_project_docs,
    can_view_metrics,
    can_view_timeline
  )
  VALUES (
    p_user_id,
    p_project_id,
    auth.uid(),
    p_can_edit,
    p_notes,
    p_can_view_detailed_plan,
    p_can_upload_documents,
    p_can_manage_bugs,
    p_can_access_testing,
    p_can_upload_project_docs,
    p_can_view_metrics,
    p_can_view_timeline
  )
  ON CONFLICT (user_id, project_id)
  DO UPDATE SET
    can_edit = EXCLUDED.can_edit,
    notes = EXCLUDED.notes,
    can_view_detailed_plan = EXCLUDED.can_view_detailed_plan,
    can_upload_documents = EXCLUDED.can_upload_documents,
    can_manage_bugs = EXCLUDED.can_manage_bugs,
    can_access_testing = EXCLUDED.can_access_testing,
    can_upload_project_docs = EXCLUDED.can_upload_project_docs,
    can_view_metrics = EXCLUDED.can_view_metrics,
    can_view_timeline = EXCLUDED.can_view_timeline,
    assigned_by = auth.uid(),
    assigned_at = NOW()
  RETURNING id INTO assignment_id;

  RETURN assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. CREATE HELPER FUNCTION TO GET USER PERMISSIONS
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_project_permissions(
  p_user_id UUID,
  p_project_id TEXT
)
RETURNS TABLE (
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
  -- If super admin, return all permissions true
  IF EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id AND role = 'super_admin') THEN
    RETURN QUERY
    SELECT
      true::boolean,
      true::boolean,
      true::boolean,
      true::boolean,
      true::boolean,
      true::boolean,
      true::boolean,
      true::boolean;
  ELSE
    -- Return user's specific permissions for this project
    RETURN QUERY
    SELECT
      up.can_edit,
      up.can_view_detailed_plan,
      up.can_upload_documents,
      up.can_manage_bugs,
      up.can_access_testing,
      up.can_upload_project_docs,
      up.can_view_metrics,
      up.can_view_timeline
    FROM public.user_projects up
    WHERE up.user_id = p_user_id AND up.project_id = p_project_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. CREATE DEFAULT PERMISSION TEMPLATES
-- =====================================================

-- Function to assign "View Only" permissions
CREATE OR REPLACE FUNCTION assign_view_only_permissions(
  p_user_id UUID,
  p_project_id TEXT
)
RETURNS UUID AS $$
BEGIN
  RETURN assign_project_to_user(
    p_user_id,
    p_project_id,
    false,  -- can_edit
    'View only access',  -- notes
    false,  -- can_view_detailed_plan
    false,  -- can_upload_documents
    false,  -- can_manage_bugs
    false,  -- can_access_testing
    false,  -- can_upload_project_docs
    true,   -- can_view_metrics
    true    -- can_view_timeline
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign "Standard User" permissions
CREATE OR REPLACE FUNCTION assign_standard_user_permissions(
  p_user_id UUID,
  p_project_id TEXT
)
RETURNS UUID AS $$
BEGIN
  RETURN assign_project_to_user(
    p_user_id,
    p_project_id,
    false,  -- can_edit
    'Standard user access',  -- notes
    false,  -- can_view_detailed_plan
    true,   -- can_upload_documents
    true,   -- can_manage_bugs
    true,   -- can_access_testing
    true,   -- can_upload_project_docs
    true,   -- can_view_metrics
    true    -- can_view_timeline
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign "Full Access" permissions
CREATE OR REPLACE FUNCTION assign_full_access_permissions(
  p_user_id UUID,
  p_project_id TEXT
)
RETURNS UUID AS $$
BEGIN
  RETURN assign_project_to_user(
    p_user_id,
    p_project_id,
    true,   -- can_edit
    'Full access',  -- notes
    true,   -- can_view_detailed_plan
    true,   -- can_upload_documents
    true,   -- can_manage_bugs
    true,   -- can_access_testing
    true,   -- can_upload_project_docs
    true,   -- can_view_metrics
    true    -- can_view_timeline
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Check if permissions columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_projects'
  AND column_name LIKE 'can_%'
ORDER BY column_name;

-- View updated assignments with permissions
SELECT * FROM project_assignments_detail LIMIT 5;

-- Test get_user_projects function
-- SELECT * FROM get_user_projects('USER_UUID_HERE');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- ✅ Granular Permissions Migration Complete!
-- • Added 7 permission columns to user_projects
-- • Updated get_user_projects function
-- • Updated assign_project_to_user function
-- • Created permission helper functions
-- • Created permission templates (view-only, standard, full)
-- • Ready for granular access control!
-- =====================================================
