-- =====================================================
-- NeuroSense360 MVP Project Data - Complete SQL Insert
-- All Phases with Deliverables, KPIs, and Tasks
-- =====================================================

-- First, delete existing data if any (optional - uncomment if needed)
-- DELETE FROM milestone_kpis WHERE milestone_id LIKE 'milestone-%';
-- DELETE FROM project_tasks WHERE milestone_id LIKE 'milestone-%';
-- DELETE FROM project_milestones WHERE project_id = 'neurosense-mvp';
-- DELETE FROM projects WHERE id = 'neurosense-mvp';

-- =====================================================
-- 1. INSERT PROJECT
-- =====================================================
INSERT INTO projects (
  id, name, description, client, start_date, end_date, status, overall_progress
) VALUES (
  'neurosense-mvp',
  'NeuroSense360 MVP Development',
  'Web application for EEG-based brain health insights and clinic management',
  'Limitless Brain Wellness (LBW)',
  '2025-11-01T00:00:00Z',
  '2026-01-24T00:00:00Z',
  'active',
  0
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  client = EXCLUDED.client,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  status = EXCLUDED.status;

-- =====================================================
-- 2. INSERT MILESTONES WITH DELIVERABLES
-- =====================================================

-- Phase 1: Foundation & Infrastructure
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'milestone-1',
  'neurosense-mvp',
  'Phase 1: Foundation & Infrastructure',
  'Setup core infrastructure, database schema, and authentication system',
  'pending',
  '2025-11-01T00:00:00Z',
  '2025-11-10T00:00:00Z',
  0,
  '[
    {"id": "del-1-1", "text": "Signed LOC", "completed": false},
    {"id": "del-1-2", "text": "Receipt of advance payment", "completed": false},
    {"id": "del-1-3", "text": "Supabase database setup", "completed": false},
    {"id": "del-1-4", "text": "Authentication system (Super Admin, Clinic Admin, Patient)", "completed": false},
    {"id": "del-1-5", "text": "Core API structure", "completed": false},
    {"id": "del-1-6", "text": "Basic routing and navigation", "completed": false}
  ]'::jsonb,
  ARRAY['Backend Team', 'DevOps'],
  ARRAY[]::TEXT[],
  1,
  '#4F46E5'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  deliverables = EXCLUDED.deliverables,
  assigned_to = EXCLUDED.assigned_to,
  dependencies = EXCLUDED.dependencies,
  "order" = EXCLUDED."order",
  color = EXCLUDED.color;

-- Phase 2: Landing Page & Marketing
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'milestone-2',
  'neurosense-mvp',
  'Phase 2: Landing Page & Marketing',
  'Develop public-facing landing page with clinic locator and information',
  'pending',
  '2025-11-11T00:00:00Z',
  '2025-11-17T00:00:00Z',
  0,
  '[
    {"id": "del-2-1", "text": "Landing page similar to biomesight", "completed": false},
    {"id": "del-2-2", "text": "Clinic locator with auto-detection", "completed": false},
    {"id": "del-2-3", "text": "Enquiry form integration", "completed": false},
    {"id": "del-2-4", "text": "YouTube video integration", "completed": false},
    {"id": "del-2-5", "text": "Brain health articles section", "completed": false}
  ]'::jsonb,
  ARRAY['Frontend Team', 'UI/UX Designer'],
  ARRAY['milestone-1'],
  2,
  '#10B981'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deliverables = EXCLUDED.deliverables,
  assigned_to = EXCLUDED.assigned_to,
  dependencies = EXCLUDED.dependencies;

-- Phase 3: Super Admin Dashboard
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'milestone-3',
  'neurosense-mvp',
  'Phase 3: Super Admin Dashboard',
  'Complete super admin functionality for multi-clinic management',
  'pending',
  '2025-11-18T00:00:00Z',
  '2025-12-01T00:00:00Z',
  0,
  '[
    {"id": "del-3-1", "text": "Multi-clinic onboarding", "completed": false},
    {"id": "del-3-2", "text": "User role management", "completed": false},
    {"id": "del-3-3", "text": "Report unit SKU catalog", "completed": false},
    {"id": "del-3-4", "text": "Revenue analytics dashboard", "completed": false},
    {"id": "del-3-5", "text": "Global settings management", "completed": false},
    {"id": "del-3-6", "text": "Stripe payment integration", "completed": false},
    {"id": "del-3-7", "text": "EDF file handling", "completed": false},
    {"id": "del-3-8", "text": "Algorithm 1 & 2 integration", "completed": false}
  ]'::jsonb,
  ARRAY['Full Stack Team', 'Data Science Team'],
  ARRAY['milestone-1'],
  3,
  '#F59E0B'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deliverables = EXCLUDED.deliverables,
  assigned_to = EXCLUDED.assigned_to,
  dependencies = EXCLUDED.dependencies;

-- Phase 4: Clinic Admin Dashboard
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'milestone-4',
  'neurosense-mvp',
  'Phase 4: Clinic Admin Dashboard',
  'Develop clinic-specific administration portal',
  'pending',
  '2025-12-02T00:00:00Z',
  '2025-12-10T00:00:00Z',
  0,
  '[
    {"id": "del-4-1", "text": "Patient management interface", "completed": false},
    {"id": "del-4-2", "text": "EDF file upload system", "completed": false},
    {"id": "del-4-3", "text": "Report access and download", "completed": false},
    {"id": "del-4-4", "text": "Usage analytics dashboard", "completed": false},
    {"id": "del-4-5", "text": "Subscription management", "completed": false},
    {"id": "del-4-6", "text": "Patient follow-up tracking", "completed": false}
  ]'::jsonb,
  ARRAY['Frontend Team', 'Backend Team'],
  ARRAY['milestone-3'],
  4,
  '#8B5CF6'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deliverables = EXCLUDED.deliverables,
  assigned_to = EXCLUDED.assigned_to,
  dependencies = EXCLUDED.dependencies;

-- Phase 5: Patient Portal
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'milestone-5',
  'neurosense-mvp',
  'Phase 5: Patient Portal',
  'Create patient-facing portal with reports and care plans',
  'pending',
  '2025-12-11T00:00:00Z',
  '2025-12-18T00:00:00Z',
  0,
  '[
    {"id": "del-5-1", "text": "Patient login system", "completed": false},
    {"id": "del-5-2", "text": "Personal profile management", "completed": false},
    {"id": "del-5-3", "text": "Test history view", "completed": false},
    {"id": "del-5-4", "text": "NeuroSense report access", "completed": false},
    {"id": "del-5-5", "text": "Personalized care plan access", "completed": false},
    {"id": "del-5-6", "text": "Educational resources", "completed": false},
    {"id": "del-5-7", "text": "Progress tracking graphs", "completed": false}
  ]'::jsonb,
  ARRAY['Frontend Team', 'UX Team'],
  ARRAY['milestone-4'],
  5,
  '#EC4899'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deliverables = EXCLUDED.deliverables,
  assigned_to = EXCLUDED.assigned_to,
  dependencies = EXCLUDED.dependencies;

-- Phase 6: Algorithm Integration
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'milestone-6',
  'neurosense-mvp',
  'Phase 6: Algorithm Integration',
  'Implement NeuroSense algorithms for report generation',
  'pending',
  '2025-12-19T00:00:00Z',
  '2025-12-28T00:00:00Z',
  0,
  '[
    {"id": "del-6-1", "text": "Algorithm 1: NeuroSense report generation", "completed": false},
    {"id": "del-6-2", "text": "Algorithm 2: Personalized care plan", "completed": false},
    {"id": "del-6-3", "text": "Score calculations (Cognition, Stress, Focus, etc.)", "completed": false},
    {"id": "del-6-4", "text": "Dynamic meter visualizations", "completed": false},
    {"id": "del-6-5", "text": "Report template system", "completed": false},
    {"id": "del-6-6", "text": "Care plan template system", "completed": false}
  ]'::jsonb,
  ARRAY['Data Science Team', 'Backend Team'],
  ARRAY['milestone-5'],
  6,
  '#06B6D4'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deliverables = EXCLUDED.deliverables,
  assigned_to = EXCLUDED.assigned_to,
  dependencies = EXCLUDED.dependencies;

-- Phase 7: Notifications & Alerts
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'milestone-7',
  'neurosense-mvp',
  'Phase 7: Notifications & Alerts',
  'Implement comprehensive notification system',
  'pending',
  '2025-12-29T00:00:00Z',
  '2026-01-04T00:00:00Z',
  0,
  '[
    {"id": "del-7-1", "text": "Email notification system", "completed": false},
    {"id": "del-7-2", "text": "In-app notifications", "completed": false},
    {"id": "del-7-3", "text": "SMS alerts integration", "completed": false},
    {"id": "del-7-4", "text": "Usage threshold alerts", "completed": false},
    {"id": "del-7-5", "text": "Report ready notifications", "completed": false},
    {"id": "del-7-6", "text": "Payment reminders", "completed": false}
  ]'::jsonb,
  ARRAY['Backend Team'],
  ARRAY['milestone-6'],
  7,
  '#14B8A6'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deliverables = EXCLUDED.deliverables,
  assigned_to = EXCLUDED.assigned_to,
  dependencies = EXCLUDED.dependencies;

-- Phase 8: Testing & Quality Assurance
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'milestone-8',
  'neurosense-mvp',
  'Phase 8: Testing & Quality Assurance',
  'Comprehensive testing of all features and workflows',
  'pending',
  '2026-01-05T00:00:00Z',
  '2026-01-14T00:00:00Z',
  0,
  '[
    {"id": "del-8-1", "text": "Unit testing coverage", "completed": false},
    {"id": "del-8-2", "text": "Integration testing", "completed": false},
    {"id": "del-8-3", "text": "End-to-end testing", "completed": false},
    {"id": "del-8-4", "text": "Performance testing", "completed": false},
    {"id": "del-8-5", "text": "Security audit", "completed": false},
    {"id": "del-8-6", "text": "User acceptance testing", "completed": false}
  ]'::jsonb,
  ARRAY['QA Team', 'All Teams'],
  ARRAY['milestone-7'],
  8,
  '#F97316'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deliverables = EXCLUDED.deliverables,
  assigned_to = EXCLUDED.assigned_to,
  dependencies = EXCLUDED.dependencies;

-- Phase 9: Deployment & Documentation
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'milestone-9',
  'neurosense-mvp',
  'Phase 9: Deployment & Documentation',
  'Production deployment and documentation completion',
  'pending',
  '2026-01-15T00:00:00Z',
  '2026-01-20T00:00:00Z',
  0,
  '[
    {"id": "del-9-1", "text": "Production deployment", "completed": false},
    {"id": "del-9-2", "text": "SSL certificate setup", "completed": false},
    {"id": "del-9-3", "text": "CDN configuration", "completed": false},
    {"id": "del-9-4", "text": "Backup strategy", "completed": false},
    {"id": "del-9-5", "text": "User documentation", "completed": false},
    {"id": "del-9-6", "text": "API documentation", "completed": false},
    {"id": "del-9-7", "text": "Admin guides", "completed": false}
  ]'::jsonb,
  ARRAY['DevOps', 'Technical Writers'],
  ARRAY['milestone-8'],
  9,
  '#DC2626'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deliverables = EXCLUDED.deliverables,
  assigned_to = EXCLUDED.assigned_to,
  dependencies = EXCLUDED.dependencies;

-- Phase 10: Launch & Handover
INSERT INTO project_milestones (
  id, project_id, name, description, status, start_date, end_date, progress,
  deliverables, assigned_to, dependencies, "order", color
) VALUES (
  'milestone-10',
  'neurosense-mvp',
  'Phase 10: Launch & Handover',
  'Final launch preparations and client handover',
  'pending',
  '2026-01-21T00:00:00Z',
  '2026-01-24T00:00:00Z',
  0,
  '[
    {"id": "del-10-1", "text": "Production go-live", "completed": false},
    {"id": "del-10-2", "text": "Client training sessions", "completed": false},
    {"id": "del-10-3", "text": "Support handover", "completed": false},
    {"id": "del-10-4", "text": "Maintenance documentation", "completed": false},
    {"id": "del-10-5", "text": "Performance monitoring setup", "completed": false},
    {"id": "del-10-6", "text": "Final deliverables package", "completed": false}
  ]'::jsonb,
  ARRAY['Project Manager', 'All Teams'],
  ARRAY['milestone-9'],
  10,
  '#059669'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deliverables = EXCLUDED.deliverables,
  assigned_to = EXCLUDED.assigned_to,
  dependencies = EXCLUDED.dependencies;

-- =====================================================
-- 3. INSERT KPIs
-- =====================================================

-- Phase 1 KPIs
INSERT INTO milestone_kpis (id, milestone_id, name, target, current, unit, status, trend)
VALUES
  ('kpi-1-1', 'milestone-1', 'Database Tables Created', 15, 0, 'tables', 'on-track', 'stable'),
  ('kpi-1-2', 'milestone-1', 'API Endpoints', 20, 0, 'endpoints', 'on-track', 'stable'),
  ('kpi-1-3', 'milestone-1', 'Auth Flows Completed', 3, 0, 'flows', 'on-track', 'stable')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  target = EXCLUDED.target,
  current = EXCLUDED.current,
  unit = EXCLUDED.unit;

-- Phase 2 KPIs
INSERT INTO milestone_kpis (id, milestone_id, name, target, current, unit, status, trend)
VALUES
  ('kpi-2-1', 'milestone-2', 'Page Components', 8, 0, 'components', 'on-track', 'stable'),
  ('kpi-2-2', 'milestone-2', 'Lighthouse Score', 90, 0, 'score', 'on-track', 'stable')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  target = EXCLUDED.target,
  current = EXCLUDED.current,
  unit = EXCLUDED.unit;

-- Phase 3 KPIs
INSERT INTO milestone_kpis (id, milestone_id, name, target, current, unit, status, trend)
VALUES
  ('kpi-3-1', 'milestone-3', 'Dashboard Views', 12, 0, 'views', 'on-track', 'stable'),
  ('kpi-3-2', 'milestone-3', 'Payment Integration', 100, 0, '%', 'on-track', 'stable'),
  ('kpi-3-3', 'milestone-3', 'Algorithm Integration', 2, 0, 'algorithms', 'on-track', 'stable')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  target = EXCLUDED.target,
  current = EXCLUDED.current,
  unit = EXCLUDED.unit;

-- Phase 4 KPIs
INSERT INTO milestone_kpis (id, milestone_id, name, target, current, unit, status, trend)
VALUES
  ('kpi-4-1', 'milestone-4', 'Features Completed', 8, 0, 'features', 'on-track', 'stable'),
  ('kpi-4-2', 'milestone-4', 'File Upload System', 100, 0, '%', 'on-track', 'stable')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  target = EXCLUDED.target,
  current = EXCLUDED.current,
  unit = EXCLUDED.unit;

-- Phase 5 KPIs
INSERT INTO milestone_kpis (id, milestone_id, name, target, current, unit, status, trend)
VALUES
  ('kpi-5-1', 'milestone-5', 'Portal Features', 7, 0, 'features', 'on-track', 'stable'),
  ('kpi-5-2', 'milestone-5', 'User Experience Score', 85, 0, '%', 'on-track', 'stable')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  target = EXCLUDED.target,
  current = EXCLUDED.current,
  unit = EXCLUDED.unit;

-- Phase 6 KPIs
INSERT INTO milestone_kpis (id, milestone_id, name, target, current, unit, status, trend)
VALUES
  ('kpi-6-1', 'milestone-6', 'Algorithms Implemented', 2, 0, 'algorithms', 'on-track', 'stable'),
  ('kpi-6-2', 'milestone-6', 'Score Metrics', 7, 0, 'metrics', 'on-track', 'stable')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  target = EXCLUDED.target,
  current = EXCLUDED.current,
  unit = EXCLUDED.unit;

-- Phase 7 KPIs
INSERT INTO milestone_kpis (id, milestone_id, name, target, current, unit, status, trend)
VALUES
  ('kpi-7-1', 'milestone-7', 'Notification Types', 6, 0, 'types', 'on-track', 'stable')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  target = EXCLUDED.target,
  current = EXCLUDED.current,
  unit = EXCLUDED.unit;

-- Phase 8 KPIs
INSERT INTO milestone_kpis (id, milestone_id, name, target, current, unit, status, trend)
VALUES
  ('kpi-8-1', 'milestone-8', 'Test Coverage', 80, 0, '%', 'on-track', 'stable'),
  ('kpi-8-2', 'milestone-8', 'Critical Bugs', 0, 0, 'bugs', 'on-track', 'stable')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  target = EXCLUDED.target,
  current = EXCLUDED.current,
  unit = EXCLUDED.unit;

-- Phase 9 KPIs
INSERT INTO milestone_kpis (id, milestone_id, name, target, current, unit, status, trend)
VALUES
  ('kpi-9-1', 'milestone-9', 'Deployment Tasks', 7, 0, 'tasks', 'on-track', 'stable'),
  ('kpi-9-2', 'milestone-9', 'Documentation Pages', 15, 0, 'pages', 'on-track', 'stable')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  target = EXCLUDED.target,
  current = EXCLUDED.current,
  unit = EXCLUDED.unit;

-- Phase 10 KPIs
INSERT INTO milestone_kpis (id, milestone_id, name, target, current, unit, status, trend)
VALUES
  ('kpi-10-1', 'milestone-10', 'Launch Readiness', 100, 0, '%', 'on-track', 'stable'),
  ('kpi-10-2', 'milestone-10', 'Training Sessions', 3, 0, 'sessions', 'on-track', 'stable')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  target = EXCLUDED.target,
  current = EXCLUDED.current,
  unit = EXCLUDED.unit;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check project
SELECT * FROM projects WHERE id = 'neurosense-mvp';

-- Check all milestones
SELECT id, name, jsonb_array_length(deliverables) as deliverable_count
FROM project_milestones
WHERE project_id = 'neurosense-mvp'
ORDER BY "order";

-- Check all KPIs
SELECT m.name as milestone_name, k.name as kpi_name, k.target, k.unit
FROM milestone_kpis k
JOIN project_milestones m ON k.milestone_id = m.id
WHERE m.project_id = 'neurosense-mvp'
ORDER BY m."order", k.name;

-- Count total deliverables across all phases
SELECT
  SUM(jsonb_array_length(deliverables)) as total_deliverables
FROM project_milestones
WHERE project_id = 'neurosense-mvp';
