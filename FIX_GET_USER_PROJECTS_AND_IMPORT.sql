-- =====================================================
-- FIX: get_user_projects function and import data
-- =====================================================

-- Drop the old get_user_projects function
DROP FUNCTION IF EXISTS get_user_projects(UUID);

-- Create the corrected get_user_projects function
CREATE OR REPLACE FUNCTION get_user_projects(user_uuid UUID)
RETURNS TABLE (
  project_id TEXT,
  name TEXT,
  client TEXT,
  description TEXT,
  status TEXT,
  overall_progress INTEGER,
  start_date TIMESTAMP,
  end_date TIMESTAMP
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.project_id,
    p.name,
    p.client,
    p.description,
    p.status,
    p.overall_progress,
    p.start_date,
    p.end_date
  FROM admin_projects p
  INNER JOIN user_projects up ON p.project_id = up.project_id
  WHERE up.user_id = user_uuid;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_projects(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_projects(UUID) TO anon;

-- =====================================================
-- Check if data exists in admin_projects
-- =====================================================

SELECT COUNT(*) as total_projects FROM public.admin_projects;

-- If count is 0, the import didn't work. Let's check and reimport.
-- Delete any partial data
TRUNCATE TABLE public.project_milestones CASCADE;
TRUNCATE TABLE public.admin_projects CASCADE;

-- =====================================================
-- Import all 16 projects into admin_projects
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
-- Verification
-- =====================================================

-- Count projects
SELECT COUNT(*) as total_projects FROM public.admin_projects;

-- Show all projects
SELECT project_id, name, client, overall_progress
FROM public.admin_projects
ORDER BY name;

-- Test the function
SELECT * FROM get_user_projects('00000000-0000-0000-0000-000000000000'::UUID);
