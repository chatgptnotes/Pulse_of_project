-- =====================================================
-- ALL PROJECTS - Milestones & Deliverables SQL
-- Project-wise Deliverable Tracking (Like Bug Reports)
-- =====================================================

-- This SQL creates milestones and deliverables for ALL ACTIVE PROJECTS
-- Similar to how bug_reports saves project-wise data with project_name
-- Here we use project_id to organize milestones phase-wise and project-wise

-- =====================================================
-- TABLE STRUCTURE (For Reference)
-- =====================================================
-- projects table:
--   - id (project_id)
--   - name
--   - description
--   - client
--   - start_date, end_date
--   - status
--   - overall_progress
--
-- project_milestones table:
--   - id
--   - project_id  ← Links to projects.id (LIKE bug_reports.project_name)
--   - name
--   - description
--   - deliverables (JSONB) ← Array of {id, text, completed}
--   - status
--   - start_date, end_date
--   - progress
--   - assigned_to (JSONB)
--   - dependencies (JSONB)
--   - order
--   - color

-- =====================================================
-- 1. PROJECT: NeuroSense360 & LBW
-- =====================================================
-- Project ID: neurosense-360
-- Complete 10-phase project with deliverables

-- Insert Project
INSERT INTO projects (id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  'neurosense-360',
  'NeuroSense360 & LBW',
  'Combined Neuro360 and LBW platform - EEG-based brain health insights',
  'Limitless Brain Wellness',
  '2025-11-01T00:00:00Z',
  '2026-01-24T00:00:00Z',
  'active',
  65
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  client = EXCLUDED.client;

-- Phase 1: Foundation & Infrastructure
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'neurosense-360-milestone-1',
  'neurosense-360',
  'Phase 1: Foundation & Infrastructure',
  'Setup core infrastructure, database schema, and authentication system',
  'in-progress',
  '2025-11-01T00:00:00Z',
  '2025-11-10T00:00:00Z',
  75,
  '[
    {"id": "del-ns-1-1", "text": "Signed LOC", "completed": true},
    {"id": "del-ns-1-2", "text": "Receipt of advance payment", "completed": true},
    {"id": "del-ns-1-3", "text": "Supabase database setup", "completed": true},
    {"id": "del-ns-1-4", "text": "Authentication system (Super Admin, Clinic Admin, Patient)", "completed": false},
    {"id": "del-ns-1-5", "text": "Core API structure", "completed": false},
    {"id": "del-ns-1-6", "text": "Basic routing and navigation", "completed": false}
  ]'::jsonb,
  ARRAY['Backend Team', 'DevOps'],
  ARRAY[]::TEXT[],
  1,
  '#4F46E5'
) ON CONFLICT (id) DO UPDATE SET
  deliverables = EXCLUDED.deliverables,
  progress = EXCLUDED.progress,
  status = EXCLUDED.status;

-- Phase 2: Landing Page & Marketing
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'neurosense-360-milestone-2',
  'neurosense-360',
  'Phase 2: Landing Page & Marketing',
  'Public-facing landing page with clinic locator',
  'pending',
  '2025-11-11T00:00:00Z',
  '2025-11-17T00:00:00Z',
  0,
  '[
    {"id": "del-ns-2-1", "text": "Landing page similar to biomesight", "completed": false},
    {"id": "del-ns-2-2", "text": "Clinic locator with auto-detection", "completed": false},
    {"id": "del-ns-2-3", "text": "Enquiry form integration", "completed": false},
    {"id": "del-ns-2-4", "text": "YouTube video integration", "completed": false},
    {"id": "del-ns-2-5", "text": "Brain health articles section", "completed": false}
  ]'::jsonb,
  ARRAY['Frontend Team', 'UI/UX Designer'],
  ARRAY['neurosense-360-milestone-1'],
  2,
  '#10B981'
) ON CONFLICT (id) DO UPDATE SET
  deliverables = EXCLUDED.deliverables;

-- =====================================================
-- 2. PROJECT: Linkist NFC
-- =====================================================
-- Project ID: linkist-nfc

INSERT INTO projects (id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  'linkist-nfc',
  'Linkist NFC',
  'NFC-based digital business card and networking platform',
  'Linkist',
  '2025-10-01T00:00:00Z',
  '2025-12-16T00:00:00Z',
  'active',
  90
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  overall_progress = EXCLUDED.overall_progress;

-- Phase 1: NFC Card Management
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'linkist-nfc-milestone-1',
  'linkist-nfc',
  'Phase 1: NFC Card Management System',
  'Core NFC card creation and management features',
  'completed',
  '2025-10-01T00:00:00Z',
  '2025-10-15T00:00:00Z',
  100,
  '[
    {"id": "del-link-1-1", "text": "NFC card registration system", "completed": true},
    {"id": "del-link-1-2", "text": "Profile customization interface", "completed": true},
    {"id": "del-link-1-3", "text": "QR code generation", "completed": true},
    {"id": "del-link-1-4", "text": "Contact information management", "completed": true},
    {"id": "del-link-1-5", "text": "Analytics dashboard", "completed": true}
  ]'::jsonb,
  ARRAY['Frontend Team', 'Backend Team'],
  ARRAY[]::TEXT[],
  1,
  '#06B6D4'
) ON CONFLICT (id) DO UPDATE SET
  deliverables = EXCLUDED.deliverables,
  progress = EXCLUDED.progress,
  status = EXCLUDED.status;

-- Phase 2: Advanced Features
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'linkist-nfc-milestone-2',
  'linkist-nfc',
  'Phase 2: Advanced Networking Features',
  'Social integrations and advanced tracking',
  'in-progress',
  '2025-10-16T00:00:00Z',
  '2025-11-01T00:00:00Z',
  80,
  '[
    {"id": "del-link-2-1", "text": "Social media integrations", "completed": true},
    {"id": "del-link-2-2", "text": "Lead capture forms", "completed": true},
    {"id": "del-link-2-3", "text": "Email notifications", "completed": false},
    {"id": "del-link-2-4", "text": "Team management", "completed": false},
    {"id": "del-link-2-5", "text": "Custom branding options", "completed": true}
  ]'::jsonb,
  ARRAY['Full Stack Team'],
  ARRAY['linkist-nfc-milestone-1'],
  2,
  '#8B5CF6'
) ON CONFLICT (id) DO UPDATE SET
  deliverables = EXCLUDED.deliverables,
  progress = EXCLUDED.progress;

-- =====================================================
-- 3. PROJECT: Orma
-- =====================================================
-- Project ID: orma

INSERT INTO projects (id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  'orma',
  'Orma',
  'Business operations and management platform',
  'Orma',
  '2025-09-01T00:00:00Z',
  '2026-01-31T00:00:00Z',
  'active',
  72
) ON CONFLICT (id) DO UPDATE SET
  overall_progress = EXCLUDED.overall_progress;

-- Phase 1: Core Platform
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'orma-milestone-1',
  'orma',
  'Phase 1: Core Business Platform',
  'Essential business management features',
  'in-progress',
  '2025-09-01T00:00:00Z',
  '2025-10-15T00:00:00Z',
  70,
  '[
    {"id": "del-orma-1-1", "text": "User authentication and roles", "completed": true},
    {"id": "del-orma-1-2", "text": "Dashboard design", "completed": true},
    {"id": "del-orma-1-3", "text": "Client management module", "completed": true},
    {"id": "del-orma-1-4", "text": "Invoice generation system", "completed": false},
    {"id": "del-orma-1-5", "text": "Reporting and analytics", "completed": false}
  ]'::jsonb,
  ARRAY['Backend Team', 'Frontend Team'],
  ARRAY[]::TEXT[],
  1,
  '#F59E0B'
) ON CONFLICT (id) DO UPDATE SET
  deliverables = EXCLUDED.deliverables,
  progress = EXCLUDED.progress;

-- =====================================================
-- 4. PROJECT: 4CSecure
-- =====================================================
-- Project ID: 4csecure

INSERT INTO projects (id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  '4csecure',
  '4CSecure',
  'Security guide distribution platform',
  '4CSecure',
  '2025-08-01T00:00:00Z',
  '2026-02-10T00:00:00Z',
  'active',
  99
) ON CONFLICT (id) DO UPDATE SET
  overall_progress = EXCLUDED.overall_progress;

-- Phase 1: Guide Distribution System
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  '4csecure-milestone-1',
  '4csecure',
  'Phase 1: Security Guide Platform',
  'Complete guide distribution and tracking',
  'completed',
  '2025-08-01T00:00:00Z',
  '2025-09-30T00:00:00Z',
  100,
  '[
    {"id": "del-4cs-1-1", "text": "Guide upload and management", "completed": true},
    {"id": "del-4cs-1-2", "text": "User access controls", "completed": true},
    {"id": "del-4cs-1-3", "text": "Version tracking system", "completed": true},
    {"id": "del-4cs-1-4", "text": "Distribution analytics", "completed": true},
    {"id": "del-4cs-1-5", "text": "Email notifications", "completed": true},
    {"id": "del-4cs-1-6", "text": "Mobile responsive design", "completed": true}
  ]'::jsonb,
  ARRAY['Full Stack Team'],
  ARRAY[]::TEXT[],
  1,
  '#DC2626'
) ON CONFLICT (id) DO UPDATE SET
  deliverables = EXCLUDED.deliverables,
  progress = EXCLUDED.progress,
  status = EXCLUDED.status;

-- Final touches
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  '4csecure-milestone-2',
  '4csecure',
  'Phase 2: Final Polish & Deployment',
  'Final testing and production deployment',
  'in-progress',
  '2025-10-01T00:00:00Z',
  '2026-02-10T00:00:00Z',
  95,
  '[
    {"id": "del-4cs-2-1", "text": "Performance optimization", "completed": true},
    {"id": "del-4cs-2-2", "text": "Security audit", "completed": true},
    {"id": "del-4cs-2-3", "text": "Production deployment", "completed": false},
    {"id": "del-4cs-2-4", "text": "User training documentation", "completed": true}
  ]'::jsonb,
  ARRAY['DevOps', 'QA Team'],
  ARRAY['4csecure-milestone-1'],
  2,
  '#059669'
) ON CONFLICT (id) DO UPDATE SET
  deliverables = EXCLUDED.deliverables,
  progress = EXCLUDED.progress;

-- =====================================================
-- 5. PROJECT: Call Center for Betser
-- =====================================================
-- Project ID: call-center-betser

INSERT INTO projects (id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  'call-center-betser',
  'Call Center for Betser',
  'AI-powered call center connected to economystic.ai',
  'Betser',
  '2025-11-01T00:00:00Z',
  '2026-02-15T00:00:00Z',
  'active',
  45
) ON CONFLICT (id) DO UPDATE SET
  overall_progress = EXCLUDED.overall_progress;

-- Phase 1: Call Center Infrastructure
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'call-center-betser-milestone-1',
  'call-center-betser',
  'Phase 1: Call Center Infrastructure',
  'Core call handling and routing system',
  'in-progress',
  '2025-11-01T00:00:00Z',
  '2025-12-01T00:00:00Z',
  50,
  '[
    {"id": "del-cc-1-1", "text": "VoIP integration setup", "completed": true},
    {"id": "del-cc-1-2", "text": "Call routing logic", "completed": false},
    {"id": "del-cc-1-3", "text": "Agent dashboard", "completed": false},
    {"id": "del-cc-1-4", "text": "Call recording system", "completed": false},
    {"id": "del-cc-1-5", "text": "Real-time analytics", "completed": false}
  ]'::jsonb,
  ARRAY['Backend Team', 'Frontend Team'],
  ARRAY[]::TEXT[],
  1,
  '#3B82F6'
) ON CONFLICT (id) DO UPDATE SET
  deliverables = EXCLUDED.deliverables,
  progress = EXCLUDED.progress;

-- Phase 2: AI Integration
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'call-center-betser-milestone-2',
  'call-center-betser',
  'Phase 2: AI Integration with Economystic.ai',
  'Connect to economystic.ai for intelligent call handling',
  'pending',
  '2025-12-02T00:00:00Z',
  '2026-01-15T00:00:00Z',
  0,
  '[
    {"id": "del-cc-2-1", "text": "Economystic.ai API integration", "completed": false},
    {"id": "del-cc-2-2", "text": "AI-powered call transcription", "completed": false},
    {"id": "del-cc-2-3", "text": "Sentiment analysis", "completed": false},
    {"id": "del-cc-2-4", "text": "Automated call summaries", "completed": false},
    {"id": "del-cc-2-5", "text": "Intelligent call routing", "completed": false}
  ]'::jsonb,
  ARRAY['AI Team', 'Backend Team'],
  ARRAY['call-center-betser-milestone-1'],
  2,
  '#8B5CF6'
) ON CONFLICT (id) DO UPDATE SET
  deliverables = EXCLUDED.deliverables;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all projects
SELECT id, name, client, overall_progress
FROM projects
WHERE status = 'active'
ORDER BY id;

-- Check all milestones grouped by project
SELECT
  p.name as project_name,
  m.name as milestone_name,
  m.status,
  m.progress,
  jsonb_array_length(m.deliverables) as deliverable_count
FROM project_milestones m
JOIN projects p ON m.project_id = p.id
ORDER BY p.id, m."order";

-- Count deliverables per project
SELECT
  p.id as project_id,
  p.name as project_name,
  COUNT(m.id) as milestone_count,
  SUM(jsonb_array_length(m.deliverables)) as total_deliverables
FROM projects p
LEFT JOIN project_milestones m ON p.id = m.project_id
GROUP BY p.id, p.name
ORDER BY total_deliverables DESC;

-- =====================================================
-- TEMPLATE FOR ADDING NEW PROJECTS
-- =====================================================
/*
-- Step 1: Insert your project
INSERT INTO projects (id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  'your-project-id',
  'Your Project Name',
  'Project description',
  'Client Name',
  '2025-11-01T00:00:00Z',
  '2026-03-01T00:00:00Z',
  'active',
  0
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- Step 2: Add milestones with deliverables
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'your-project-id-milestone-1',
  'your-project-id',  -- ← Must match your project ID
  'Phase 1: Your Phase Name',
  'Phase description',
  'pending',
  '2025-11-01T00:00:00Z',
  '2025-11-15T00:00:00Z',
  0,
  '[
    {"id": "del-yourproject-1-1", "text": "First deliverable", "completed": false},
    {"id": "del-yourproject-1-2", "text": "Second deliverable", "completed": false},
    {"id": "del-yourproject-1-3", "text": "Third deliverable", "completed": false}
  ]'::jsonb,
  ARRAY['Your Team'],
  ARRAY[]::TEXT[],
  1,
  '#4F46E5'
) ON CONFLICT (id) DO UPDATE SET
  deliverables = EXCLUDED.deliverables;
*/

-- =====================================================
-- SUMMARY
-- =====================================================
-- This SQL creates milestones and deliverables for:
-- 1. NeuroSense360 & LBW (2 phases, 11 deliverables)
-- 2. Linkist NFC (2 phases, 10 deliverables)
-- 3. Orma (1 phase, 5 deliverables)
-- 4. 4CSecure (2 phases, 10 deliverables)
-- 5. Call Center for Betser (2 phases, 10 deliverables)
--
-- Total: 5 projects, 9 milestones/phases, 46 deliverables
--
-- You can add deliverables for more projects using the template above!
