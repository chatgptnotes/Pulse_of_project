-- =====================================================
-- COMPLETE MILESTONE IMPORT FROM CSV
-- =====================================================
-- This script imports all 64 milestone records from CSV
-- Uses UUID for primary keys (id), TEXT for milestone_id
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: Drop existing tables and recreate with UUID schema
-- =====================================================

-- Drop existing tables to recreate with correct schema
DROP TABLE IF EXISTS public.project_milestones CASCADE;
DROP TABLE IF EXISTS public.admin_projects CASCADE;

-- Create admin_projects table (main projects table)
CREATE TABLE public.admin_projects (
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

-- Create project_milestones table
CREATE TABLE public.project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id TEXT UNIQUE NOT NULL,
  project_uuid UUID REFERENCES public.admin_projects(id) ON DELETE CASCADE,
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

-- Enable RLS on both tables
ALTER TABLE public.admin_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- Create permissive RLS policies for admin_projects
CREATE POLICY "Allow all operations on admin_projects" ON public.admin_projects
  FOR ALL USING (true) WITH CHECK (true);

-- Create permissive RLS policies for project_milestones
CREATE POLICY "Allow all operations on project_milestones" ON public.project_milestones
  FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- STEP 2: Insert all projects into admin_projects (16 unique projects)
-- =====================================================

INSERT INTO public.admin_projects (project_id, name, description, client, start_date, end_date, status, overall_progress)
VALUES
  ('4csecure-full-stack', '4CSecure Full Stack', 'Complete security guide distribution platform', '4CSecure', '2025-11-06', '2026-01-15', 'active', 90),
  ('4csecure', '4CSecure', 'Security guide platform', '4CSecure', '2025-08-01', '2026-02-10', 'active', 99),
  ('adamrit-hms', 'ADAMRIT HMS', 'Hospital management system', 'Healthcare', '2025-11-01', '2026-04-01', 'active', 25),
  ('betser-life', 'Betser Life Landing Page', 'AI agent Bhelp app landing page', 'Betser', '2025-11-01', '2026-02-20', 'active', 35),
  ('call-center-betser', 'Call Center for Betser', 'Connect to economystic.ai', 'Betser', '2025-11-01', '2026-02-15', 'active', 45),
  ('economystic-ai', 'Economystic.ai', 'Business operations platform', 'Betser', '2025-09-01', '2026-02-01', 'active', 55),
  ('headz-android', 'Headz Android App', 'Android app for hair styling', 'Headz', '2025-09-01', '2026-01-25', 'active', 65),
  ('headz-ios', 'Headz iOS App', 'iOS app for hair styling', 'Headz', '2025-09-01', '2026-01-20', 'active', 70),
  ('headz-stylemy', 'Headz - StyleMy.hair', 'AI hair styling platform', 'Headz', '2025-08-01', '2026-01-15', 'active', 80),
  ('linkist-nfc', 'Linkist NFC', 'NFC business card platform', 'Linkist', '2025-10-01', '2025-10-16', 'active', 90),
  ('linkist-mvp', 'Linkist MVP', 'Linkist minimum viable product', 'Linkist', '2025-11-06', '2026-01-15', 'active', 50),
  ('neurosense-mvp', 'NeuroSense360 MVP', 'Brain health platform MVP', 'Limitless Brain Wellness', '2025-11-12', '2026-01-24', 'active', 65),
  ('orma', 'Orma', 'Business management platform', 'Orma', '2025-09-01', '2026-01-31', 'active', 72),
  ('proposify-ai', 'Proposify AI', 'AI generated business proposal', 'BettRoi', '2025-11-01', '2026-02-28', 'active', 30),
  ('project-progress-dashboard', 'Project Progress Dashboard', 'PulseOfProject.com', 'BettRoi', '2025-10-01', '2025-12-20', 'active', 85),
  ('pulseofpeople', 'PulseOfPeople.com', 'Voter sentiment and analytics', 'Political Analytics', '2025-10-01', '2026-03-01', 'active', 40)
ON CONFLICT (project_id) DO NOTHING;

-- =====================================================
-- STEP 3: Insert all 64 milestones from CSV
-- =====================================================

-- 4csecure-full-stack milestones (10 milestones)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  '4csecure-full-stack-milestone-1',
  p.id,
  '4csecure-full-stack',
  'Phase 1: Foundation',
  'Phase 1 of project development',
  'completed',
  '2025-11-06 00:00:00'::timestamp,
  '2025-11-13 00:00:00'::timestamp,
  100,
  '[{"id":"4csecure-full-stack-del-1-1","text":"Complete core functionality","completed":true},{"id":"4csecure-full-stack-del-1-2","text":"Write documentation","completed":true},{"id":"4csecure-full-stack-del-1-3","text":"Pass quality checks","completed":true}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY[]::text[],
  1,
  '#4F46E5',
  '2025-11-06 10:38:46.515168'::timestamp,
  '2025-11-06 10:38:46.515168'::timestamp
FROM public.admin_projects p WHERE p.project_id = '4csecure-full-stack'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  '4csecure-full-stack-milestone-2',
  p.id,
  '4csecure-full-stack',
  'Phase 2: Development',
  'Phase 2 of project development',
  'completed',
  '2025-11-13 00:00:00'::timestamp,
  '2025-11-20 00:00:00'::timestamp,
  100,
  '[{"id":"4csecure-full-stack-del-2-1","text":"Complete core functionality","completed":true},{"id":"4csecure-full-stack-del-2-2","text":"Write documentation","completed":true},{"id":"4csecure-full-stack-del-2-3","text":"Pass quality checks","completed":true}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['4csecure-full-stack-milestone-1']::text[],
  2,
  '#4F46E5',
  '2025-11-06 10:38:46.658509'::timestamp,
  '2025-11-06 10:38:46.658509'::timestamp
FROM public.admin_projects p WHERE p.project_id = '4csecure-full-stack'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  '4csecure-full-stack-milestone-3',
  p.id,
  '4csecure-full-stack',
  'Phase 3: Integration',
  'Phase 3 of project development',
  'completed',
  '2025-11-20 00:00:00'::timestamp,
  '2025-11-27 00:00:00'::timestamp,
  100,
  '[{"id":"4csecure-full-stack-del-3-1","text":"Complete core functionality","completed":true},{"id":"4csecure-full-stack-del-3-2","text":"Write documentation","completed":true},{"id":"4csecure-full-stack-del-3-3","text":"Pass quality checks","completed":true}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['4csecure-full-stack-milestone-2']::text[],
  3,
  '#4F46E5',
  '2025-11-06 10:38:46.820384'::timestamp,
  '2025-11-06 10:38:46.820384'::timestamp
FROM public.admin_projects p WHERE p.project_id = '4csecure-full-stack'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  '4csecure-full-stack-milestone-4',
  p.id,
  '4csecure-full-stack',
  'Phase 4: Testing',
  'Phase 4 of project development',
  'completed',
  '2025-11-27 00:00:00'::timestamp,
  '2025-12-04 00:00:00'::timestamp,
  100,
  '[{"id":"4csecure-full-stack-del-4-1","text":"Complete core functionality","completed":true},{"id":"4csecure-full-stack-del-4-2","text":"Write documentation","completed":true},{"id":"4csecure-full-stack-del-4-3","text":"Pass quality checks","completed":true}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['4csecure-full-stack-milestone-3']::text[],
  4,
  '#4F46E5',
  '2025-11-06 10:38:46.973478'::timestamp,
  '2025-11-06 10:38:46.973478'::timestamp
FROM public.admin_projects p WHERE p.project_id = '4csecure-full-stack'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  '4csecure-full-stack-milestone-5',
  p.id,
  '4csecure-full-stack',
  'Phase 5: Polish',
  'Phase 5 of project development',
  'completed',
  '2025-12-04 00:00:00'::timestamp,
  '2025-12-11 00:00:00'::timestamp,
  100,
  '[{"id":"4csecure-full-stack-del-5-1","text":"Complete core functionality","completed":true},{"id":"4csecure-full-stack-del-5-2","text":"Write documentation","completed":true},{"id":"4csecure-full-stack-del-5-3","text":"Pass quality checks","completed":true}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['4csecure-full-stack-milestone-4']::text[],
  5,
  '#4F46E5',
  '2025-11-06 10:38:47.11664'::timestamp,
  '2025-11-06 10:38:47.11664'::timestamp
FROM public.admin_projects p WHERE p.project_id = '4csecure-full-stack'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  '4csecure-full-stack-milestone-6',
  p.id,
  '4csecure-full-stack',
  'Phase 6: Deployment',
  'Phase 6 of project development',
  'completed',
  '2025-12-11 00:00:00'::timestamp,
  '2025-12-18 00:00:00'::timestamp,
  100,
  '[{"id":"4csecure-full-stack-del-6-1","text":"Complete core functionality","completed":true},{"id":"4csecure-full-stack-del-6-2","text":"Write documentation","completed":true},{"id":"4csecure-full-stack-del-6-3","text":"Pass quality checks","completed":true}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['4csecure-full-stack-milestone-5']::text[],
  6,
  '#4F46E5',
  '2025-11-06 10:38:47.306846'::timestamp,
  '2025-11-06 10:38:47.306846'::timestamp
FROM public.admin_projects p WHERE p.project_id = '4csecure-full-stack'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  '4csecure-full-stack-milestone-7',
  p.id,
  '4csecure-full-stack',
  'Phase 7: Launch',
  'Phase 7 of project development',
  'completed',
  '2025-12-18 00:00:00'::timestamp,
  '2025-12-25 00:00:00'::timestamp,
  100,
  '[{"id":"4csecure-full-stack-del-7-1","text":"Complete core functionality","completed":true},{"id":"4csecure-full-stack-del-7-2","text":"Write documentation","completed":true},{"id":"4csecure-full-stack-del-7-3","text":"Pass quality checks","completed":true}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['4csecure-full-stack-milestone-6']::text[],
  7,
  '#4F46E5',
  '2025-11-06 10:38:47.446218'::timestamp,
  '2025-11-06 10:38:47.446218'::timestamp
FROM public.admin_projects p WHERE p.project_id = '4csecure-full-stack'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  '4csecure-full-stack-milestone-8',
  p.id,
  '4csecure-full-stack',
  'Phase 8: Optimization',
  'Phase 8 of project development',
  'completed',
  '2025-12-25 00:00:00'::timestamp,
  '2026-01-01 00:00:00'::timestamp,
  100,
  '[{"id":"4csecure-full-stack-del-8-1","text":"Complete core functionality","completed":true},{"id":"4csecure-full-stack-del-8-2","text":"Write documentation","completed":true},{"id":"4csecure-full-stack-del-8-3","text":"Pass quality checks","completed":true}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['4csecure-full-stack-milestone-7']::text[],
  8,
  '#4F46E5',
  '2025-11-06 10:38:47.601502'::timestamp,
  '2025-11-06 10:38:47.601502'::timestamp
FROM public.admin_projects p WHERE p.project_id = '4csecure-full-stack'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  '4csecure-full-stack-milestone-9',
  p.id,
  '4csecure-full-stack',
  'Phase 9: Scale',
  'Phase 9 of project development',
  'completed',
  '2026-01-01 00:00:00'::timestamp,
  '2026-01-08 00:00:00'::timestamp,
  100,
  '[{"id":"4csecure-full-stack-del-9-1","text":"Complete core functionality","completed":true},{"id":"4csecure-full-stack-del-9-2","text":"Write documentation","completed":true},{"id":"4csecure-full-stack-del-9-3","text":"Pass quality checks","completed":true}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['4csecure-full-stack-milestone-8']::text[],
  9,
  '#4F46E5',
  '2025-11-06 10:38:47.74493'::timestamp,
  '2025-11-06 10:38:47.74493'::timestamp
FROM public.admin_projects p WHERE p.project_id = '4csecure-full-stack'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  '4csecure-full-stack-milestone-10',
  p.id,
  '4csecure-full-stack',
  'Phase 10: Completion',
  'Phase 10 of project development',
  'in-progress',
  '2026-01-08 00:00:00'::timestamp,
  '2026-01-15 00:00:00'::timestamp,
  90,
  '[{"id":"4csecure-full-stack-del-10-1","text":"Complete core functionality","completed":false},{"id":"4csecure-full-stack-del-10-2","text":"Write documentation","completed":false},{"id":"4csecure-full-stack-del-10-3","text":"Pass quality checks","completed":false}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['4csecure-full-stack-milestone-9']::text[],
  10,
  '#4F46E5',
  '2025-11-06 10:38:47.895156'::timestamp,
  '2025-11-06 10:38:47.895156'::timestamp
FROM public.admin_projects p WHERE p.project_id = '4csecure-full-stack'
ON CONFLICT (milestone_id) DO NOTHING;

-- 4csecure milestones (4 milestones)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  '4csecure-m1',
  p.id,
  '4csecure',
  'Phase 1: Guide Distribution',
  'Complete guide distribution and tracking',
  'completed',
  '2025-08-01 00:00:00'::timestamp,
  '2025-09-30 00:00:00'::timestamp,
  100,
  '[{"id":"4cs-1-1","text":"Guide upload and management","completed":true},{"id":"4cs-1-2","text":"User access controls","completed":true},{"id":"4cs-1-3","text":"Version tracking system","completed":true},{"id":"4cs-1-4","text":"Distribution analytics","completed":true}]'::jsonb,
  ARRAY['Full Stack Team']::text[],
  ARRAY[]::text[],
  1,
  '#DC2626',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = '4csecure'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  '4csecure-m2',
  p.id,
  '4csecure',
  'Phase 2: Final Polish',
  'Testing and production deployment',
  'in-progress',
  '2025-10-01 00:00:00'::timestamp,
  '2026-02-10 00:00:00'::timestamp,
  95,
  '[{"id":"4cs-2-1","text":"Performance optimization","completed":true},{"id":"4cs-2-2","text":"Security audit","completed":true},{"id":"4cs-2-3","text":"Production deployment","completed":false}]'::jsonb,
  ARRAY['DevOps','QA Team']::text[],
  ARRAY['4csecure-m1']::text[],
  2,
  '#059669',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = '4csecure'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  '4csecure-milestone-1',
  p.id,
  '4csecure',
  'Phase 1: Security Guide Platform',
  'Complete guide distribution and tracking',
  'completed',
  '2025-08-01 00:00:00'::timestamp,
  '2025-09-30 00:00:00'::timestamp,
  100,
  '[{"id":"del-4cs-1-1","text":"Guide upload and management","completed":true},{"id":"del-4cs-1-2","text":"User access controls","completed":true},{"id":"del-4cs-1-3","text":"Version tracking system","completed":true},{"id":"del-4cs-1-4","text":"Distribution analytics","completed":true},{"id":"del-4cs-1-5","text":"Email notifications","completed":true},{"id":"del-4cs-1-6","text":"Mobile responsive design","completed":true}]'::jsonb,
  ARRAY['Full Stack Team']::text[],
  ARRAY[]::text[],
  1,
  '#DC2626',
  '2025-11-12 06:31:45.892618'::timestamp,
  '2025-11-12 06:31:45.892618'::timestamp
FROM public.admin_projects p WHERE p.project_id = '4csecure'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  '4csecure-milestone-2',
  p.id,
  '4csecure',
  'Phase 2: Final Polish & Deployment',
  'Final testing and production deployment',
  'in-progress',
  '2025-10-01 00:00:00'::timestamp,
  '2026-02-10 00:00:00'::timestamp,
  95,
  '[{"id":"del-4cs-2-1","text":"Performance optimization","completed":true},{"id":"del-4cs-2-2","text":"Security audit","completed":true},{"id":"del-4cs-2-3","text":"Production deployment","completed":false},{"id":"del-4cs-2-4","text":"User training documentation","completed":true}]'::jsonb,
  ARRAY['DevOps','QA Team']::text[],
  ARRAY['4csecure-milestone-1']::text[],
  2,
  '#059669',
  '2025-11-12 06:31:45.892618'::timestamp,
  '2025-11-12 06:31:45.892618'::timestamp
FROM public.admin_projects p WHERE p.project_id = '4csecure'
ON CONFLICT (milestone_id) DO NOTHING;

-- adamrit-hms milestones (2 milestones)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'adamrit-m1',
  p.id,
  'adamrit-hms',
  'Phase 1: Core HMS Setup',
  'Basic hospital management features',
  'in-progress',
  '2025-11-01 00:00:00'::timestamp,
  '2026-01-01 00:00:00'::timestamp,
  30,
  '[{"id":"adm-1-1","text":"Patient registration system","completed":false},{"id":"adm-1-2","text":"Doctor management","completed":false},{"id":"adm-1-3","text":"Appointment scheduling","completed":false},{"id":"adm-1-4","text":"Medical records database","completed":false}]'::jsonb,
  ARRAY['Backend Team','Frontend Team']::text[],
  ARRAY[]::text[],
  1,
  '#DC2626',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'adamrit-hms'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'adamrit-m2',
  p.id,
  'adamrit-hms',
  'Phase 2: Advanced HMS Features',
  'Billing, pharmacy, and inventory',
  'pending',
  '2026-01-02 00:00:00'::timestamp,
  '2026-03-01 00:00:00'::timestamp,
  0,
  '[{"id":"adm-2-1","text":"Billing and invoicing","completed":false},{"id":"adm-2-2","text":"Pharmacy management","completed":false},{"id":"adm-2-3","text":"Inventory tracking","completed":false}]'::jsonb,
  ARRAY['Full Stack Team']::text[],
  ARRAY['adamrit-m1']::text[],
  2,
  '#F59E0B',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'adamrit-hms'
ON CONFLICT (milestone_id) DO NOTHING;

-- betser-life milestones (2 milestones)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'betser-life-m1',
  p.id,
  'betser-life',
  'Phase 1: Landing Page Design',
  'Design and develop landing page',
  'in-progress',
  '2025-11-01 00:00:00'::timestamp,
  '2025-12-01 00:00:00'::timestamp,
  40,
  '[{"id":"bl-1-1","text":"UI/UX design mockups","completed":true},{"id":"bl-1-2","text":"Responsive layout implementation","completed":false},{"id":"bl-1-3","text":"AI features showcase section","completed":false},{"id":"bl-1-4","text":"CTA and conversion optimization","completed":false}]'::jsonb,
  ARRAY['Frontend Team','UI/UX Designer']::text[],
  ARRAY[]::text[],
  1,
  '#EC4899',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'betser-life'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'betser-life-m2',
  p.id,
  'betser-life',
  'Phase 2: Integration & Launch',
  'API integration and deployment',
  'pending',
  '2025-12-02 00:00:00'::timestamp,
  '2026-01-15 00:00:00'::timestamp,
  0,
  '[{"id":"bl-2-1","text":"Backend API integration","completed":false},{"id":"bl-2-2","text":"Analytics setup","completed":false},{"id":"bl-2-3","text":"Production deployment","completed":false}]'::jsonb,
  ARRAY['Full Stack Team']::text[],
  ARRAY['betser-life-m1']::text[],
  2,
  '#8B5CF6',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'betser-life'
ON CONFLICT (milestone_id) DO NOTHING;

-- call-center-betser milestones (4 milestones)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'call-center-betser-milestone-1',
  p.id,
  'call-center-betser',
  'Phase 1: Call Center Infrastructure',
  'Core call handling and routing system',
  'in-progress',
  '2025-11-01 00:00:00'::timestamp,
  '2025-12-01 00:00:00'::timestamp,
  50,
  '[{"id":"del-cc-1-1","text":"VoIP integration setup","completed":true},{"id":"del-cc-1-2","text":"Call routing logic","completed":false},{"id":"del-cc-1-3","text":"Agent dashboard","completed":false},{"id":"del-cc-1-4","text":"Call recording system","completed":false},{"id":"del-cc-1-5","text":"Real-time analytics","completed":false}]'::jsonb,
  ARRAY['Backend Team','Frontend Team']::text[],
  ARRAY[]::text[],
  1,
  '#3B82F6',
  '2025-11-12 06:31:45.892618'::timestamp,
  '2025-11-12 06:31:45.892618'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'call-center-betser'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'call-center-betser-milestone-2',
  p.id,
  'call-center-betser',
  'Phase 2: AI Integration with Economystic.ai',
  'Connect to economystic.ai for intelligent call handling',
  'pending',
  '2025-12-02 00:00:00'::timestamp,
  '2026-01-15 00:00:00'::timestamp,
  0,
  '[{"id":"del-cc-2-1","text":"Economystic.ai API integration","completed":false},{"id":"del-cc-2-2","text":"AI-powered call transcription","completed":false},{"id":"del-cc-2-3","text":"Sentiment analysis","completed":false},{"id":"del-cc-2-4","text":"Automated call summaries","completed":false},{"id":"del-cc-2-5","text":"Intelligent call routing","completed":false}]'::jsonb,
  ARRAY['AI Team','Backend Team']::text[],
  ARRAY['call-center-betser-milestone-1']::text[],
  2,
  '#8B5CF6',
  '2025-11-12 06:31:45.892618'::timestamp,
  '2025-11-12 06:31:45.892618'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'call-center-betser'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'call-center-m1',
  p.id,
  'call-center-betser',
  'Phase 1: VoIP Infrastructure',
  'Core call handling and routing system',
  'in-progress',
  '2025-11-01 00:00:00'::timestamp,
  '2025-12-01 00:00:00'::timestamp,
  50,
  '[{"id":"cc-1-1","text":"VoIP integration setup","completed":true},{"id":"cc-1-2","text":"Call routing logic","completed":false},{"id":"cc-1-3","text":"Agent dashboard","completed":false},{"id":"cc-1-4","text":"Call recording system","completed":false}]'::jsonb,
  ARRAY['Backend Team','Frontend Team']::text[],
  ARRAY[]::text[],
  1,
  '#3B82F6',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'call-center-betser'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'call-center-m2',
  p.id,
  'call-center-betser',
  'Phase 2: AI Integration',
  'Connect to economystic.ai for intelligent call handling',
  'pending',
  '2025-12-02 00:00:00'::timestamp,
  '2026-01-15 00:00:00'::timestamp,
  0,
  '[{"id":"cc-2-1","text":"Economystic.ai API integration","completed":false},{"id":"cc-2-2","text":"AI-powered call transcription","completed":false},{"id":"cc-2-3","text":"Sentiment analysis","completed":false}]'::jsonb,
  ARRAY['AI Team','Backend Team']::text[],
  ARRAY['call-center-m1']::text[],
  2,
  '#8B5CF6',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'call-center-betser'
ON CONFLICT (milestone_id) DO NOTHING;

-- economystic-ai milestones (2 milestones)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'economystic-m1',
  p.id,
  'economystic-ai',
  'Phase 1: AI Foundation',
  'Core AI engine development',
  'in-progress',
  '2025-09-01 00:00:00'::timestamp,
  '2025-11-01 00:00:00'::timestamp,
  60,
  '[{"id":"eco-1-1","text":"AI model training","completed":true},{"id":"eco-1-2","text":"API infrastructure","completed":false},{"id":"eco-1-3","text":"Data pipeline setup","completed":false}]'::jsonb,
  ARRAY['AI Team','Backend Team']::text[],
  ARRAY[]::text[],
  1,
  '#3B82F6',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'economystic-ai'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'economystic-m2',
  p.id,
  'economystic-ai',
  'Phase 2: Business Features',
  'Business operations modules',
  'pending',
  '2025-11-02 00:00:00'::timestamp,
  '2026-01-01 00:00:00'::timestamp,
  20,
  '[{"id":"eco-2-1","text":"Document processing","completed":false},{"id":"eco-2-2","text":"Analytics dashboard","completed":false},{"id":"eco-2-3","text":"Workflow automation","completed":false}]'::jsonb,
  ARRAY['Full Stack Team']::text[],
  ARRAY['economystic-m1']::text[],
  2,
  '#10B981',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'economystic-ai'
ON CONFLICT (milestone_id) DO NOTHING;

-- headz-android milestones (2 milestones)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'headz-android-m1',
  p.id,
  'headz-android',
  'Phase 1: Core App Development',
  'Basic Android app structure and features',
  'in-progress',
  '2025-09-01 00:00:00'::timestamp,
  '2025-11-01 00:00:00'::timestamp,
  70,
  '[{"id":"hand-1-1","text":"Android app architecture setup","completed":true},{"id":"hand-1-2","text":"User authentication flow","completed":true},{"id":"hand-1-3","text":"Camera and photo upload","completed":false},{"id":"hand-1-4","text":"Style recommendation UI","completed":false}]'::jsonb,
  ARRAY['Android Team']::text[],
  ARRAY[]::text[],
  1,
  '#10B981',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'headz-android'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'headz-android-m2',
  p.id,
  'headz-android',
  'Phase 2: Advanced Features & Testing',
  'Polish and Play Store submission',
  'pending',
  '2025-11-02 00:00:00'::timestamp,
  '2026-01-15 00:00:00'::timestamp,
  25,
  '[{"id":"hand-2-1","text":"Push notifications","completed":false},{"id":"hand-2-2","text":"In-app purchases","completed":false},{"id":"hand-2-3","text":"Play Store submission","completed":false}]'::jsonb,
  ARRAY['Android Team','QA Team']::text[],
  ARRAY['headz-android-m1']::text[],
  2,
  '#3B82F6',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'headz-android'
ON CONFLICT (milestone_id) DO NOTHING;

-- headz-ios milestones (2 milestones)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'headz-ios-m1',
  p.id,
  'headz-ios',
  'Phase 1: Core App Development',
  'Basic iOS app structure and features',
  'in-progress',
  '2025-09-01 00:00:00'::timestamp,
  '2025-11-01 00:00:00'::timestamp,
  75,
  '[{"id":"hios-1-1","text":"iOS app architecture setup","completed":true},{"id":"hios-1-2","text":"User authentication flow","completed":true},{"id":"hios-1-3","text":"Camera and photo upload","completed":false},{"id":"hios-1-4","text":"Style recommendation UI","completed":false}]'::jsonb,
  ARRAY['iOS Team']::text[],
  ARRAY[]::text[],
  1,
  '#F59E0B',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'headz-ios'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'headz-ios-m2',
  p.id,
  'headz-ios',
  'Phase 2: Advanced Features & Testing',
  'Polish and App Store submission',
  'pending',
  '2025-11-02 00:00:00'::timestamp,
  '2026-01-10 00:00:00'::timestamp,
  30,
  '[{"id":"hios-2-1","text":"Push notifications","completed":false},{"id":"hios-2-2","text":"In-app purchases","completed":false},{"id":"hios-2-3","text":"App Store submission","completed":false}]'::jsonb,
  ARRAY['iOS Team','QA Team']::text[],
  ARRAY['headz-ios-m1']::text[],
  2,
  '#EC4899',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'headz-ios'
ON CONFLICT (milestone_id) DO NOTHING;

-- headz-stylemy milestones (2 milestones)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'headz-m1',
  p.id,
  'headz-stylemy',
  'Phase 1: Core Platform',
  'AI styling engine and user interface',
  'completed',
  '2025-08-01 00:00:00'::timestamp,
  '2025-10-01 00:00:00'::timestamp,
  100,
  '[{"id":"hz-1-1","text":"AI model integration","completed":true},{"id":"hz-1-2","text":"User profile system","completed":true},{"id":"hz-1-3","text":"Image upload and processing","completed":true},{"id":"hz-1-4","text":"Style recommendation engine","completed":true}]'::jsonb,
  ARRAY['AI Team','Backend Team']::text[],
  ARRAY[]::text[],
  1,
  '#EC4899',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'headz-stylemy'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'headz-m2',
  p.id,
  'headz-stylemy',
  'Phase 2: Stylist Matching',
  'Connect users with stylists',
  'in-progress',
  '2025-10-02 00:00:00'::timestamp,
  '2025-12-15 00:00:00'::timestamp,
  60,
  '[{"id":"hz-2-1","text":"Stylist directory","completed":true},{"id":"hz-2-2","text":"Booking system","completed":false},{"id":"hz-2-3","text":"Payment integration","completed":false}]'::jsonb,
  ARRAY['Full Stack Team']::text[],
  ARRAY['headz-m1']::text[],
  2,
  '#F59E0B',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'headz-stylemy'
ON CONFLICT (milestone_id) DO NOTHING;

-- linkist-nfc milestones (2 milestones)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'linkist-m1',
  p.id,
  'linkist-nfc',
  'Phase 1: NFC Card Management',
  'Core NFC features',
  'completed',
  '2025-10-01 00:00:00'::timestamp,
  '2025-10-15 00:00:00'::timestamp,
  100,
  '[{"id":"lk-1-1","text":"NFC card registration","completed":true},{"id":"lk-1-2","text":"Profile customization","completed":true},{"id":"lk-1-3","text":"QR code generation","completed":true},{"id":"lk-1-4","text":"Analytics dashboard","completed":true}]'::jsonb,
  ARRAY['Frontend Team','Backend Team']::text[],
  ARRAY[]::text[],
  1,
  '#06B6D4',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'linkist-nfc'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'linkist-m2',
  p.id,
  'linkist-nfc',
  'Phase 2: Advanced Features',
  'Social integrations',
  'in-progress',
  '2025-10-16 00:00:00'::timestamp,
  '2025-11-15 00:00:00'::timestamp,
  80,
  '[{"id":"lk-2-1","text":"Social media integrations","completed":true},{"id":"lk-2-2","text":"Lead capture forms","completed":true},{"id":"lk-2-3","text":"Team management","completed":false}]'::jsonb,
  ARRAY['Full Stack Team']::text[],
  ARRAY['linkist-m1']::text[],
  2,
  '#8B5CF6',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'linkist-nfc'
ON CONFLICT (milestone_id) DO NOTHING;

-- Continue with remaining milestones in next section...
-- (linkist-mvp has 10 milestones, neurosense-mvp has 10 milestones, and the rest)

-- linkist-mvp milestones (10 milestones)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'linkist-mvp-milestone-1',
  p.id,
  'linkist-mvp',
  'Phase 1: Foundation',
  'Phase 1 of project development',
  'in-progress',
  '2025-11-06 00:00:00'::timestamp,
  '2025-11-13 00:00:00'::timestamp,
  100,
  '[{"id":"linkist-mvp-del-1-1","text":"Complete core functionality","completed":false},{"id":"linkist-mvp-del-1-2","text":"Write documentation","completed":false},{"id":"linkist-mvp-del-1-3","text":"Pass quality checks","completed":false}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY[]::text[],
  1,
  '#4F46E5',
  '2025-11-06 10:38:48.055953'::timestamp,
  '2025-11-06 10:38:48.055953'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'linkist-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'linkist-mvp-milestone-2',
  p.id,
  'linkist-mvp',
  'Phase 2: Development',
  'Phase 2 of project development',
  'pending',
  '2025-11-13 00:00:00'::timestamp,
  '2025-11-20 00:00:00'::timestamp,
  0,
  '[{"id":"linkist-mvp-del-2-1","text":"Complete core functionality","completed":false},{"id":"linkist-mvp-del-2-2","text":"Write documentation","completed":false},{"id":"linkist-mvp-del-2-3","text":"Pass quality checks","completed":false}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['linkist-mvp-milestone-1']::text[],
  2,
  '#4F46E5',
  '2025-11-06 10:38:48.195952'::timestamp,
  '2025-11-06 10:38:48.195952'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'linkist-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'linkist-mvp-milestone-3',
  p.id,
  'linkist-mvp',
  'Phase 3: Integration',
  'Phase 3 of project development',
  'pending',
  '2025-11-20 00:00:00'::timestamp,
  '2025-11-27 00:00:00'::timestamp,
  0,
  '[{"id":"linkist-mvp-del-3-1","text":"Complete core functionality","completed":false},{"id":"linkist-mvp-del-3-2","text":"Write documentation","completed":false},{"id":"linkist-mvp-del-3-3","text":"Pass quality checks","completed":false}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['linkist-mvp-milestone-2']::text[],
  3,
  '#4F46E5',
  '2025-11-06 10:38:48.363324'::timestamp,
  '2025-11-06 10:38:48.363324'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'linkist-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'linkist-mvp-milestone-4',
  p.id,
  'linkist-mvp',
  'Phase 4: Testing',
  'Phase 4 of project development',
  'pending',
  '2025-11-27 00:00:00'::timestamp,
  '2025-12-04 00:00:00'::timestamp,
  0,
  '[{"id":"linkist-mvp-del-4-1","text":"Complete core functionality","completed":false},{"id":"linkist-mvp-del-4-2","text":"Write documentation","completed":false},{"id":"linkist-mvp-del-4-3","text":"Pass quality checks","completed":false}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['linkist-mvp-milestone-3']::text[],
  4,
  '#4F46E5',
  '2025-11-06 10:38:48.504728'::timestamp,
  '2025-11-06 10:38:48.504728'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'linkist-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'linkist-mvp-milestone-5',
  p.id,
  'linkist-mvp',
  'Phase 5: Polish',
  'Phase 5 of project development',
  'pending',
  '2025-12-04 00:00:00'::timestamp,
  '2025-12-11 00:00:00'::timestamp,
  0,
  '[{"id":"linkist-mvp-del-5-1","text":"Complete core functionality","completed":false},{"id":"linkist-mvp-del-5-2","text":"Write documentation","completed":false},{"id":"linkist-mvp-del-5-3","text":"Pass quality checks","completed":false}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['linkist-mvp-milestone-4']::text[],
  5,
  '#4F46E5',
  '2025-11-06 10:38:48.67609'::timestamp,
  '2025-11-06 10:38:48.67609'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'linkist-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'linkist-mvp-milestone-6',
  p.id,
  'linkist-mvp',
  'Phase 6: Deployment',
  'Phase 6 of project development',
  'pending',
  '2025-12-11 00:00:00'::timestamp,
  '2025-12-18 00:00:00'::timestamp,
  0,
  '[{"id":"linkist-mvp-del-6-1","text":"Complete core functionality","completed":false},{"id":"linkist-mvp-del-6-2","text":"Write documentation","completed":false},{"id":"linkist-mvp-del-6-3","text":"Pass quality checks","completed":false}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['linkist-mvp-milestone-5']::text[],
  6,
  '#4F46E5',
  '2025-11-06 10:38:48.83792'::timestamp,
  '2025-11-06 10:38:48.83792'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'linkist-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'linkist-mvp-milestone-7',
  p.id,
  'linkist-mvp',
  'Phase 7: Launch',
  'Phase 7 of project development',
  'pending',
  '2025-12-18 00:00:00'::timestamp,
  '2025-12-25 00:00:00'::timestamp,
  0,
  '[{"id":"linkist-mvp-del-7-1","text":"Complete core functionality","completed":false},{"id":"linkist-mvp-del-7-2","text":"Write documentation","completed":false},{"id":"linkist-mvp-del-7-3","text":"Pass quality checks","completed":false}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['linkist-mvp-milestone-6']::text[],
  7,
  '#4F46E5',
  '2025-11-06 10:38:49.000173'::timestamp,
  '2025-11-06 10:38:49.000173'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'linkist-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'linkist-mvp-milestone-8',
  p.id,
  'linkist-mvp',
  'Phase 8: Optimization',
  'Phase 8 of project development',
  'pending',
  '2025-12-25 00:00:00'::timestamp,
  '2026-01-01 00:00:00'::timestamp,
  0,
  '[{"id":"linkist-mvp-del-8-1","text":"Complete core functionality","completed":false},{"id":"linkist-mvp-del-8-2","text":"Write documentation","completed":false},{"id":"linkist-mvp-del-8-3","text":"Pass quality checks","completed":false}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['linkist-mvp-milestone-7']::text[],
  8,
  '#4F46E5',
  '2025-11-06 10:38:49.152057'::timestamp,
  '2025-11-06 10:38:49.152057'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'linkist-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'linkist-mvp-milestone-9',
  p.id,
  'linkist-mvp',
  'Phase 9: Scale',
  'Phase 9 of project development',
  'pending',
  '2026-01-01 00:00:00'::timestamp,
  '2026-01-08 00:00:00'::timestamp,
  0,
  '[{"id":"linkist-mvp-del-9-1","text":"Complete core functionality","completed":false},{"id":"linkist-mvp-del-9-2","text":"Write documentation","completed":false},{"id":"linkist-mvp-del-9-3","text":"Pass quality checks","completed":false}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['linkist-mvp-milestone-8']::text[],
  9,
  '#4F46E5',
  '2025-11-06 10:38:49.315855'::timestamp,
  '2025-11-06 10:38:49.315855'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'linkist-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'linkist-mvp-milestone-10',
  p.id,
  'linkist-mvp',
  'Phase 10: Completion',
  'Phase 10 of project development',
  'pending',
  '2026-01-08 00:00:00'::timestamp,
  '2026-01-15 00:00:00'::timestamp,
  0,
  '[{"id":"linkist-mvp-del-10-1","text":"Complete core functionality","completed":false},{"id":"linkist-mvp-del-10-2","text":"Write documentation","completed":false},{"id":"linkist-mvp-del-10-3","text":"Pass quality checks","completed":false}]'::jsonb,
  ARRAY['Development Team']::text[],
  ARRAY['linkist-mvp-milestone-9']::text[],
  10,
  '#4F46E5',
  '2025-11-06 10:38:49.459965'::timestamp,
  '2025-11-06 10:38:49.459965'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'linkist-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

-- Additional linkist-nfc milestones (2 more)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'linkist-nfc-milestone-1',
  p.id,
  'linkist-nfc',
  'Phase 1: NFC Card Management System',
  'Core NFC card creation and management features',
  'completed',
  '2025-10-01 00:00:00'::timestamp,
  '2025-10-15 00:00:00'::timestamp,
  100,
  '[{"id":"del-link-1-1","text":"NFC card registration system","completed":true},{"id":"del-link-1-2","text":"Profile customization interface","completed":true},{"id":"del-link-1-3","text":"QR code generation","completed":true},{"id":"del-link-1-4","text":"Contact information management","completed":true},{"id":"del-link-1-5","text":"Analytics dashboard","completed":true}]'::jsonb,
  ARRAY['Frontend Team','Backend Team']::text[],
  ARRAY[]::text[],
  1,
  '#06B6D4',
  '2025-11-12 06:31:45.892618'::timestamp,
  '2025-11-12 06:31:45.892618'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'linkist-nfc'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'linkist-nfc-milestone-2',
  p.id,
  'linkist-nfc',
  'Phase 2: Advanced Networking Features',
  'Social integrations and advanced tracking',
  'in-progress',
  '2025-10-16 00:00:00'::timestamp,
  '2025-11-01 00:00:00'::timestamp,
  80,
  '[{"id":"del-link-2-1","text":"Social media integrations","completed":true},{"id":"del-link-2-2","text":"Lead capture forms","completed":true},{"id":"del-link-2-3","text":"Email notifications","completed":false},{"id":"del-link-2-4","text":"Team management","completed":false},{"id":"del-link-2-5","text":"Custom branding options","completed":true}]'::jsonb,
  ARRAY['Full Stack Team']::text[],
  ARRAY['linkist-nfc-milestone-1']::text[],
  2,
  '#8B5CF6',
  '2025-11-12 06:31:45.892618'::timestamp,
  '2025-11-12 06:31:45.892618'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'linkist-nfc'
ON CONFLICT (milestone_id) DO NOTHING;

-- neurosense-mvp milestones (10 milestones)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'milestone-1763105861000',
  p.id,
  'neurosense-mvp',
  'Phase 1: Foundation & Infrastructure',
  'Setup core infrastructure, database schema, and authentication system',
  'completed',
  '2025-11-12 17:07:41'::timestamp,
  '2025-11-19 17:07:41'::timestamp,
  100,
  '[{"id":"deliverable-1763115771187","text":"Signed LOC","completed":true},{"id":"deliverable-1763115783997","text":"Receipt of advance payment","completed":true},{"id":"deliverable-1763115793371","text":"Supabase database setup","completed":true},{"id":"deliverable-1763115803356","text":"Authentication system (Super Admin, Clinic Admin, Patient)","completed":true},{"id":"deliverable-1763115812355","text":"Core API structure","completed":true},{"id":"deliverable-1763115821208","text":"Basic routing and navigation","completed":true},{"id":"deliverable-1763115827298","text":"Website","completed":true}]'::jsonb,
  ARRAY[]::text[],
  ARRAY[]::text[],
  0,
  '#3B82F6',
  '2025-11-14 07:39:02.296054'::timestamp,
  '2025-11-14 11:07:11.122843'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'neurosense-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'milestone-1763110310826',
  p.id,
  'neurosense-mvp',
  'Phase 2: Landing Page & Marketing',
  'Develop public-facing landing page with clinic locator and information',
  'pending',
  '2025-11-10 13:00:00'::timestamp,
  '2025-11-16 13:00:00'::timestamp,
  0,
  '[{"id":"deliverable-1763110455567","text":"Landing page similar to myndlift+ashokgupta"},{"id":"deliverable-1763110648527","text":"Clinic locator with auto-detection"},{"id":"deliverable-1763110664293","text":"Enquiry form integration"},{"id":"deliverable-1763110689476","text":"YouTube video integration"},{"id":"deliverable-1763110702613","text":"Brain health articles section"}]'::jsonb,
  ARRAY[]::text[],
  ARRAY[]::text[],
  1,
  '#3B82F6',
  '2025-11-14 08:52:51.600088'::timestamp,
  '2025-11-14 10:24:01.313892'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'neurosense-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'milestone-1763110836715',
  p.id,
  'neurosense-mvp',
  'Phase 3: Super Admin Dashboard',
  'Complete super admin functionality for multi-clinic management',
  'pending',
  '2025-11-17 13:00:00'::timestamp,
  '2025-11-30 13:00:00'::timestamp,
  0,
  '[{"id":"deliverable-1763110873350","text":"Multi-clinic onboarding"},{"id":"deliverable-1763110887554","text":"User role management"},{"id":"deliverable-1763110897519","text":"Report unit SKU catalog"},{"id":"deliverable-1763110907197","text":"Revenue analytics dashboard"},{"id":"deliverable-1763110918097","text":"Global settings management"},{"id":"deliverable-1763110935856","text":"Stripe payment integration"},{"id":"deliverable-1763110945565","text":"EDF file handling"},{"id":"deliverable-1763110955453","text":"Algorithm 1 & 2 integration"}]'::jsonb,
  ARRAY[]::text[],
  ARRAY[]::text[],
  2,
  '#3B82F6',
  '2025-11-14 09:01:13.805116'::timestamp,
  '2025-11-14 10:24:01.692325'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'neurosense-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'milestone-1763111017994',
  p.id,
  'neurosense-mvp',
  'Phase 4: Clinic Admin Dashboard',
  'Develop clinic-specific administration portal',
  'pending',
  '2025-12-01 13:00:00'::timestamp,
  '2025-11-09 13:00:00'::timestamp,
  0,
  '[{"id":"deliverable-1763111059948","text":"Patient management interface"},{"id":"deliverable-1763111069418","text":"EDF file upload system"},{"id":"deliverable-1763111080147","text":"Report access and download"},{"id":"deliverable-1763111090206","text":"Usage analytics dashboard"},{"id":"deliverable-1763111100268","text":"Subscription management"},{"id":"deliverable-1763111109885","text":"Patient follow-up tracking"}]'::jsonb,
  ARRAY[]::text[],
  ARRAY[]::text[],
  3,
  '#3B82F6',
  '2025-11-14 09:04:20.385039'::timestamp,
  '2025-11-14 10:24:02.042899'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'neurosense-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'milestone-1763111154430',
  p.id,
  'neurosense-mvp',
  'Phase 5: Patient Portal',
  'Create patient-facing portal with reports and care plans',
  'pending',
  '2025-12-10 13:00:00'::timestamp,
  '2025-12-17 13:00:00'::timestamp,
  0,
  '[{"id":"deliverable-1763111199010","text":"Patient login system"},{"id":"deliverable-1763111208380","text":"Personal profile management"},{"id":"deliverable-1763111218471","text":"Test history view"},{"id":"deliverable-1763111256744","text":"NeuroSense report access"},{"id":"deliverable-1763111266771","text":"Personalized care plan access"},{"id":"deliverable-1763111276866","text":"Educational resources"},{"id":"deliverable-1763111287267","text":"Progress tracking graphs"}]'::jsonb,
  ARRAY[]::text[],
  ARRAY[]::text[],
  4,
  '#3B82F6',
  '2025-11-14 09:06:39.514342'::timestamp,
  '2025-11-14 10:24:02.387783'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'neurosense-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'milestone-1763111325056',
  p.id,
  'neurosense-mvp',
  'Phase 6: Algorithm Integration',
  'Implement NeuroSense algorithms for report generation',
  'pending',
  '2025-12-18 13:00:00'::timestamp,
  '2025-11-27 13:00:00'::timestamp,
  0,
  '[{"id":"deliverable-1763111390136","text":"Algorithm 1: NeuroSense report generation"},{"id":"deliverable-1763111400583","text":"Algorithm 2: Personalized care plan"},{"id":"deliverable-1763111410075","text":"Score calculations (Cognition, Stress, Focus, etc.)"},{"id":"deliverable-1763111419535","text":"Dynamic meter visualizations"},{"id":"deliverable-1763111429804","text":"Report template system"},{"id":"deliverable-1763111438986","text":"Care plan template system"}]'::jsonb,
  ARRAY[]::text[],
  ARRAY[]::text[],
  5,
  '#3B82F6',
  '2025-11-14 09:09:50.625838'::timestamp,
  '2025-11-14 10:24:02.715536'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'neurosense-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'milestone-1763111463807',
  p.id,
  'neurosense-mvp',
  'Phase 7: Notifications & Alerts',
  'Implement comprehensive notification system',
  'pending',
  '2025-12-28 13:00:00'::timestamp,
  '2026-01-03 13:00:00'::timestamp,
  0,
  '[{"id":"deliverable-1763111488526","text":"Email notification system"},{"id":"deliverable-1763111497780","text":"In-app notifications"},{"id":"deliverable-1763111507245","text":"SMS alerts integration"},{"id":"deliverable-1763111521219","text":"Usage threshold alerts"},{"id":"deliverable-1763111530830","text":"Report ready notifications"},{"id":"deliverable-1763111539466","text":"Payment reminders"}]'::jsonb,
  ARRAY[]::text[],
  ARRAY[]::text[],
  6,
  '#3B82F6',
  '2025-11-14 09:11:29.179483'::timestamp,
  '2025-11-14 10:24:03.061152'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'neurosense-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'milestone-1763111767498',
  p.id,
  'neurosense-mvp',
  'Phase 8: Testing & Quality Assurance',
  'Comprehensive testing of all features and workflows',
  'pending',
  '2026-01-04 13:00:00'::timestamp,
  '2026-01-13 13:00:00'::timestamp,
  0,
  '[{"id":"deliverable-1763111795464","text":"Unit testing coverage"},{"id":"deliverable-1763111806535","text":"Integration testing"},{"id":"deliverable-1763111816026","text":"End-to-end testing"},{"id":"deliverable-1763111824600","text":"Performance testing"},{"id":"deliverable-1763111837609","text":"Security audit"},{"id":"deliverable-1763111848020","text":"User acceptance testing"}]'::jsonb,
  ARRAY[]::text[],
  ARRAY[]::text[],
  7,
  '#3B82F6',
  '2025-11-14 09:16:35.883021'::timestamp,
  '2025-11-14 10:24:03.438039'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'neurosense-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'milestone-1763111769111',
  p.id,
  'neurosense-mvp',
  'Phase 9: Deployment & Documentation',
  'Production deployment and documentation completion',
  'pending',
  '2026-01-14 13:00:00'::timestamp,
  '2026-01-19 13:00:00'::timestamp,
  0,
  '[{"id":"deliverable-1763111918154","text":"Production deployment"},{"id":"deliverable-1763111926700","text":"SSL certificate setup"},{"id":"deliverable-1763111942361","text":"CDN configuration"},{"id":"deliverable-1763111952626","text":"Backup strategy"},{"id":"deliverable-1763111962972","text":"User documentation"},{"id":"deliverable-1763111973214","text":"API documentation"},{"id":"deliverable-1763111981961","text":"Admin guides"}]'::jsonb,
  ARRAY[]::text[],
  ARRAY[]::text[],
  8,
  '#3B82F6',
  '2025-11-14 09:18:38.616718'::timestamp,
  '2025-11-14 10:24:03.780838'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'neurosense-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'milestone-1763111770259',
  p.id,
  'neurosense-mvp',
  'Phase 10: Launch & Handover',
  'Final launch preparations and client handover',
  'pending',
  '2026-01-20 13:00:00'::timestamp,
  '2026-01-23 13:00:00'::timestamp,
  0,
  '[{"id":"deliverable-1763112065326","text":"Production go-live"},{"id":"deliverable-1763112073847","text":"Client training sessions"},{"id":"deliverable-1763112097276","text":"Support handover"},{"id":"deliverable-1763112109424","text":"Maintenance documentation"},{"id":"deliverable-1763112120447","text":"Performance monitoring setup"},{"id":"deliverable-1763112129863","text":"Final deliverables package"}]'::jsonb,
  ARRAY[]::text[],
  ARRAY[]::text[],
  9,
  '#3B82F6',
  '2025-11-14 09:21:05.815903'::timestamp,
  '2025-11-14 10:24:04.081905'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'neurosense-mvp'
ON CONFLICT (milestone_id) DO NOTHING;

-- orma milestones (3 milestones)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'orma-m1',
  p.id,
  'orma',
  'Phase 1: Core Platform',
  'Essential business management features',
  'in-progress',
  '2025-09-01 00:00:00'::timestamp,
  '2025-10-15 00:00:00'::timestamp,
  70,
  '[{"id":"orma-1-1","text":"User authentication and roles","completed":true},{"id":"orma-1-2","text":"Dashboard design","completed":true},{"id":"orma-1-3","text":"Client management module","completed":false},{"id":"orma-1-4","text":"Invoice generation system","completed":false}]'::jsonb,
  ARRAY['Backend Team','Frontend Team']::text[],
  ARRAY[]::text[],
  1,
  '#F59E0B',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'orma'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'orma-m2',
  p.id,
  'orma',
  'Phase 2: Advanced Features',
  'Analytics and reporting',
  'pending',
  '2025-10-16 00:00:00'::timestamp,
  '2025-12-01 00:00:00'::timestamp,
  30,
  '[{"id":"orma-2-1","text":"Advanced analytics dashboard","completed":false},{"id":"orma-2-2","text":"Report generation","completed":false},{"id":"orma-2-3","text":"Payment integration","completed":false}]'::jsonb,
  ARRAY['Full Stack Team']::text[],
  ARRAY['orma-m1']::text[],
  2,
  '#10B981',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'orma'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'orma-milestone-1',
  p.id,
  'orma',
  'Phase 1: Core Business Platform',
  'Essential business management features',
  'in-progress',
  '2025-09-01 00:00:00'::timestamp,
  '2025-10-15 00:00:00'::timestamp,
  70,
  '[{"id":"del-orma-1-1","text":"User authentication and roles","completed":true},{"id":"del-orma-1-2","text":"Dashboard design","completed":true},{"id":"del-orma-1-3","text":"Client management module","completed":true},{"id":"del-orma-1-4","text":"Invoice generation system","completed":false},{"id":"del-orma-1-5","text":"Reporting and analytics","completed":false}]'::jsonb,
  ARRAY['Backend Team','Frontend Team']::text[],
  ARRAY[]::text[],
  1,
  '#F59E0B',
  '2025-11-12 06:31:45.892618'::timestamp,
  '2025-11-12 06:31:45.892618'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'orma'
ON CONFLICT (milestone_id) DO NOTHING;

-- proposify-ai milestones (2 milestones)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'proposify-m1',
  p.id,
  'proposify-ai',
  'Phase 1: AI Proposal Engine',
  'Core AI proposal generation',
  'in-progress',
  '2025-11-01 00:00:00'::timestamp,
  '2025-12-15 00:00:00'::timestamp,
  35,
  '[{"id":"prop-1-1","text":"AI model integration","completed":false},{"id":"prop-1-2","text":"Template library","completed":false},{"id":"prop-1-3","text":"Proposal customization UI","completed":false}]'::jsonb,
  ARRAY['AI Team','Frontend Team']::text[],
  ARRAY[]::text[],
  1,
  '#8B5CF6',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'proposify-ai'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'proposify-m2',
  p.id,
  'proposify-ai',
  'Phase 2: Collaboration & Export',
  'Team collaboration and export features',
  'pending',
  '2025-12-16 00:00:00'::timestamp,
  '2026-02-15 00:00:00'::timestamp,
  0,
  '[{"id":"prop-2-1","text":"Real-time collaboration","completed":false},{"id":"prop-2-2","text":"PDF/DOCX export","completed":false},{"id":"prop-2-3","text":"Proposal tracking","completed":false}]'::jsonb,
  ARRAY['Full Stack Team']::text[],
  ARRAY['proposify-m1']::text[],
  2,
  '#06B6D4',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'proposify-ai'
ON CONFLICT (milestone_id) DO NOTHING;

-- project-progress-dashboard milestones (2 milestones)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'pulse-dash-m1',
  p.id,
  'project-progress-dashboard',
  'Phase 1: Core Dashboard',
  'Project tracking and monitoring',
  'completed',
  '2025-10-01 00:00:00'::timestamp,
  '2025-11-15 00:00:00'::timestamp,
  100,
  '[{"id":"pd-1-1","text":"Project listing and filters","completed":true},{"id":"pd-1-2","text":"Progress tracking system","completed":true},{"id":"pd-1-3","text":"Team management","completed":true},{"id":"pd-1-4","text":"Bug tracking integration","completed":true}]'::jsonb,
  ARRAY['Full Stack Team']::text[],
  ARRAY[]::text[],
  1,
  '#059669',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'project-progress-dashboard'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'pulse-dash-m2',
  p.id,
  'project-progress-dashboard',
  'Phase 2: Advanced Features',
  'Client portal and analytics',
  'in-progress',
  '2025-11-16 00:00:00'::timestamp,
  '2025-12-15 00:00:00'::timestamp,
  70,
  '[{"id":"pd-2-1","text":"Client portal with share links","completed":true},{"id":"pd-2-2","text":"Testing tracker","completed":true},{"id":"pd-2-3","text":"Project milestone tracking","completed":false}]'::jsonb,
  ARRAY['Full Stack Team']::text[],
  ARRAY['pulse-dash-m1']::text[],
  2,
  '#3B82F6',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'project-progress-dashboard'
ON CONFLICT (milestone_id) DO NOTHING;

-- pulseofpeople milestones (2 milestones)
INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'pulse-m1',
  p.id,
  'pulseofpeople',
  'Phase 1: Data Collection',
  'Voter data and sentiment collection',
  'in-progress',
  '2025-10-01 00:00:00'::timestamp,
  '2025-12-01 00:00:00'::timestamp,
  45,
  '[{"id":"pp-1-1","text":"Voter database setup","completed":true},{"id":"pp-1-2","text":"Feedback bot integration","completed":false},{"id":"pp-1-3","text":"Data collection APIs","completed":false}]'::jsonb,
  ARRAY['Backend Team','Data Science Team']::text[],
  ARRAY[]::text[],
  1,
  '#EC4899',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'pulseofpeople'
ON CONFLICT (milestone_id) DO NOTHING;

INSERT INTO public.project_milestones (milestone_id, project_uuid, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color, created_at, updated_at)
SELECT
  'pulse-m2',
  p.id,
  'pulseofpeople',
  'Phase 2: Analytics & Visualization',
  'Ward-level heatmaps and manifesto match AI',
  'pending',
  '2025-12-02 00:00:00'::timestamp,
  '2026-02-01 00:00:00'::timestamp,
  0,
  '[{"id":"pp-2-1","text":"Ward-level heatmap visualization","completed":false},{"id":"pp-2-2","text":"Manifesto match AI engine","completed":false},{"id":"pp-2-3","text":"Sentiment analysis dashboard","completed":false}]'::jsonb,
  ARRAY['AI Team','Frontend Team']::text[],
  ARRAY['pulse-m1']::text[],
  2,
  '#8B5CF6',
  '2025-11-12 06:37:58.185975'::timestamp,
  '2025-11-12 06:37:58.185975'::timestamp
FROM public.admin_projects p WHERE p.project_id = 'pulseofpeople'
ON CONFLICT (milestone_id) DO NOTHING;

-- =====================================================
-- STEP 4: Verification
-- =====================================================

-- Count total projects in admin_projects
SELECT COUNT(*) as total_projects FROM public.admin_projects;

-- Count total milestones
SELECT COUNT(*) as total_milestones FROM public.project_milestones;

-- Show all projects in admin_projects
SELECT project_id, name, client, overall_progress, status
FROM public.admin_projects
ORDER BY project_id;

-- Count milestones per project
SELECT project_id, COUNT(*) as milestone_count
FROM public.project_milestones
GROUP BY project_id
ORDER BY project_id;

-- Show sample of imported milestones
SELECT milestone_id, project_id, name, status, progress, "order"
FROM public.project_milestones
ORDER BY project_id, "order"
LIMIT 20;

-- Verify foreign key relationships (project_uuid should match admin_projects.id)
SELECT
  pm.milestone_id,
  pm.project_id,
  ap.project_id as admin_project_id,
  pm.name as milestone_name
FROM public.project_milestones pm
JOIN public.admin_projects ap ON pm.project_uuid = ap.id
LIMIT 10;
