-- =====================================================
-- COMPLETE SQL: ALL ACTIVE PROJECTS WITH PHASES
-- Phase-wise Deliverable Tracking for ALL Projects
-- Run this ONCE to populate entire database
-- =====================================================

-- =====================================================
-- PRIORITY 1 PROJECTS (14 Active Projects)
-- =====================================================

-- =====================================================
-- 1. NEUROSENSE360 & LBW
-- =====================================================
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
) ON CONFLICT (id) DO UPDATE SET overall_progress = EXCLUDED.overall_progress;

-- Phase 1
INSERT INTO project_milestones (id, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color)
VALUES (
  'neurosense-360-m1', 'neurosense-360', 'Phase 1: Foundation & Infrastructure',
  'Setup core infrastructure, database schema, and authentication system', 'in-progress',
  '2025-11-01T00:00:00Z', '2025-11-10T00:00:00Z', 75,
  '[
    {"id": "ns-1-1", "text": "Signed LOC", "completed": true},
    {"id": "ns-1-2", "text": "Supabase database setup", "completed": true},
    {"id": "ns-1-3", "text": "Authentication system (Super Admin, Clinic Admin, Patient)", "completed": false},
    {"id": "ns-1-4", "text": "Core API structure", "completed": false},
    {"id": "ns-1-5", "text": "Basic routing and navigation", "completed": false}
  ]'::jsonb,
  ARRAY['Backend Team', 'DevOps'], ARRAY[]::TEXT[], 1, '#4F46E5'
) ON CONFLICT (id) DO UPDATE SET progress = EXCLUDED.progress, deliverables = EXCLUDED.deliverables;

-- Phase 2
INSERT INTO project_milestones (id, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color)
VALUES (
  'neurosense-360-m2', 'neurosense-360', 'Phase 2: Landing Page & Marketing',
  'Public-facing landing page with clinic locator', 'pending',
  '2025-11-11T00:00:00Z', '2025-11-17T00:00:00Z', 0,
  '[
    {"id": "ns-2-1", "text": "Landing page similar to biomesight", "completed": false},
    {"id": "ns-2-2", "text": "Clinic locator with auto-detection", "completed": false},
    {"id": "ns-2-3", "text": "Enquiry form integration", "completed": false},
    {"id": "ns-2-4", "text": "YouTube video integration", "completed": false}
  ]'::jsonb,
  ARRAY['Frontend Team', 'UI/UX Designer'], ARRAY['neurosense-360-m1'], 2, '#10B981'
) ON CONFLICT (id) DO UPDATE SET deliverables = EXCLUDED.deliverables;

-- Phase 3
INSERT INTO project_milestones (id, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color)
VALUES (
  'neurosense-360-m3', 'neurosense-360', 'Phase 3: Super Admin Dashboard',
  'Complete super admin functionality for multi-clinic management', 'pending',
  '2025-11-18T00:00:00Z', '2025-12-01T00:00:00Z', 0,
  '[
    {"id": "ns-3-1", "text": "Multi-clinic onboarding", "completed": false},
    {"id": "ns-3-2", "text": "User role management", "completed": false},
    {"id": "ns-3-3", "text": "Revenue analytics dashboard", "completed": false},
    {"id": "ns-3-4", "text": "Stripe payment integration", "completed": false},
    {"id": "ns-3-5", "text": "Algorithm 1 & 2 integration", "completed": false}
  ]'::jsonb,
  ARRAY['Full Stack Team', 'Data Science Team'], ARRAY['neurosense-360-m1'], 3, '#F59E0B'
) ON CONFLICT (id) DO UPDATE SET deliverables = EXCLUDED.deliverables;

-- =====================================================
-- 2. CALL CENTER FOR BETSER
-- =====================================================
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
) ON CONFLICT (id) DO UPDATE SET overall_progress = EXCLUDED.overall_progress;

INSERT INTO project_milestones (id, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color)
VALUES
  ('call-center-m1', 'call-center-betser', 'Phase 1: VoIP Infrastructure',
   'Core call handling and routing system', 'in-progress',
   '2025-11-01T00:00:00Z', '2025-12-01T00:00:00Z', 50,
   '[
     {"id": "cc-1-1", "text": "VoIP integration setup", "completed": true},
     {"id": "cc-1-2", "text": "Call routing logic", "completed": false},
     {"id": "cc-1-3", "text": "Agent dashboard", "completed": false},
     {"id": "cc-1-4", "text": "Call recording system", "completed": false}
   ]'::jsonb,
   ARRAY['Backend Team', 'Frontend Team'], ARRAY[]::TEXT[], 1, '#3B82F6'),

  ('call-center-m2', 'call-center-betser', 'Phase 2: AI Integration',
   'Connect to economystic.ai for intelligent call handling', 'pending',
   '2025-12-02T00:00:00Z', '2026-01-15T00:00:00Z', 0,
   '[
     {"id": "cc-2-1", "text": "Economystic.ai API integration", "completed": false},
     {"id": "cc-2-2", "text": "AI-powered call transcription", "completed": false},
     {"id": "cc-2-3", "text": "Sentiment analysis", "completed": false}
   ]'::jsonb,
   ARRAY['AI Team', 'Backend Team'], ARRAY['call-center-m1'], 2, '#8B5CF6')
ON CONFLICT (id) DO UPDATE SET deliverables = EXCLUDED.deliverables;

-- =====================================================
-- 3. ORMA
-- =====================================================
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
) ON CONFLICT (id) DO UPDATE SET overall_progress = EXCLUDED.overall_progress;

INSERT INTO project_milestones (id, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color)
VALUES
  ('orma-m1', 'orma', 'Phase 1: Core Platform',
   'Essential business management features', 'in-progress',
   '2025-09-01T00:00:00Z', '2025-10-15T00:00:00Z', 70,
   '[
     {"id": "orma-1-1", "text": "User authentication and roles", "completed": true},
     {"id": "orma-1-2", "text": "Dashboard design", "completed": true},
     {"id": "orma-1-3", "text": "Client management module", "completed": false},
     {"id": "orma-1-4", "text": "Invoice generation system", "completed": false}
   ]'::jsonb,
   ARRAY['Backend Team', 'Frontend Team'], ARRAY[]::TEXT[], 1, '#F59E0B'),

  ('orma-m2', 'orma', 'Phase 2: Advanced Features',
   'Analytics and reporting', 'pending',
   '2025-10-16T00:00:00Z', '2025-12-01T00:00:00Z', 30,
   '[
     {"id": "orma-2-1", "text": "Advanced analytics dashboard", "completed": false},
     {"id": "orma-2-2", "text": "Report generation", "completed": false},
     {"id": "orma-2-3", "text": "Payment integration", "completed": false}
   ]'::jsonb,
   ARRAY['Full Stack Team'], ARRAY['orma-m1'], 2, '#10B981')
ON CONFLICT (id) DO UPDATE SET deliverables = EXCLUDED.deliverables;

-- =====================================================
-- 4. 4CSECURE
-- =====================================================
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
) ON CONFLICT (id) DO UPDATE SET overall_progress = EXCLUDED.overall_progress;

INSERT INTO project_milestones (id, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color)
VALUES
  ('4csecure-m1', '4csecure', 'Phase 1: Guide Distribution',
   'Complete guide distribution and tracking', 'completed',
   '2025-08-01T00:00:00Z', '2025-09-30T00:00:00Z', 100,
   '[
     {"id": "4cs-1-1", "text": "Guide upload and management", "completed": true},
     {"id": "4cs-1-2", "text": "User access controls", "completed": true},
     {"id": "4cs-1-3", "text": "Version tracking system", "completed": true},
     {"id": "4cs-1-4", "text": "Distribution analytics", "completed": true}
   ]'::jsonb,
   ARRAY['Full Stack Team'], ARRAY[]::TEXT[], 1, '#DC2626'),

  ('4csecure-m2', '4csecure', 'Phase 2: Final Polish',
   'Testing and production deployment', 'in-progress',
   '2025-10-01T00:00:00Z', '2026-02-10T00:00:00Z', 95,
   '[
     {"id": "4cs-2-1", "text": "Performance optimization", "completed": true},
     {"id": "4cs-2-2", "text": "Security audit", "completed": true},
     {"id": "4cs-2-3", "text": "Production deployment", "completed": false}
   ]'::jsonb,
   ARRAY['DevOps', 'QA Team'], ARRAY['4csecure-m1'], 2, '#059669')
ON CONFLICT (id) DO UPDATE SET deliverables = EXCLUDED.deliverables;

-- =====================================================
-- 5. BETSER LIFE LANDING PAGE
-- =====================================================
INSERT INTO projects (id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  'betser-life',
  'Betser Life Landing Page',
  'AI agent Bhelp app landing page',
  'Betser',
  '2025-11-01T00:00:00Z',
  '2026-02-20T00:00:00Z',
  'active',
  35
) ON CONFLICT (id) DO UPDATE SET overall_progress = EXCLUDED.overall_progress;

INSERT INTO project_milestones (id, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color)
VALUES
  ('betser-life-m1', 'betser-life', 'Phase 1: Landing Page Design',
   'Design and develop landing page', 'in-progress',
   '2025-11-01T00:00:00Z', '2025-12-01T00:00:00Z', 40,
   '[
     {"id": "bl-1-1", "text": "UI/UX design mockups", "completed": true},
     {"id": "bl-1-2", "text": "Responsive layout implementation", "completed": false},
     {"id": "bl-1-3", "text": "AI features showcase section", "completed": false},
     {"id": "bl-1-4", "text": "CTA and conversion optimization", "completed": false}
   ]'::jsonb,
   ARRAY['Frontend Team', 'UI/UX Designer'], ARRAY[]::TEXT[], 1, '#EC4899'),

  ('betser-life-m2', 'betser-life', 'Phase 2: Integration & Launch',
   'API integration and deployment', 'pending',
   '2025-12-02T00:00:00Z', '2026-01-15T00:00:00Z', 0,
   '[
     {"id": "bl-2-1", "text": "Backend API integration", "completed": false},
     {"id": "bl-2-2", "text": "Analytics setup", "completed": false},
     {"id": "bl-2-3", "text": "Production deployment", "completed": false}
   ]'::jsonb,
   ARRAY['Full Stack Team'], ARRAY['betser-life-m1'], 2, '#8B5CF6')
ON CONFLICT (id) DO UPDATE SET deliverables = EXCLUDED.deliverables;

-- =====================================================
-- 6. HEADZ - STYLEMY.HAIR
-- =====================================================
INSERT INTO projects (id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  'headz-stylemy',
  'Headz - StyleMy.hair',
  'AI-powered hair styling recommendation platform',
  'Headz',
  '2025-08-01T00:00:00Z',
  '2026-01-15T00:00:00Z',
  'active',
  80
) ON CONFLICT (id) DO UPDATE SET overall_progress = EXCLUDED.overall_progress;

INSERT INTO project_milestones (id, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color)
VALUES
  ('headz-m1', 'headz-stylemy', 'Phase 1: Core Platform',
   'AI styling engine and user interface', 'completed',
   '2025-08-01T00:00:00Z', '2025-10-01T00:00:00Z', 100,
   '[
     {"id": "hz-1-1", "text": "AI model integration", "completed": true},
     {"id": "hz-1-2", "text": "User profile system", "completed": true},
     {"id": "hz-1-3", "text": "Image upload and processing", "completed": true},
     {"id": "hz-1-4", "text": "Style recommendation engine", "completed": true}
   ]'::jsonb,
   ARRAY['AI Team', 'Backend Team'], ARRAY[]::TEXT[], 1, '#EC4899'),

  ('headz-m2', 'headz-stylemy', 'Phase 2: Stylist Matching',
   'Connect users with stylists', 'in-progress',
   '2025-10-02T00:00:00Z', '2025-12-15T00:00:00Z', 60,
   '[
     {"id": "hz-2-1", "text": "Stylist directory", "completed": true},
     {"id": "hz-2-2", "text": "Booking system", "completed": false},
     {"id": "hz-2-3", "text": "Payment integration", "completed": false}
   ]'::jsonb,
   ARRAY['Full Stack Team'], ARRAY['headz-m1'], 2, '#F59E0B')
ON CONFLICT (id) DO UPDATE SET deliverables = EXCLUDED.deliverables;

-- =====================================================
-- 7. LINKIST NFC
-- =====================================================
INSERT INTO projects (id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  'linkist-nfc',
  'Linkist NFC',
  'NFC-based digital business card platform',
  'Linkist',
  '2025-10-01T00:00:00Z',
  '2025-12-16T00:00:00Z',
  'active',
  90
) ON CONFLICT (id) DO UPDATE SET overall_progress = EXCLUDED.overall_progress;

INSERT INTO project_milestones (id, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color)
VALUES
  ('linkist-m1', 'linkist-nfc', 'Phase 1: NFC Card Management',
   'Core NFC features', 'completed',
   '2025-10-01T00:00:00Z', '2025-10-15T00:00:00Z', 100,
   '[
     {"id": "lk-1-1", "text": "NFC card registration", "completed": true},
     {"id": "lk-1-2", "text": "Profile customization", "completed": true},
     {"id": "lk-1-3", "text": "QR code generation", "completed": true},
     {"id": "lk-1-4", "text": "Analytics dashboard", "completed": true}
   ]'::jsonb,
   ARRAY['Frontend Team', 'Backend Team'], ARRAY[]::TEXT[], 1, '#06B6D4'),

  ('linkist-m2', 'linkist-nfc', 'Phase 2: Advanced Features',
   'Social integrations', 'in-progress',
   '2025-10-16T00:00:00Z', '2025-11-15T00:00:00Z', 80,
   '[
     {"id": "lk-2-1", "text": "Social media integrations", "completed": true},
     {"id": "lk-2-2", "text": "Lead capture forms", "completed": true},
     {"id": "lk-2-3", "text": "Team management", "completed": false}
   ]'::jsonb,
   ARRAY['Full Stack Team'], ARRAY['linkist-m1'], 2, '#8B5CF6')
ON CONFLICT (id) DO UPDATE SET deliverables = EXCLUDED.deliverables;

-- =====================================================
-- 8. ECONOMYSTIC.AI
-- =====================================================
INSERT INTO projects (id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  'economystic-ai',
  'Economystic.ai',
  'Business operations AI platform',
  'Betser',
  '2025-09-01T00:00:00Z',
  '2026-02-01T00:00:00Z',
  'active',
  55
) ON CONFLICT (id) DO UPDATE SET overall_progress = EXCLUDED.overall_progress;

INSERT INTO project_milestones (id, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color)
VALUES
  ('economystic-m1', 'economystic-ai', 'Phase 1: AI Foundation',
   'Core AI engine development', 'in-progress',
   '2025-09-01T00:00:00Z', '2025-11-01T00:00:00Z', 60,
   '[
     {"id": "eco-1-1", "text": "AI model training", "completed": true},
     {"id": "eco-1-2", "text": "API infrastructure", "completed": false},
     {"id": "eco-1-3", "text": "Data pipeline setup", "completed": false}
   ]'::jsonb,
   ARRAY['AI Team', 'Backend Team'], ARRAY[]::TEXT[], 1, '#3B82F6'),

  ('economystic-m2', 'economystic-ai', 'Phase 2: Business Features',
   'Business operations modules', 'pending',
   '2025-11-02T00:00:00Z', '2026-01-01T00:00:00Z', 20,
   '[
     {"id": "eco-2-1", "text": "Document processing", "completed": false},
     {"id": "eco-2-2", "text": "Analytics dashboard", "completed": false},
     {"id": "eco-2-3", "text": "Workflow automation", "completed": false}
   ]'::jsonb,
   ARRAY['Full Stack Team'], ARRAY['economystic-m1'], 2, '#10B981')
ON CONFLICT (id) DO UPDATE SET deliverables = EXCLUDED.deliverables;

-- =====================================================
-- 9. PULSEOFPEOPLE.COM
-- =====================================================
INSERT INTO projects (id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  'pulseofpeople',
  'PulseOfPeople.com',
  'Political analytics platform - voter sentiment and ward-level heatmaps',
  'Political Analytics',
  '2025-10-01T00:00:00Z',
  '2026-03-01T00:00:00Z',
  'active',
  40
) ON CONFLICT (id) DO UPDATE SET overall_progress = EXCLUDED.overall_progress;

INSERT INTO project_milestones (id, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color)
VALUES
  ('pulse-m1', 'pulseofpeople', 'Phase 1: Data Collection',
   'Voter data and sentiment collection', 'in-progress',
   '2025-10-01T00:00:00Z', '2025-12-01T00:00:00Z', 45,
   '[
     {"id": "pp-1-1", "text": "Voter database setup", "completed": true},
     {"id": "pp-1-2", "text": "Feedback bot integration", "completed": false},
     {"id": "pp-1-3", "text": "Data collection APIs", "completed": false}
   ]'::jsonb,
   ARRAY['Backend Team', 'Data Science Team'], ARRAY[]::TEXT[], 1, '#EC4899'),

  ('pulse-m2', 'pulseofpeople', 'Phase 2: Analytics & Visualization',
   'Ward-level heatmaps and manifesto match AI', 'pending',
   '2025-12-02T00:00:00Z', '2026-02-01T00:00:00Z', 0,
   '[
     {"id": "pp-2-1", "text": "Ward-level heatmap visualization", "completed": false},
     {"id": "pp-2-2", "text": "Manifesto match AI engine", "completed": false},
     {"id": "pp-2-3", "text": "Sentiment analysis dashboard", "completed": false}
   ]'::jsonb,
   ARRAY['AI Team', 'Frontend Team'], ARRAY['pulse-m1'], 2, '#8B5CF6')
ON CONFLICT (id) DO UPDATE SET deliverables = EXCLUDED.deliverables;

-- =====================================================
-- 10. HEADZ iOS APP
-- =====================================================
INSERT INTO projects (id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  'headz-ios',
  'Headz iOS App',
  'Mobile iOS application for hair styling',
  'Headz',
  '2025-09-01T00:00:00Z',
  '2026-01-20T00:00:00Z',
  'active',
  70
) ON CONFLICT (id) DO UPDATE SET overall_progress = EXCLUDED.overall_progress;

INSERT INTO project_milestones (id, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color)
VALUES
  ('headz-ios-m1', 'headz-ios', 'Phase 1: Core App Development',
   'Basic iOS app structure and features', 'in-progress',
   '2025-09-01T00:00:00Z', '2025-11-01T00:00:00Z', 75,
   '[
     {"id": "hios-1-1", "text": "iOS app architecture setup", "completed": true},
     {"id": "hios-1-2", "text": "User authentication flow", "completed": true},
     {"id": "hios-1-3", "text": "Camera and photo upload", "completed": false},
     {"id": "hios-1-4", "text": "Style recommendation UI", "completed": false}
   ]'::jsonb,
   ARRAY['iOS Team'], ARRAY[]::TEXT[], 1, '#F59E0B'),

  ('headz-ios-m2', 'headz-ios', 'Phase 2: Advanced Features & Testing',
   'Polish and App Store submission', 'pending',
   '2025-11-02T00:00:00Z', '2026-01-10T00:00:00Z', 30,
   '[
     {"id": "hios-2-1", "text": "Push notifications", "completed": false},
     {"id": "hios-2-2", "text": "In-app purchases", "completed": false},
     {"id": "hios-2-3", "text": "App Store submission", "completed": false}
   ]'::jsonb,
   ARRAY['iOS Team', 'QA Team'], ARRAY['headz-ios-m1'], 2, '#EC4899')
ON CONFLICT (id) DO UPDATE SET deliverables = EXCLUDED.deliverables;

-- =====================================================
-- 11. HEADZ ANDROID APP
-- =====================================================
INSERT INTO projects (id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  'headz-android',
  'Headz Android App',
  'Mobile Android application for hair styling',
  'Headz',
  '2025-09-01T00:00:00Z',
  '2026-01-25T00:00:00Z',
  'active',
  65
) ON CONFLICT (id) DO UPDATE SET overall_progress = EXCLUDED.overall_progress;

INSERT INTO project_milestones (id, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color)
VALUES
  ('headz-android-m1', 'headz-android', 'Phase 1: Core App Development',
   'Basic Android app structure and features', 'in-progress',
   '2025-09-01T00:00:00Z', '2025-11-01T00:00:00Z', 70,
   '[
     {"id": "hand-1-1", "text": "Android app architecture setup", "completed": true},
     {"id": "hand-1-2", "text": "User authentication flow", "completed": true},
     {"id": "hand-1-3", "text": "Camera and photo upload", "completed": false},
     {"id": "hand-1-4", "text": "Style recommendation UI", "completed": false}
   ]'::jsonb,
   ARRAY['Android Team'], ARRAY[]::TEXT[], 1, '#10B981'),

  ('headz-android-m2', 'headz-android', 'Phase 2: Advanced Features & Testing',
   'Polish and Play Store submission', 'pending',
   '2025-11-02T00:00:00Z', '2026-01-15T00:00:00Z', 25,
   '[
     {"id": "hand-2-1", "text": "Push notifications", "completed": false},
     {"id": "hand-2-2", "text": "In-app purchases", "completed": false},
     {"id": "hand-2-3", "text": "Play Store submission", "completed": false}
   ]'::jsonb,
   ARRAY['Android Team', 'QA Team'], ARRAY['headz-android-m1'], 2, '#3B82F6')
ON CONFLICT (id) DO UPDATE SET deliverables = EXCLUDED.deliverables;

-- =====================================================
-- 12. ADAMRIT HMS
-- =====================================================
INSERT INTO projects (id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  'adamrit-hms',
  'ADAMRIT',
  'Hospital management system',
  'Healthcare',
  '2025-11-01T00:00:00Z',
  '2026-04-01T00:00:00Z',
  'active',
  25
) ON CONFLICT (id) DO UPDATE SET overall_progress = EXCLUDED.overall_progress;

INSERT INTO project_milestones (id, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color)
VALUES
  ('adamrit-m1', 'adamrit-hms', 'Phase 1: Core HMS Setup',
   'Basic hospital management features', 'in-progress',
   '2025-11-01T00:00:00Z', '2026-01-01T00:00:00Z', 30,
   '[
     {"id": "adm-1-1", "text": "Patient registration system", "completed": false},
     {"id": "adm-1-2", "text": "Doctor management", "completed": false},
     {"id": "adm-1-3", "text": "Appointment scheduling", "completed": false},
     {"id": "adm-1-4", "text": "Medical records database", "completed": false}
   ]'::jsonb,
   ARRAY['Backend Team', 'Frontend Team'], ARRAY[]::TEXT[], 1, '#DC2626'),

  ('adamrit-m2', 'adamrit-hms', 'Phase 2: Advanced HMS Features',
   'Billing, pharmacy, and inventory', 'pending',
   '2026-01-02T00:00:00Z', '2026-03-01T00:00:00Z', 0,
   '[
     {"id": "adm-2-1", "text": "Billing and invoicing", "completed": false},
     {"id": "adm-2-2", "text": "Pharmacy management", "completed": false},
     {"id": "adm-2-3", "text": "Inventory tracking", "completed": false}
   ]'::jsonb,
   ARRAY['Full Stack Team'], ARRAY['adamrit-m1'], 2, '#F59E0B')
ON CONFLICT (id) DO UPDATE SET deliverables = EXCLUDED.deliverables;

-- =====================================================
-- 13. PROPOSIFY AI
-- =====================================================
INSERT INTO projects (id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  'proposify-ai',
  'Proposify AI',
  'AI-generated business proposal platform',
  'BettRoi',
  '2025-11-01T00:00:00Z',
  '2026-02-28T00:00:00Z',
  'active',
  30
) ON CONFLICT (id) DO UPDATE SET overall_progress = EXCLUDED.overall_progress;

INSERT INTO project_milestones (id, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color)
VALUES
  ('proposify-m1', 'proposify-ai', 'Phase 1: AI Proposal Engine',
   'Core AI proposal generation', 'in-progress',
   '2025-11-01T00:00:00Z', '2025-12-15T00:00:00Z', 35,
   '[
     {"id": "prop-1-1", "text": "AI model integration", "completed": false},
     {"id": "prop-1-2", "text": "Template library", "completed": false},
     {"id": "prop-1-3", "text": "Proposal customization UI", "completed": false}
   ]'::jsonb,
   ARRAY['AI Team', 'Frontend Team'], ARRAY[]::TEXT[], 1, '#8B5CF6'),

  ('proposify-m2', 'proposify-ai', 'Phase 2: Collaboration & Export',
   'Team collaboration and export features', 'pending',
   '2025-12-16T00:00:00Z', '2026-02-15T00:00:00Z', 0,
   '[
     {"id": "prop-2-1", "text": "Real-time collaboration", "completed": false},
     {"id": "prop-2-2", "text": "PDF/DOCX export", "completed": false},
     {"id": "prop-2-3", "text": "Proposal tracking", "completed": false}
   ]'::jsonb,
   ARRAY['Full Stack Team'], ARRAY['proposify-m1'], 2, '#06B6D4')
ON CONFLICT (id) DO UPDATE SET deliverables = EXCLUDED.deliverables;

-- =====================================================
-- 14. PROJECT PROGRESS DASHBOARD (PULSEOFPROJECT)
-- =====================================================
INSERT INTO projects (id, name, description, client, start_date, end_date, status, overall_progress)
VALUES (
  'project-progress-dashboard',
  'Project Progress Dashboard',
  'PulseOfProject.com - Internal project tracking',
  'BettRoi',
  '2025-10-01T00:00:00Z',
  '2025-12-20T00:00:00Z',
  'active',
  85
) ON CONFLICT (id) DO UPDATE SET overall_progress = EXCLUDED.overall_progress;

INSERT INTO project_milestones (id, project_id, name, description, status, start_date, end_date, progress, deliverables, assigned_to, dependencies, "order", color)
VALUES
  ('pulse-dash-m1', 'project-progress-dashboard', 'Phase 1: Core Dashboard',
   'Project tracking and monitoring', 'completed',
   '2025-10-01T00:00:00Z', '2025-11-15T00:00:00Z', 100,
   '[
     {"id": "pd-1-1", "text": "Project listing and filters", "completed": true},
     {"id": "pd-1-2", "text": "Progress tracking system", "completed": true},
     {"id": "pd-1-3", "text": "Team management", "completed": true},
     {"id": "pd-1-4", "text": "Bug tracking integration", "completed": true}
   ]'::jsonb,
   ARRAY['Full Stack Team'], ARRAY[]::TEXT[], 1, '#059669'),

  ('pulse-dash-m2', 'project-progress-dashboard', 'Phase 2: Advanced Features',
   'Client portal and analytics', 'in-progress',
   '2025-11-16T00:00:00Z', '2025-12-15T00:00:00Z', 70,
   '[
     {"id": "pd-2-1", "text": "Client portal with share links", "completed": true},
     {"id": "pd-2-2", "text": "Testing tracker", "completed": true},
     {"id": "pd-2-3", "text": "Project milestone tracking", "completed": false}
   ]'::jsonb,
   ARRAY['Full Stack Team'], ARRAY['pulse-dash-m1'], 2, '#3B82F6')
ON CONFLICT (id) DO UPDATE SET deliverables = EXCLUDED.deliverables;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count projects and milestones
SELECT
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(m.id) as total_milestones,
  SUM(jsonb_array_length(m.deliverables)) as total_deliverables
FROM projects p
LEFT JOIN project_milestones m ON p.id = m.project_id;

-- View all projects with milestone count
SELECT
  p.id,
  p.name,
  p.overall_progress,
  COUNT(m.id) as milestone_count,
  SUM(jsonb_array_length(m.deliverables)) as deliverables_count
FROM projects p
LEFT JOIN project_milestones m ON p.id = m.project_id
GROUP BY p.id, p.name, p.overall_progress
ORDER BY p.overall_progress DESC;

-- View deliverables by project
SELECT
  p.name as project,
  m.name as milestone,
  m.progress,
  jsonb_array_length(m.deliverables) as deliverable_count
FROM projects p
JOIN project_milestones m ON p.id = m.project_id
ORDER BY p.name, m."order";
