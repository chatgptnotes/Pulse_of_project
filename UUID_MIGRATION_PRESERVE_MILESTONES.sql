 
 -- =====================================================
-- UUID MIGRATION - PRESERVE EXISTING MILESTONE DATA
-- =====================================================
-- This migration preserves existing project milestone data
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Enable UUID Extension
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 2: Backup Existing Milestone Data
-- =====================================================

-- Create temporary backup table for milestones
CREATE TEMP TABLE IF NOT EXISTS milestones_backup AS
SELECT * FROM public.project_milestones;

-- Check how many milestones were backed up
DO $$
DECLARE
  backup_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO backup_count FROM milestones_backup;
  RAISE NOTICE 'Backed up % milestone records', backup_count;
END $$;

-- =====================================================
-- STEP 3: Backup Existing Projects Data (if any)
-- =====================================================

CREATE TEMP TABLE IF NOT EXISTS projects_backup AS
SELECT * FROM public.projects;

-- =====================================================
-- STEP 4: Drop dependent views
-- =====================================================

DROP VIEW IF EXISTS public.users_with_stats CASCADE;

-- =====================================================
-- STEP 5: Drop existing tables
-- =====================================================

DROP TABLE IF EXISTS public.project_milestones CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.admin_projects CASCADE;

-- =====================================================
-- STEP 6: Create admin_projects with UUID
-- =====================================================

CREATE TABLE public.admin_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT UNIQUE NOT NULL,
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

CREATE INDEX idx_admin_projects_project_id ON public.admin_projects(project_id);
CREATE INDEX idx_admin_projects_status ON public.admin_projects(status);
CREATE INDEX idx_admin_projects_priority ON public.admin_projects(priority);
CREATE INDEX idx_admin_projects_category ON public.admin_projects(category);

-- =====================================================
-- STEP 7: Create projects table with UUID
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

-- =====================================================
-- STEP 8: Create project_milestones with UUID
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

-- =====================================================
-- STEP 9: Insert ALL 45 Projects into admin_projects
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

INSERT INTO public.admin_projects (project_id, name, client, description, status, priority, progress, starred, deadline, team_count, url, category)
VALUES
  ('privata-site', 'Privata.site', 'Privata', NULL, 'active', 2, 48, false, '2026-03-15', 4, 'www.privata.site', 'Healthcare'),
  ('agentsdr-2men', 'AgentSDR - 2men.co', '2men', NULL, 'active', 2, 52, false, '2026-02-25', 3, NULL, 'AI Sales'),
  ('ddo-doctors', 'DDO - Doctors Digital Office', 'Healthcare', NULL, 'active', 2, 20, false, '2026-05-01', 5, NULL, 'Healthcare'),
  ('styleyour-hair', 'StyleYour.hair', 'BettRoi', 'Productise by BettRoi', 'planning', 2, 15, false, '2026-04-01', 3, NULL, 'Beauty & Style'),
  ('ai-shu', 'AI-Shu', 'Coaching Platform', 'AI Coaching assistant', 'planning', 2, 10, false, '2026-04-15', 3, NULL, 'AI Assistant'),
  ('cheripic', 'CheriPic', 'CheriPic', NULL, 'planning', 2, 5, false, '2026-05-01', 4, NULL, 'Photo Management');

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

-- =====================================================
-- STEP 10: Restore Projects from Backup
-- =====================================================

-- Insert projects from backup if any exist
INSERT INTO public.projects (project_id, name, description, client, start_date, end_date, status, overall_progress, created_at, updated_at)
SELECT
  COALESCE(id, project_id) as project_id,  -- Use id if project_id doesn't exist
  name,
  description,
  client,
  start_date,
  end_date,
  status,
  overall_progress,
  created_at,
  updated_at
FROM projects_backup
ON CONFLICT (project_id) DO NOTHING;

-- =====================================================
-- STEP 11: Restore Milestones from Backup
-- =====================================================

-- First insert into projects table for any projects that have milestones but don't exist yet
INSERT INTO public.projects (project_id, name, description, client, start_date, end_date, status, overall_progress)
SELECT DISTINCT
  mb.project_id,
  'Project ' || mb.project_id as name,
  'Migrated project' as description,
  'Client' as client,
  NOW() as start_date,
  NOW() + interval '180 days' as end_date,
  'active' as status,
  0 as overall_progress
FROM milestones_backup mb
WHERE NOT EXISTS (
  SELECT 1 FROM public.projects p WHERE p.project_id = mb.project_id
)
ON CONFLICT (project_id) DO NOTHING;

-- Now restore the milestones
-- Link them to the new UUID project_id using the text project_id
INSERT INTO public.project_milestones (
  milestone_id,
  project_uuid,
  project_id,
  name,
  description,
  status,
  start_date,
  end_date,
  progress,
  deliverables,
  assigned_to,
  dependencies,
  "order",
  color,
  kpis,
  created_at,
  updated_at
)
SELECT
  COALESCE(mb.id, mb.milestone_id, 'milestone-' || mb.project_id || '-' || mb."order") as milestone_id,
  p.id as project_uuid,  -- Link to new UUID
  mb.project_id,
  mb.name,
  mb.description,
  mb.status,
  mb.start_date,
  mb.end_date,
  mb.progress,
  mb.deliverables,
  mb.assigned_to,
  mb.dependencies,
  mb."order",
  COALESCE(mb.color, '#4F46E5') as color,
  COALESCE(mb.kpis, '[]'::jsonb) as kpis,
  mb.created_at,
  mb.updated_at
FROM milestones_backup mb
JOIN public.projects p ON p.project_id = mb.project_id
ON CONFLICT (milestone_id) DO NOTHING;

-- Report how many milestones were restored
DO $$
DECLARE
  restored_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO restored_count FROM public.project_milestones;
  RAISE NOTICE 'Restored % milestone records', restored_count;
END $$;

-- =====================================================
-- STEP 12: Enable RLS and Create Policies
-- =====================================================

ALTER TABLE public.admin_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

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
-- STEP 13: Recreate get_user_projects Function
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
  IF EXISTS (SELECT 1 FROM public.users u WHERE u.id = user_uuid AND u.role = 'super_admin') THEN
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

-- =====================================================
-- STEP 14: Recreate users_with_stats View
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

-- =====================================================
-- Verification
-- =====================================================

SELECT COUNT(*) as total_projects FROM public.admin_projects;
SELECT COUNT(*) as total_milestones FROM public.project_milestones;
SELECT project_id, name, COUNT(pm.id) as milestone_count
FROM public.projects p
LEFT JOIN public.project_milestones pm ON p.id = pm.project_uuid
GROUP BY p.project_id, p.name
ORDER BY milestone_count DESC
LIMIT 10;
