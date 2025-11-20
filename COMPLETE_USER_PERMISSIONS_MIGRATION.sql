-- =====================================================
-- COMPLETE USER MANAGEMENT + PERMISSIONS MIGRATION
-- Run this single file to set up everything
-- =====================================================
-- This combines:
-- 1. USER_MANAGEMENT_MIGRATION.sql
-- 2. PERMISSIONS_MIGRATION.sql
-- =====================================================

-- =====================================================
-- PART 1: USER MANAGEMENT TABLES
-- =====================================================

-- 1. CREATE USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('super_admin', 'user')) DEFAULT 'user',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  last_login TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can create users" ON public.users;
DROP POLICY IF EXISTS "Super admins can update users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Policies
CREATE POLICY "Super admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
    OR id = auth.uid()
  );

CREATE POLICY "Super admins can create users"
  ON public.users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update users"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- =====================================================
-- 2. CREATE USER_PROJECTS TABLE WITH ALL PERMISSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  project_id TEXT REFERENCES public.admin_projects(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES public.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  can_edit BOOLEAN DEFAULT false,
  notes TEXT,
  -- Granular Permissions
  can_view_detailed_plan BOOLEAN DEFAULT false,
  can_upload_documents BOOLEAN DEFAULT true,
  can_manage_bugs BOOLEAN DEFAULT true,
  can_access_testing BOOLEAN DEFAULT true,
  can_upload_project_docs BOOLEAN DEFAULT true,
  can_view_metrics BOOLEAN DEFAULT true,
  can_view_timeline BOOLEAN DEFAULT true,
  UNIQUE(user_id, project_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON public.user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_project_id ON public.user_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_permissions ON public.user_projects(user_id, project_id);

-- Enable Row Level Security
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own assignments" ON public.user_projects;
DROP POLICY IF EXISTS "Super admins can manage assignments" ON public.user_projects;

-- Policies
CREATE POLICY "Users can view own assignments"
  ON public.user_projects FOR SELECT
  USING (user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage assignments"
  ON public.user_projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- 3. UPDATE admin_projects TABLE
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_projects'
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.admin_projects
    ADD COLUMN created_by UUID REFERENCES public.users(id);
  END IF;
END $$;

-- =====================================================
-- 4. CREATE VIEWS
-- =====================================================

-- Drop existing views
DROP VIEW IF EXISTS public.users_with_stats;
DROP VIEW IF EXISTS public.project_assignments_detail;

-- View: User with project count
CREATE OR REPLACE VIEW public.users_with_stats AS
SELECT
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.is_active,
  u.created_at,
  u.last_login,
  COUNT(DISTINCT up.project_id) as assigned_projects_count
FROM public.users u
LEFT JOIN public.user_projects up ON u.id = up.user_id
GROUP BY u.id, u.email, u.full_name, u.role, u.is_active, u.created_at, u.last_login;

-- View: Project assignments with details and permissions
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
-- 5. CREATE FUNCTIONS
-- =====================================================

-- Function: Get projects for a user with permissions
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

-- Function: Assign project to user with permissions
DROP FUNCTION IF EXISTS assign_project_to_user;

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

-- Function: Remove project assignment
DROP FUNCTION IF EXISTS remove_project_assignment;

CREATE OR REPLACE FUNCTION remove_project_assignment(
  p_user_id UUID,
  p_project_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM public.user_projects
  WHERE user_id = p_user_id AND project_id = p_project_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user project permissions
DROP FUNCTION IF EXISTS get_user_project_permissions;

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
-- 6. PERMISSION PRESET FUNCTIONS
-- =====================================================

-- Function: View Only preset
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

-- Function: Standard User preset
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

-- Function: Full Access preset
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
-- 7. AUTH TRIGGER
-- =====================================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 8. VERIFICATION
-- =====================================================

-- Show created tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'user_projects')
ORDER BY table_name;

-- Show permission columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_projects'
  AND column_name LIKE 'can_%'
ORDER BY column_name;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- ✅ Complete User Management + Permissions Migration Done!
--
-- Created:
-- • users table with roles
-- • user_projects table with granular permissions
-- • Row Level Security policies
-- • Helper functions and views
-- • Permission presets (view-only, standard, full)
--
-- Next Steps:
-- 1. Make yourself super admin:
--    UPDATE public.users SET role = 'super_admin' WHERE email = 'your-email@example.com';
--
-- 2. Access user management at: /users
--
-- 3. Create users and assign projects with permissions!
-- =====================================================
