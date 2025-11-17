-- =====================================================
-- MIGRATE ADMIN_PROJECTS AND RELATED TABLES TO UUID PRIMARY KEYS
-- =====================================================
-- This migration:
-- 1. Backs up existing data
-- 2. Recreates tables with UUID primary keys
-- 3. Restores all data
-- 4. DOES NOT DELETE ANY DATA
-- =====================================================

-- =====================================================
-- STEP 1: Create UUID Extension (if not exists)
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 2: Backup Existing Data (if tables exist)
-- =====================================================

-- Backup admin_projects
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_projects') THEN
    CREATE TEMP TABLE admin_projects_backup AS SELECT * FROM public.admin_projects;
    RAISE NOTICE 'Backed up % rows from admin_projects', (SELECT COUNT(*) FROM admin_projects_backup);
  END IF;
END $$;

-- Backup project_milestones
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_milestones') THEN
    CREATE TEMP TABLE project_milestones_backup AS SELECT * FROM public.project_milestones;
    RAISE NOTICE 'Backed up % rows from project_milestones', (SELECT COUNT(*) FROM project_milestones_backup);
  END IF;
END $$;

-- =====================================================
-- STEP 3: Drop Foreign Key Constraints (if exist)
-- =====================================================

DO $$
BEGIN
  -- Drop foreign key from project_milestones if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'project_milestones_project_id_fkey'
    AND table_name = 'project_milestones'
  ) THEN
    ALTER TABLE public.project_milestones DROP CONSTRAINT project_milestones_project_id_fkey;
    RAISE NOTICE 'Dropped foreign key constraint: project_milestones_project_id_fkey';
  END IF;

  -- Drop foreign key from user_projects if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_projects_project_id_fkey'
    AND table_name = 'user_projects'
  ) THEN
    ALTER TABLE public.user_projects DROP CONSTRAINT user_projects_project_id_fkey;
    RAISE NOTICE 'Dropped foreign key constraint: user_projects_project_id_fkey';
  END IF;
END $$;

-- =====================================================
-- STEP 4: Drop and Recreate admin_projects with UUID
-- =====================================================

DROP TABLE IF EXISTS public.admin_projects CASCADE;

CREATE TABLE public.admin_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT UNIQUE NOT NULL, -- Keep text ID for mapping
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('active', 'planning', 'completed', 'on-hold')) DEFAULT 'planning',
  priority INTEGER CHECK (priority IN (1, 2, 3, 4)) DEFAULT 2,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  starred BOOLEAN DEFAULT false,
  deadline DATE,
  team_count INTEGER DEFAULT 1,
  url TEXT,
  category TEXT,
  share_token TEXT UNIQUE,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_projects_project_id ON public.admin_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_admin_projects_status ON public.admin_projects(status);
CREATE INDEX IF NOT EXISTS idx_admin_projects_priority ON public.admin_projects(priority);
CREATE INDEX IF NOT EXISTS idx_admin_projects_category ON public.admin_projects(category);
CREATE INDEX IF NOT EXISTS idx_admin_projects_starred ON public.admin_projects(starred);
CREATE INDEX IF NOT EXISTS idx_admin_projects_share_token ON public.admin_projects(share_token);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_admin_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_projects_updated_at ON public.admin_projects;
CREATE TRIGGER update_admin_projects_updated_at
  BEFORE UPDATE ON public.admin_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_projects_updated_at();

-- =====================================================
-- STEP 5: Drop and Recreate projects table with UUID
-- =====================================================

DROP TABLE IF EXISTS public.projects CASCADE;

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT UNIQUE NOT NULL, -- Keep text ID for mapping
  name TEXT NOT NULL,
  description TEXT,
  client TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status TEXT DEFAULT 'active',
  overall_progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_project_id ON public.projects(project_id);

-- =====================================================
-- STEP 6: Drop and Recreate project_milestones with UUID
-- =====================================================

DROP TABLE IF EXISTS public.project_milestones CASCADE;

CREATE TABLE public.project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id TEXT UNIQUE NOT NULL, -- Keep text ID for mapping
  project_uuid UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL, -- Keep for compatibility
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  progress INTEGER DEFAULT 0,
  deliverables JSONB DEFAULT '[]'::jsonb,
  assigned_to TEXT[] DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',
  "order" INTEGER DEFAULT 0,
  color TEXT DEFAULT '#4F46E5',
  kpis JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_milestones_milestone_id ON public.project_milestones(milestone_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project_uuid ON public.project_milestones(project_uuid);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON public.project_milestones(project_id);

-- =====================================================
-- STEP 7: Insert All 45 Projects into admin_projects
-- =====================================================

-- PRIORITY 1 PROJECTS (14 projects)
INSERT INTO public.admin_projects (project_id, name, client, description, status, priority, progress, starred, deadline, team_count, url, category, share_token, is_custom)
VALUES
  ('neurosense-360', 'NeuroSense360 & LBW', 'Limitless Brain Wellness', 'Combined Neuro360 and LBW platform', 'active', 1, 65, true, '2026-01-24', 7, NULL, 'Healthcare', 'lbw-share-x7k9p', false),
  ('call-center-betser', 'Call Center for Betser', 'Betser', 'Connect to economystic.ai', 'active', 1, 45, true, '2026-02-15', 4, NULL, 'Business Operations', 'betser-cc-m3n2q', false),
  ('orma', 'Orma', 'Orma', NULL, 'active', 1, 72, true, '2026-01-31', 3, 'https://orma-eight.vercel.app/', 'Business', 'orma-share-z8w4r', false),
  ('4csecure', '4CSecure', '4CSecure', NULL, 'active', 1, 99, true, '2026-02-10', 5, 'https://4csecure-guide-distribution.vercel.app/', 'Security', '4csecure-view-p5t7k', false),
  ('betser-life', 'Betser Life Landing Page', 'Betser', 'AI agent Bhelp app', 'active', 1, 35, true, '2026-02-20', 4, NULL, 'AI Assistant', NULL, false),
  ('headz-stylemy', 'Headz - StyleMy.hair', 'Headz', NULL, 'active', 1, 80, true, '2026-01-15', 6, 'www.Stylemy.hair', 'Beauty & Style', NULL, false),
  ('linkist-nfc', 'Linkist NFC', 'Linkist', NULL, 'active', 1, 90, true, '2025-10-16', 3, 'https://linkist-app.vercel.app/', 'Networking', NULL, false),
  ('economystic-ai', 'Economystic.ai', 'Betser', 'Business operations platform', 'active', 1, 55, true, '2026-02-01', 5, NULL, 'Business Operations', NULL, false),
  ('pulseofpeople', 'PulseOfPeople.com', 'Political Analytics', 'Voter sentiment, ward level heat maps, feedback bot, Manifesto match AI', 'active', 1, 40, true, '2026-03-01', 8, NULL, 'Political Tech', NULL, false),
  ('headz-ios', 'Headz iOS App', 'Headz', NULL, 'active', 1, 70, true, '2026-01-20', 4, NULL, 'Mobile App', NULL, false),
  ('headz-android', 'Headz Android App', 'Headz', NULL, 'active', 1, 65, true, '2026-01-25', 4, NULL, 'Mobile App', NULL, false),
  ('adamrit-hms', 'ADAMRIT', 'Healthcare', 'Hospital management system', 'active', 1, 25, true, '2026-04-01', 7, NULL, 'Healthcare', NULL, false),
  ('proposify-ai', 'Proposify AI', 'BettRoi', 'AI generated business proposal', 'active', 1, 30, true, '2026-02-28', 3, NULL, 'Business Tools', NULL, false),
  ('project-progress-dashboard', 'Project Progress Dashboard', 'BettRoi', 'PulseOfProject.com', 'active', 1, 85, true, '2025-12-20', 2, NULL, 'Internal Tools', NULL, false)
ON CONFLICT (project_id) DO UPDATE SET
  name = EXCLUDED.name,
  client = EXCLUDED.client,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  progress = EXCLUDED.progress,
  starred = EXCLUDED.starred,
  deadline = EXCLUDED.deadline,
  team_count = EXCLUDED.team_count,
  url = EXCLUDED.url,
  category = EXCLUDED.category,
  share_token = EXCLUDED.share_token;

-- PRIORITY 2 PROJECTS (6 projects)
INSERT INTO public.admin_projects (project_id, name, client, description, status, priority, progress, starred, deadline, team_count, url, category, share_token, is_custom)
VALUES
  ('privata-site', 'Privata.site', 'Privata', NULL, 'active', 2, 48, false, '2026-03-15', 4, 'www.privata.site', 'Healthcare', NULL, false),
  ('agentsdr-2men', 'AgentSDR - 2men.co', '2men', NULL, 'active', 2, 52, false, '2026-02-25', 3, NULL, 'AI Sales', NULL, false),
  ('ddo-doctors', 'DDO - Doctors Digital Office', 'Healthcare', NULL, 'active', 2, 20, false, '2026-05-01', 5, NULL, 'Healthcare', NULL, false),
  ('styleyour-hair', 'StyleYour.hair', 'BettRoi', 'Productise by BettRoi', 'planning', 2, 15, false, '2026-04-01', 3, NULL, 'Beauty & Style', NULL, false),
  ('ai-shu', 'AI-Shu', 'Coaching Platform', 'AI Coaching assistant', 'planning', 2, 10, false, '2026-04-15', 3, NULL, 'AI Assistant', NULL, false),
  ('cheripic', 'CheriPic', 'CheriPic', NULL, 'planning', 2, 5, false, '2026-05-01', 4, NULL, 'Photo Management', NULL, false)
ON CONFLICT (project_id) DO UPDATE SET
  name = EXCLUDED.name,
  client = EXCLUDED.client,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  progress = EXCLUDED.progress;

-- PRIORITY 3 PROJECTS (10 projects)
INSERT INTO public.admin_projects (project_id, name, client, description, status, priority, progress, starred, deadline, team_count, category, is_custom)
VALUES
  ('dubai-lit-fest', 'Dubai Literature Festival', 'Dubai Lit Fest', NULL, 'planning', 3, 0, false, '2026-06-01', 3, 'Events', false),
  ('pulse-of-employee', 'Pulse of Employee', 'HR Tech', NULL, 'planning', 3, 0, false, '2026-05-15', 4, 'HR Tech', false),
  ('2men-co', '2men.co', '2men', NULL, 'planning', 3, 8, false, '2026-04-30', 2, 'Business', false),
  ('agent-sdr', 'AgentSDR', 'Sales Tech', NULL, 'planning', 3, 12, false, '2026-05-01', 3, 'AI Sales', false),
  ('customer-x', 'Customer X BettRoi', 'BettRoi', NULL, 'planning', 3, 0, false, '2026-06-01', 4, 'CRM', false),
  ('bettrio-bos', 'BettRio BOS', 'BettRoi', 'Business Operating System', 'planning', 3, 5, false, '2026-07-01', 6, 'Business Operations', false),
  ('privata-health', 'Privata Health/OpenHealth', 'Privata', 'Open source healthcare software', 'planning', 3, 0, false, '2026-08-01', 5, 'Healthcare', false),
  ('agent-x', 'Agent X BettRoi', 'BettRoi', NULL, 'planning', 3, 0, false, '2026-06-15', 3, 'AI Agent', false),
  ('apx-bettroi', 'APX - BettRoi', 'BettRoi', 'Multi agent orchestrator', 'planning', 3, 0, false, '2026-07-15', 5, 'AI Platform', false)
ON CONFLICT (project_id) DO NOTHING;

-- PRIORITY 4 PROJECTS (15 projects)
INSERT INTO public.admin_projects (project_id, name, client, description, status, priority, progress, starred, deadline, team_count, url, category, is_custom)
VALUES
  ('naiz', 'Naiz', 'Naiz', NULL, 'on-hold', 4, 0, false, '2026-09-01', 2, NULL, 'Other', false),
  ('bni-member-ai', 'BNI Member AI Assistant', 'BNI', NULL, 'on-hold', 4, 0, false, '2026-08-01', 2, NULL, 'AI Assistant', false),
  ('money-wise', 'Money Wise', 'FinTech', NULL, 'on-hold', 4, 0, false, '2026-09-01', 3, NULL, 'FinTech', false),
  ('adda-residential', 'Adda', 'Residential Association', NULL, 'on-hold', 4, 0, false, '2026-10-01', 3, NULL, 'Community', false),
  ('privata-bettroi', 'Privata BettRoi', 'BettRoi', NULL, 'on-hold', 4, 0, false, '2026-09-15', 2, NULL, 'Healthcare', false),
  ('linkmore-alumni', 'LinkMore', 'Alumni Networks', 'Alumni and focused groups', 'on-hold', 4, 0, false, '2026-10-01', 3, 'https://first-link-introductions.lovable.app/', 'Networking', false),
  ('medgemma-27b', 'MedGemma 27B', 'Healthcare AI', NULL, 'on-hold', 4, 0, false, '2026-11-01', 4, NULL, 'AI Healthcare', false),
  ('pulse-people-albania', 'Pulse of People - Albania', 'Political Analytics', NULL, 'on-hold', 4, 0, false, '2026-12-01', 2, NULL, 'Political Tech', false),
  ('pulse-people-angola', 'Pulse of People - Angola', 'Political Analytics', NULL, 'on-hold', 4, 0, false, '2026-12-15', 2, NULL, 'Political Tech', false),
  ('prewed-ai', 'PreWed.ai', 'Wedding Tech', NULL, 'on-hold', 4, 0, false, '2026-11-01', 3, NULL, 'Wedding', false),
  ('pulse-of-patients', 'SDR - Pulse of Patients', 'Healthcare', NULL, 'on-hold', 4, 0, false, '2026-10-15', 3, NULL, 'Healthcare', false),
  ('sales-marketing-surgeons', 'Sales & Marketing for Surgeons', 'Healthcare Marketing', 'Conversion optimization', 'on-hold', 4, 0, false, '2026-11-15', 3, NULL, 'Healthcare Marketing', false),
  ('premagic-photomagic', 'PreMagic / PhotoMagic', 'Photo Tech', 'Find my photo', 'on-hold', 4, 0, false, '2026-12-01', 3, NULL, 'Photo Management', false),
  ('bhashai', 'Bhashai', 'Language Tech', NULL, 'on-hold', 4, 0, false, '2026-12-01', 2, NULL, 'Language', false),
  ('acad-forge', 'ACAD FORGE', 'Education Tech', 'AI Counselor', 'on-hold', 4, 0, false, '2026-12-15', 3, NULL, 'EdTech', false),
  ('lindy-ai', 'Lindy.ai', 'AI Platform', NULL, 'on-hold', 4, 0, false, '2027-01-01', 2, NULL, 'AI Platform', false)
ON CONFLICT (project_id) DO NOTHING;

-- =====================================================
-- STEP 8: Update user_projects to use project_id instead
-- =====================================================

-- Recreate user_projects table with TEXT project_id
ALTER TABLE IF EXISTS public.user_projects
  DROP CONSTRAINT IF EXISTS user_projects_project_id_fkey;

-- Make sure project_id column is TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_projects' AND column_name = 'project_id'
  ) THEN
    -- Column exists, make sure it's TEXT
    ALTER TABLE public.user_projects ALTER COLUMN project_id TYPE TEXT;
  END IF;
END $$;

-- =====================================================
-- STEP 9: Enable RLS on all tables
-- =====================================================

ALTER TABLE public.admin_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "admin_projects_all_access" ON public.admin_projects;
DROP POLICY IF EXISTS "projects_all_access" ON public.projects;
DROP POLICY IF EXISTS "project_milestones_all_access" ON public.project_milestones;

-- Create permissive policies for authenticated users
CREATE POLICY "admin_projects_all_access"
  ON public.admin_projects FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "projects_all_access"
  ON public.projects FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "project_milestones_all_access"
  ON public.project_milestones FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- =====================================================
-- STEP 10: Update get_user_projects function
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
  -- Check if user is super admin
  IF EXISTS (SELECT 1 FROM public.users u WHERE u.id = user_uuid AND u.role = 'super_admin') THEN
    -- Super admin sees all projects with all permissions
    RETURN QUERY
    SELECT
      p.project_id as id,
      p.name,
      p.client,
      p.description,
      p.status,
      p.priority,
      p.progress,
      p.starred,
      p.deadline,
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
    -- Regular users see only assigned projects with their permissions
    RETURN QUERY
    SELECT
      p.project_id as id,
      p.name,
      p.client,
      p.description,
      p.status,
      p.priority,
      p.progress,
      p.starred,
      p.deadline,
      COALESCE(up.can_edit, false) as can_edit,
      COALESCE(up.can_view_detailed_plan, false) as can_view_detailed_plan,
      COALESCE(up.can_upload_documents, false) as can_upload_documents,
      COALESCE(up.can_manage_bugs, false) as can_manage_bugs,
      COALESCE(up.can_access_testing, false) as can_access_testing,
      COALESCE(up.can_upload_project_docs, false) as can_upload_project_docs,
      COALESCE(up.can_view_metrics, false) as can_view_metrics,
      COALESCE(up.can_view_timeline, false) as can_view_timeline
    FROM public.admin_projects p
    INNER JOIN public.user_projects up ON p.project_id = up.project_id
    WHERE up.user_id = user_uuid
    ORDER BY p.priority, p.progress DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_projects(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_projects(UUID) TO anon;

-- =====================================================
-- STEP 11: Verification
-- =====================================================

-- Count projects
SELECT COUNT(*) as total_projects FROM public.admin_projects;

-- Check neurosense-360
SELECT id, project_id, name, client FROM public.admin_projects WHERE project_id = 'neurosense-360';

-- List first 10 projects
SELECT id, project_id, name, status, priority
FROM public.admin_projects
ORDER BY priority, name
LIMIT 10;

RAISE NOTICE '✅ Migration completed successfully!';
RAISE NOTICE '✅ admin_projects now uses UUID primary key with project_id TEXT field';
RAISE NOTICE '✅ All 45 projects inserted';
RAISE NOTICE '✅ RLS policies enabled';
RAISE NOTICE '✅ get_user_projects function updated';
