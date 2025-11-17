-- =====================================================
-- USER MANAGEMENT MIGRATION
-- Super Admin can manage users and assign projects
-- =====================================================
-- This SQL file creates:
-- 1. Users table (extends Supabase auth)
-- 2. Project assignments table
-- 3. Policies for access control
-- =====================================================

-- =====================================================
-- 1. CREATE USERS TABLE (if not exists)
-- =====================================================

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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins can view all users
CREATE POLICY "Super admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
    OR id = auth.uid()
  );

-- Policy: Super admins can insert users
CREATE POLICY "Super admins can create users"
  ON public.users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Policy: Super admins can update users
CREATE POLICY "Super admins can update users"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Policy: Users can update their own profile
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
-- 2. CREATE USER_PROJECTS TABLE (Project Assignments)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  project_id TEXT REFERENCES public.admin_projects(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES public.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  can_edit BOOLEAN DEFAULT false,
  notes TEXT,
  UNIQUE(user_id, project_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON public.user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_project_id ON public.user_projects(project_id);

-- Enable Row Level Security
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own assignments
CREATE POLICY "Users can view own assignments"
  ON public.user_projects FOR SELECT
  USING (user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Policy: Super admins can manage assignments
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

-- Add owner column to admin_projects if not exists
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
-- 4. CREATE HELPFUL VIEWS
-- =====================================================

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

-- View: Project assignments with details
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
  up.assigned_at,
  up.notes
FROM public.user_projects up
JOIN public.users u ON up.user_id = u.id
JOIN public.admin_projects p ON up.project_id = p.id;

-- =====================================================
-- 5. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function: Get projects for a user
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
  can_edit BOOLEAN
) AS $$
BEGIN
  -- If super admin, return all projects
  IF EXISTS (SELECT 1 FROM public.users WHERE id = user_uuid AND role = 'super_admin') THEN
    RETURN QUERY
    SELECT
      p.id, p.name, p.client, p.description, p.status,
      p.priority, p.progress, p.starred, p.deadline,
      true as can_edit
    FROM public.admin_projects p
    ORDER BY p.priority, p.progress DESC;
  ELSE
    -- Return only assigned projects
    RETURN QUERY
    SELECT
      p.id, p.name, p.client, p.description, p.status,
      p.priority, p.progress, p.starred, p.deadline,
      up.can_edit
    FROM public.admin_projects p
    JOIN public.user_projects up ON p.id = up.project_id
    WHERE up.user_id = user_uuid
    ORDER BY p.priority, p.progress DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Assign project to user
CREATE OR REPLACE FUNCTION assign_project_to_user(
  p_user_id UUID,
  p_project_id TEXT,
  p_can_edit BOOLEAN DEFAULT false,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  assignment_id UUID;
BEGIN
  INSERT INTO public.user_projects (user_id, project_id, assigned_by, can_edit, notes)
  VALUES (p_user_id, p_project_id, auth.uid(), p_can_edit, p_notes)
  ON CONFLICT (user_id, project_id)
  DO UPDATE SET
    can_edit = EXCLUDED.can_edit,
    notes = EXCLUDED.notes,
    assigned_by = auth.uid(),
    assigned_at = NOW()
  RETURNING id INTO assignment_id;

  RETURN assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Remove project assignment
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

-- =====================================================
-- 6. UPDATE EXISTING AUTH TRIGGER
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
  -- If user already exists, just return NEW
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
-- 7. INSERT DEFAULT SUPER ADMIN (if needed)
-- =====================================================

-- Note: Run this manually after creating your first user
-- UPDATE public.users SET role = 'super_admin' WHERE email = 'your-email@example.com';

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Count users
SELECT COUNT(*) as total_users FROM public.users;

-- Count by role
SELECT role, COUNT(*) as count
FROM public.users
GROUP BY role;

-- View users with stats
SELECT * FROM public.users_with_stats;

-- View project assignments
SELECT * FROM public.project_assignments_detail;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- ✅ User Management Migration Complete!
-- • users table created with role management
-- • user_projects table for project assignments
-- • Row Level Security policies configured
-- • Helper functions and views created
-- • Ready for user management implementation
-- =====================================================
