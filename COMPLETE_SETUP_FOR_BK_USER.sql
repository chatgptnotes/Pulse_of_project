-- =====================================================
-- COMPLETE SETUP FOR USER BK WITH NEUROSENSE-MVP
-- =====================================================
-- This script ensures:
-- 1. neurosense-mvp project exists
-- 2. All 10 milestones are imported
-- 3. User BK is assigned to the project
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: Ensure neurosense-mvp project exists
-- =====================================================

INSERT INTO public.admin_projects (project_id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  'neurosense-mvp',
  'NeuroSense360 MVP',
  'Brain health platform MVP',
  'Limitless Brain Wellness',
  '2025-11-12',
  '2026-01-24',
  'active',
  65
)
ON CONFLICT (project_id)
DO UPDATE SET
  overall_progress = 65,
  status = 'active';

-- =====================================================
-- STEP 2: Import all 10 milestones for neurosense-mvp
-- =====================================================

-- Delete existing milestones for neurosense-mvp (if any)
DELETE FROM public.project_milestones WHERE project_id = 'neurosense-mvp';

-- Milestone 1
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

-- Milestone 2
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

-- Milestone 3
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

-- Milestone 4
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

-- Milestone 5
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

-- Milestone 6
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

-- Milestone 7
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

-- Milestone 8
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

-- Milestone 9
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

-- Milestone 10
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

-- =====================================================
-- STEP 3: Assign project to user BK
-- =====================================================

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID for murali@gmail.com
  SELECT id INTO v_user_id
  FROM public.users
  WHERE email = 'murali@gmail.com';

  IF v_user_id IS NOT NULL THEN
    -- Assign project with permissions
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

    RAISE NOTICE '✅ Project assigned to user: murali@gmail.com';
  ELSE
    RAISE NOTICE '❌ User not found: murali@gmail.com';
  END IF;
END $$;

-- =====================================================
-- STEP 4: Verification
-- =====================================================

-- Check project exists
SELECT 'PROJECT' as type, project_id, name, overall_progress
FROM public.admin_projects
WHERE project_id = 'neurosense-mvp';

-- Count milestones
SELECT 'MILESTONES' as type, COUNT(*) as count
FROM public.project_milestones
WHERE project_id = 'neurosense-mvp';

-- Show sample milestones
SELECT 'MILESTONE SAMPLE' as type, milestone_id, name, status, progress, "order"
FROM public.project_milestones
WHERE project_id = 'neurosense-mvp'
ORDER BY "order"
LIMIT 5;

-- Check user assignment
SELECT 'USER ASSIGNMENT' as type,
  u.email,
  u.role,
  up.project_id,
  up.can_upload_documents,
  up.can_manage_bugs,
  up.can_view_timeline
FROM public.user_projects up
JOIN public.users u ON up.user_id = u.id
WHERE u.email = 'murali@gmail.com'
AND up.project_id = 'neurosense-mvp';
