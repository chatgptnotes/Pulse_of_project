-- =====================================================
-- SIMPLE UUID MIGRATION - NO DATA DELETION
-- =====================================================
-- This migration is simpler and handles view dependencies
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Enable UUID Extension
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 2: Drop dependent views to avoid errors
-- =====================================================
DROP VIEW IF EXISTS public.users_with_stats CASCADE;
RAISE NOTICE '✅ Dropped dependent views';

-- =====================================================
-- STEP 3: Drop existing tables (CASCADE will handle foreign keys)
-- =====================================================
-- Note: Data will be recreated in next steps

DROP TABLE IF EXISTS public.project_milestones CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.admin_projects CASCADE;

RAISE NOTICE '✅ Dropped old tables';

-- =====================================================
-- STEP 4: Create admin_projects with UUID
-- =====================================================

CREATE TABLE public.admin_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT UNIQUE NOT NULL, -- 'neurosense-360', etc.
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
CREATE INDEX idx_admin_projects_project_id ON public.admin_projects(project_id);
CREATE INDEX idx_admin_projects_status ON public.admin_projects(status);
CREATE INDEX idx_admin_projects_priority ON public.admin_projects(priority);
CREATE INDEX idx_admin_projects_category ON public.admin_projects(category);

RAISE NOTICE '✅ Created admin_projects table with UUID';

-- =====================================================
-- STEP 5: Create projects table with UUID
-- =====================================================

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT UNIQUE NOT NULL,
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

CREATE INDEX idx_projects_project_id ON public.projects(project_id);

RAISE NOTICE '✅ Created projects table with UUID';

-- =====================================================
-- STEP 6: Create project_milestones with UUID
-- =====================================================

CREATE TABLE public.project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id TEXT UNIQUE NOT NULL,
  project_uuid UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
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

CREATE INDEX idx_project_milestones_milestone_id ON public.project_milestones(milestone_id);
CREATE INDEX idx_project_milestones_project_uuid ON public.project_milestones(project_uuid);
CREATE INDEX idx_project_milestones_project_id ON public.project_milestones(project_id);

RAISE NOTICE '✅ Created project_milestones table with UUID';

-- =====================================================
-- STEP 7: Insert ALL 45 Projects
-- =====================================================

-- Priority 1 (14 projects)
INSERT INTO public.admin_projects (project_id, name, client, description, status, priority, progress, starred, deadline, team_count, url, category, share_token)
VALUES
  ('neurosense-360', 'NeuroSense360 & LBW', 'Limitless Brain Wellness', 'Combined Neuro360 and LBW platform', 'active', 1, 65, true, '2026-01-24', 7, NULL, 'Healthcare', 'lbw-share-x7k9p'),
  ('call-center-betser', 'Call Center for Betser', 'Betser', 'Connect to economystic.ai', 'active', 1, 45, true, '2026-02-15', 4, NULL, 'Business Operations', 'betser-cc-m3n2q'),
  ('orma', 'Orma', 'Orma', NULL, 'active', 1, 72, true, '2026-01-31', 3, 'https://orma-eight.vercel.app/', 'Business', 'orma-share-z8w4r'),
  ('4csecure', '4CSecure', '4CSecure', NULL, 'active', 1, 99, true, '2026-02-10', 5, 'https://4csecure-guide-distribution.vercel.app/', 'Security', '4csecure-view-p5t7k'),
  ('betser-life', 'Betser Life Landing Page', 'Betser', 'AI agent Bhelp app', 'active', 1, 35, true, '2026-02-20', 4, NULL, 'AI Assistant', NULL),
  ('headz-stylemy', 'Headz - StyleMy.hair', 'Headz', NULL, 'active', 1, 80, true, '2026-01-15', 6, 'www.Stylemy.hair', 'Beauty & Style', NULL),
  ('linkist-nfc', 'Linkist NFC', 'Linkist', NULL, 'active', 1, 90, true, '2025-10-16', 3, 'https://linkist-app.vercel.app/', 'Networking', NULL),
  ('economystic-ai', 'Economystic.ai', 'Betser', 'Business operations platform', 'active', 1, 55, true, '2026-02-01', 5, NULL, 'Business Operations', NULL),
  ('pulseofpeople', 'PulseOfPeople.com', 'Political Analytics', 'Voter sentiment, ward level heat maps, feedback bot, Manifesto match AI', 'active', 1, 40, true, '2026-03-01', 8, NULL, 'Political Tech', NULL),
  ('headz-ios', 'Headz iOS App', 'Headz', NULL, 'active', 1, 70, true, '2026-01-20', 4, NULL, 'Mobile App', NULL),
  ('headz-android', 'Headz Android App', 'Headz', NULL, 'active', 1, 65, true, '2026-01-25', 4, NULL, 'Mobile App', NULL),
  ('adamrit-hms', 'ADAMRIT', 'Healthcare', 'Hospital management system', 'active', 1, 25, true, '2026-04-01', 7, NULL, 'Healthcare', NULL),
  ('proposify-ai', 'Proposify AI', 'BettRoi', 'AI generated business proposal', 'active', 1, 30, true, '2026-02-28', 3, NULL, 'Business Tools', NULL),
  ('project-progress-dashboard', 'Project Progress Dashboard', 'BettRoi', 'PulseOfProject.com', 'active', 1, 85, true, '2025-12-20', 2, NULL, 'Internal Tools', NULL);

-- Priority 2 (6 projects)
INSERT INTO public.admin_projects (project_id, name, client, description, status, priority, progress, starred, deadline, team_count, url, category)
VALUES
  ('privata-site', 'Privata.site', 'Privata', NULL, 'active', 2, 48, false, '2026-03-15', 4, 'www.privata.site', 'Healthcare'),
  ('agentsdr-2men', 'AgentSDR - 2men.co', '2men', NULL, 'active', 2, 52, false, '2026-02-25', 3, NULL, 'AI Sales'),
  ('ddo-doctors', 'DDO - Doctors Digital Office', 'Healthcare', NULL, 'active', 2, 20, false, '2026-05-01', 5, NULL, 'Healthcare'),
  ('styleyour-hair', 'StyleYour.hair', 'BettRoi', 'Productise by BettRoi', 'planning', 2, 15, false, '2026-04-01', 3, NULL, 'Beauty & Style'),
  ('ai-shu', 'AI-Shu', 'Coaching Platform', 'AI Coaching assistant', 'planning', 2, 10, false, '2026-04-15', 3, NULL, 'AI Assistant'),
  ('cheripic', 'CheriPic', 'CheriPic', NULL, 'planning', 2, 5, false, '2026-05-01', 4, NULL, 'Photo Management');

-- Priority 3 (9 projects)
INSERT INTO public.admin_projects (project_id, name, client, description, status, priority, progress, starred, deadline, team_count, category)
VALUES
  ('dubai-lit-fest', 'Dubai Literature Festival', 'Dubai Lit Fest', NULL, 'planning', 3, 0, false, '2026-06-01', 3, 'Events'),
  ('pulse-of-employee', 'Pulse of Employee', 'HR Tech', NULL, 'planning', 3, 0, false, '2026-05-15', 4, 'HR Tech'),
  ('2men-co', '2men.co', '2men', NULL, 'planning', 3, 8, false, '2026-04-30', 2, 'Business'),
  ('agent-sdr', 'AgentSDR', 'Sales Tech', NULL, 'planning', 3, 12, false, '2026-05-01', 3, 'AI Sales'),
  ('customer-x', 'Customer X BettRoi', 'BettRoi', NULL, 'planning', 3, 0, false, '2026-06-01', 4, 'CRM'),
  ('bettrio-bos', 'BettRio BOS', 'BettRoi', 'Business Operating System', 'planning', 3, 5, false, '2026-07-01', 6, 'Business Operations'),
  ('privata-health', 'Privata Health/OpenHealth', 'Privata', 'Open source healthcare software', 'planning', 3, 0, false, '2026-08-01', 5, 'Healthcare'),
  ('agent-x', 'Agent X BettRoi', 'BettRoi', NULL, 'planning', 3, 0, false, '2026-06-15', 3, 'AI Agent'),
  ('apx-bettroi', 'APX - BettRoi', 'BettRoi', 'Multi agent orchestrator', 'planning', 3, 0, false, '2026-07-15', 5, 'AI Platform');

-- Priority 4 (16 projects)
INSERT INTO public.admin_projects (project_id, name, client, description, status, priority, progress, starred, deadline, team_count, url, category)
VALUES
  ('naiz', 'Naiz', 'Naiz', NULL, 'on-hold', 4, 0, false, '2026-09-01', 2, NULL, 'Other'),
  ('bni-member-ai', 'BNI Member AI Assistant', 'BNI', NULL, 'on-hold', 4, 0, false, '2026-08-01', 2, NULL, 'AI Assistant'),
  ('money-wise', 'Money Wise', 'FinTech', NULL, 'on-hold', 4, 0, false, '2026-09-01', 3, NULL, 'FinTech'),
  ('adda-residential', 'Adda', 'Residential Association', NULL, 'on-hold', 4, 0, false, '2026-10-01', 3, NULL, 'Community'),
  ('privata-bettroi', 'Privata BettRoi', 'BettRoi', NULL, 'on-hold', 4, 0, false, '2026-09-15', 2, NULL, 'Healthcare'),
  ('linkmore-alumni', 'LinkMore', 'Alumni Networks', 'Alumni and focused groups', 'on-hold', 4, 0, false, '2026-10-01', 3, 'https://first-link-introductions.lovable.app/', 'Networking'),
  ('medgemma-27b', 'MedGemma 27B', 'Healthcare AI', NULL, 'on-hold', 4, 0, false, '2026-11-01', 4, NULL, 'AI Healthcare'),
  ('pulse-people-albania', 'Pulse of People - Albania', 'Political Analytics', NULL, 'on-hold', 4, 0, false, '2026-12-01', 2, NULL, 'Political Tech'),
  ('pulse-people-angola', 'Pulse of People - Angola', 'Political Analytics', NULL, 'on-hold', 4, 0, false, '2026-12-15', 2, NULL, 'Political Tech'),
  ('prewed-ai', 'PreWed.ai', 'Wedding Tech', NULL, 'on-hold', 4, 0, false, '2026-11-01', 3, NULL, 'Wedding'),
  ('pulse-of-patients', 'SDR - Pulse of Patients', 'Healthcare', NULL, 'on-hold', 4, 0, false, '2026-10-15', 3, NULL, 'Healthcare'),
  ('sales-marketing-surgeons', 'Sales & Marketing for Surgeons', 'Healthcare Marketing', 'Conversion optimization', 'on-hold', 4, 0, false, '2026-11-15', 3, NULL, 'Healthcare Marketing'),
  ('premagic-photomagic', 'PreMagic / PhotoMagic', 'Photo Tech', 'Find my photo', 'on-hold', 4, 0, false, '2026-12-01', 3, NULL, 'Photo Management'),
  ('bhashai', 'Bhashai', 'Language Tech', NULL, 'on-hold', 4, 0, false, '2026-12-01', 2, NULL, 'Language'),
  ('acad-forge', 'ACAD FORGE', 'Education Tech', 'AI Counselor', 'on-hold', 4, 0, false, '2026-12-15', 3, NULL, 'EdTech'),
  ('lindy-ai', 'Lindy.ai', 'AI Platform', NULL, 'on-hold', 4, 0, false, '2027-01-01', 2, NULL, 'AI Platform');

RAISE NOTICE '✅ Inserted all 45 projects into admin_projects';

-- =====================================================
-- STEP 8: Enable RLS and Create Policies
-- =====================================================

ALTER TABLE public.admin_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to access
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

RAISE NOTICE '✅ Enabled RLS and created policies';

-- =====================================================
-- STEP 9: Recreate get_user_projects Function
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
    -- Super admin sees all projects
    RETURN QUERY
    SELECT
      p.project_id as id,
      p.name, p.client, p.description, p.status,
      p.priority, p.progress, p.starred, p.deadline,
      true::boolean, true::boolean, true::boolean, true::boolean,
      true::boolean, true::boolean, true::boolean, true::boolean
    FROM public.admin_projects p
    ORDER BY p.priority, p.progress DESC;
  ELSE
    -- Regular users see only assigned projects
    RETURN QUERY
    SELECT
      p.project_id as id,
      p.name, p.client, p.description, p.status,
      p.priority, p.progress, p.starred, p.deadline,
      COALESCE(up.can_edit, false),
      COALESCE(up.can_view_detailed_plan, false),
      COALESCE(up.can_upload_documents, false),
      COALESCE(up.can_manage_bugs, false),
      COALESCE(up.can_access_testing, false),
      COALESCE(up.can_upload_project_docs, false),
      COALESCE(up.can_view_metrics, false),
      COALESCE(up.can_view_timeline, false)
    FROM public.admin_projects p
    INNER JOIN public.user_projects up ON p.project_id = up.project_id
    WHERE up.user_id = user_uuid
    ORDER BY p.priority, p.progress DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_projects(UUID) TO authenticated;

RAISE NOTICE '✅ Created get_user_projects function';

-- =====================================================
-- STEP 10: Recreate users_with_stats View
-- =====================================================

CREATE OR REPLACE VIEW public.users_with_stats AS
SELECT
  u.id, u.email, u.full_name, u.role, u.is_active,
  u.created_at, u.updated_at,
  COUNT(DISTINCT up.project_id) as assigned_projects_count,
  ARRAY_AGG(DISTINCT ap.project_id) FILTER (WHERE ap.project_id IS NOT NULL) as project_ids,
  ARRAY_AGG(DISTINCT ap.name) FILTER (WHERE ap.name IS NOT NULL) as project_names
FROM public.users u
LEFT JOIN public.user_projects up ON u.id = up.user_id
LEFT JOIN public.admin_projects ap ON up.project_id = ap.project_id
GROUP BY u.id, u.email, u.full_name, u.role, u.is_active, u.created_at, u.updated_at;

GRANT SELECT ON public.users_with_stats TO authenticated;

RAISE NOTICE '✅ Recreated users_with_stats view';

-- =====================================================
-- STEP 11: Verification
-- =====================================================

-- Count projects
DO $$
DECLARE
  project_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO project_count FROM public.admin_projects;
  RAISE NOTICE '📊 Total projects: %', project_count;

  IF project_count = 45 THEN
    RAISE NOTICE '✅ SUCCESS! All 45 projects created';
  ELSE
    RAISE WARNING '⚠️ Expected 45 projects, found %', project_count;
  END IF;
END $$;

-- Check neurosense-360
SELECT id, project_id, name, client, status FROM public.admin_projects WHERE project_id = 'neurosense-360';

-- List first 10 projects
SELECT project_id, name, status, priority FROM public.admin_projects ORDER BY priority, name LIMIT 10;

RAISE NOTICE '✅✅✅ MIGRATION COMPLETED SUCCESSFULLY! ✅✅✅';
