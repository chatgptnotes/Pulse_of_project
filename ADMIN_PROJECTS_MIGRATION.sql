-- =====================================================
-- ADMIN PROJECTS MIGRATION
-- Convert Static Projects to Dynamic Supabase System
-- =====================================================
-- This SQL file:
-- 1. Creates admin_projects table
-- 2. Migrates all 45 static projects from projects.ts
-- 3. Enables full CRUD operations on projects
-- =====================================================

-- =====================================================
-- 1. CREATE TABLE: admin_projects
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_projects (
  id TEXT PRIMARY KEY,
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

-- Create indexes for better performance
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
-- 2. INSERT ALL 45 STATIC PROJECTS
-- =====================================================

-- PRIORITY 1 PROJECTS (14 projects)

INSERT INTO public.admin_projects (id, name, client, description, status, priority, progress, starred, deadline, team_count, url, category, share_token, is_custom)
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
ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO public.admin_projects (id, name, client, description, status, priority, progress, starred, deadline, team_count, url, category, share_token, is_custom)
VALUES
  ('privata-site', 'Privata.site', 'Privata', NULL, 'active', 2, 48, false, '2026-03-15', 4, 'www.privata.site', 'Healthcare', NULL, false),
  ('agentsdr-2men', 'AgentSDR - 2men.co', '2men', NULL, 'active', 2, 52, false, '2026-02-25', 3, NULL, 'AI Sales', NULL, false),
  ('ddo-doctors', 'DDO - Doctors Digital Office', 'Healthcare', NULL, 'active', 2, 20, false, '2026-05-01', 5, NULL, 'Healthcare', NULL, false),
  ('styleyour-hair', 'StyleYour.hair', 'BettRoi', 'Productise by BettRoi', 'planning', 2, 15, false, '2026-04-01', 3, NULL, 'Beauty & Style', NULL, false),
  ('ai-shu', 'AI-Shu', 'Coaching Platform', 'AI Coaching assistant', 'planning', 2, 10, false, '2026-04-15', 3, NULL, 'AI Assistant', NULL, false),
  ('cheripic', 'CheriPic', 'CheriPic', NULL, 'planning', 2, 5, false, '2026-05-01', 4, NULL, 'Photo Management', NULL, false)
ON CONFLICT (id) DO UPDATE SET
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
  category = EXCLUDED.category;

-- PRIORITY 3 PROJECTS (10 projects)

INSERT INTO public.admin_projects (id, name, client, description, status, priority, progress, starred, deadline, team_count, url, category, share_token, is_custom)
VALUES
  ('dubai-lit-fest', 'Dubai Literature Festival', 'Dubai Lit Fest', NULL, 'planning', 3, 0, false, '2026-06-01', 3, NULL, 'Events', NULL, false),
  ('pulse-of-employee', 'Pulse of Employee', 'HR Tech', NULL, 'planning', 3, 0, false, '2026-05-15', 4, NULL, 'HR Tech', NULL, false),
  ('2men-co', '2men.co', '2men', NULL, 'planning', 3, 8, false, '2026-04-30', 2, NULL, 'Business', NULL, false),
  ('agent-sdr', 'AgentSDR', 'Sales Tech', NULL, 'planning', 3, 12, false, '2026-05-01', 3, NULL, 'AI Sales', NULL, false),
  ('customer-x', 'Customer X BettRoi', 'BettRoi', NULL, 'planning', 3, 0, false, '2026-06-01', 4, NULL, 'CRM', NULL, false),
  ('bettrio-bos', 'BettRio BOS', 'BettRoi', 'Business Operating System', 'planning', 3, 5, false, '2026-07-01', 6, NULL, 'Business Operations', NULL, false),
  ('privata-health', 'Privata Health/OpenHealth', 'Privata', 'Open source healthcare software', 'planning', 3, 0, false, '2026-08-01', 5, NULL, 'Healthcare', NULL, false),
  ('agent-x', 'Agent X BettRoi', 'BettRoi', NULL, 'planning', 3, 0, false, '2026-06-15', 3, NULL, 'AI Agent', NULL, false),
  ('apx-bettroi', 'APX - BettRoi', 'BettRoi', 'Multi agent orchestrator', 'planning', 3, 0, false, '2026-07-15', 5, NULL, 'AI Platform', NULL, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  client = EXCLUDED.client,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  progress = EXCLUDED.progress,
  deadline = EXCLUDED.deadline,
  team_count = EXCLUDED.team_count,
  category = EXCLUDED.category;

-- PRIORITY 4 PROJECTS (15 projects)

INSERT INTO public.admin_projects (id, name, client, description, status, priority, progress, starred, deadline, team_count, url, category, share_token, is_custom)
VALUES
  ('naiz', 'Naiz', 'Naiz', NULL, 'on-hold', 4, 0, false, '2026-09-01', 2, NULL, 'Other', NULL, false),
  ('bni-member-ai', 'BNI Member AI Assistant', 'BNI', NULL, 'on-hold', 4, 0, false, '2026-08-01', 2, NULL, 'AI Assistant', NULL, false),
  ('money-wise', 'Money Wise', 'FinTech', NULL, 'on-hold', 4, 0, false, '2026-09-01', 3, NULL, 'FinTech', NULL, false),
  ('adda-residential', 'Adda', 'Residential Association', NULL, 'on-hold', 4, 0, false, '2026-10-01', 3, NULL, 'Community', NULL, false),
  ('privata-bettroi', 'Privata BettRoi', 'BettRoi', NULL, 'on-hold', 4, 0, false, '2026-09-15', 2, NULL, 'Healthcare', NULL, false),
  ('linkmore-alumni', 'LinkMore', 'Alumni Networks', 'Alumni and focused groups', 'on-hold', 4, 0, false, '2026-10-01', 3, 'https://first-link-introductions.lovable.app/', 'Networking', NULL, false),
  ('medgemma-27b', 'MedGemma 27B', 'Healthcare AI', NULL, 'on-hold', 4, 0, false, '2026-11-01', 4, NULL, 'AI Healthcare', NULL, false),
  ('pulse-people-albania', 'Pulse of People - Albania', 'Political Analytics', NULL, 'on-hold', 4, 0, false, '2026-12-01', 2, NULL, 'Political Tech', NULL, false),
  ('pulse-people-angola', 'Pulse of People - Angola', 'Political Analytics', NULL, 'on-hold', 4, 0, false, '2026-12-15', 2, NULL, 'Political Tech', NULL, false),
  ('prewed-ai', 'PreWed.ai', 'Wedding Tech', NULL, 'on-hold', 4, 0, false, '2026-11-01', 3, NULL, 'Wedding', NULL, false),
  ('pulse-of-patients', 'SDR - Pulse of Patients', 'Healthcare', NULL, 'on-hold', 4, 0, false, '2026-10-15', 3, NULL, 'Healthcare', NULL, false),
  ('sales-marketing-surgeons', 'Sales & Marketing for Surgeons', 'Healthcare Marketing', 'Conversion optimization', 'on-hold', 4, 0, false, '2026-11-15', 3, NULL, 'Healthcare Marketing', NULL, false),
  ('premagic-photomagic', 'PreMagic / PhotoMagic', 'Photo Tech', 'Find my photo', 'on-hold', 4, 0, false, '2026-12-01', 3, NULL, 'Photo Management', NULL, false),
  ('bhashai', 'Bhashai', 'Language Tech', NULL, 'on-hold', 4, 0, false, '2026-12-01', 2, NULL, 'Language', NULL, false),
  ('acad-forge', 'ACAD FORGE', 'Education Tech', 'AI Counselor', 'on-hold', 4, 0, false, '2026-12-15', 3, NULL, 'EdTech', NULL, false),
  ('lindy-ai', 'Lindy.ai', 'AI Platform', NULL, 'on-hold', 4, 0, false, '2027-01-01', 2, NULL, 'AI Platform', NULL, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  client = EXCLUDED.client,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  deadline = EXCLUDED.deadline,
  team_count = EXCLUDED.team_count,
  url = EXCLUDED.url,
  category = EXCLUDED.category;

-- =====================================================
-- 3. VERIFICATION QUERIES
-- =====================================================

-- Count total projects
SELECT COUNT(*) as total_projects FROM public.admin_projects;

-- Count by priority
SELECT priority, COUNT(*) as count
FROM public.admin_projects
GROUP BY priority
ORDER BY priority;

-- Count by status
SELECT status, COUNT(*) as count
FROM public.admin_projects
GROUP BY status
ORDER BY
  CASE status
    WHEN 'active' THEN 1
    WHEN 'planning' THEN 2
    WHEN 'completed' THEN 3
    WHEN 'on-hold' THEN 4
  END;

-- View all projects summary
SELECT
  id,
  name,
  client,
  status,
  priority,
  progress,
  starred,
  category
FROM public.admin_projects
ORDER BY priority, progress DESC;

-- =====================================================
-- SUCCESS MESSAGEadmin
-- =====================================================
-- ✅ Migration Complete!
-- • admin_projects table created
-- • 45 static projects migrated to database
-- • All projects now manageable via CRUD operations
-- • Ready for dynamic AdminPage integration
-- =====================================================
