-- =====================================================
-- COMPLETE MIGRATION SCRIPT FOR SUPABASE DATABASE
-- =====================================================
-- This script creates all tables and functions for:
-- 1. Bug Tracking System (LinkList & Neuro360)
-- 2. Testing Tracker System
-- 3. Image Storage System
-- 4. LinkList NFC Projects Management
--
-- Execute this entire script in Supabase SQL Editor
-- Date: 2024-10-25
-- =====================================================

-- ===== MIGRATION 001: Bug Reports Table =====

-- Create bug_reports table
CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name VARCHAR(100) NOT NULL CHECK (project_name IN ('LinkList', 'Neuro360')),
    project_version VARCHAR(50),
    sno INTEGER NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    module VARCHAR(255) NOT NULL,
    screen VARCHAR(255) NOT NULL,
    snag TEXT NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('P1', 'P2', 'P3')),
    image_url TEXT,
    comments TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Testing', 'Verified', 'Closed', 'Reopened')),
    testing_status VARCHAR(20) DEFAULT 'Pending' CHECK (testing_status IN ('Pending', 'Pass', 'Fail', 'Blocked')),
    assigned_to VARCHAR(255),
    reported_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Create unique constraint for project + sno combination
    CONSTRAINT unique_project_sno UNIQUE (project_name, sno)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bug_reports_project_name ON public.bug_reports(project_name);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON public.bug_reports(severity);
CREATE INDEX IF NOT EXISTS idx_bug_reports_assigned_to ON public.bug_reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_bug_reports_date ON public.bug_reports(date);
CREATE INDEX IF NOT EXISTS idx_bug_reports_module ON public.bug_reports(module);

-- Enable Row Level Security
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Allow all operations on bug_reports for authenticated users" ON public.bug_reports;
CREATE POLICY "Allow all operations on bug_reports for authenticated users"
ON public.bug_reports
FOR ALL
USING (true);

-- ===== MIGRATION 002: LinkList NFC Projects Table =====

-- Create LinkList NFC Projects table
CREATE TABLE IF NOT EXISTS public.linklist_nfc_projects (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Project identification
    project_name VARCHAR(255) NOT NULL,
    project_description TEXT,

    -- NFC technical specifications
    nfc_tag_type VARCHAR(50) CHECK (nfc_tag_type IN ('NTAG213', 'NTAG215', 'NTAG216', 'NTAG424', 'Mifare Classic', 'Other')),
    nfc_data_format VARCHAR(50) CHECK (nfc_data_format IN ('URL', 'vCard', 'Text', 'WiFi', 'Email', 'SMS', 'Phone', 'Application', 'Custom')),
    nfc_payload JSONB DEFAULT '{}',

    -- Project management
    project_status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (project_status IN ('Draft', 'Active', 'Inactive', 'Deployed', 'Completed', 'Cancelled')),
    project_priority VARCHAR(10) DEFAULT 'Medium' CHECK (project_priority IN ('Low', 'Medium', 'High', 'Critical')),

    -- Team and assignments
    created_by VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255),
    client_name VARCHAR(255),

    -- Deployment details
    deployment_location VARCHAR(255),
    tag_quantity INTEGER DEFAULT 1 CHECK (tag_quantity > 0),

    -- Timeline
    estimated_completion_date DATE,
    actual_completion_date DATE,

    -- Financial
    project_budget DECIMAL(10,2),
    project_cost DECIMAL(10,2),

    -- Additional information
    notes TEXT,

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for LinkList NFC projects
CREATE INDEX IF NOT EXISTS idx_linklist_nfc_projects_status ON public.linklist_nfc_projects(project_status);
CREATE INDEX IF NOT EXISTS idx_linklist_nfc_projects_priority ON public.linklist_nfc_projects(project_priority);
CREATE INDEX IF NOT EXISTS idx_linklist_nfc_projects_created_by ON public.linklist_nfc_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_linklist_nfc_projects_assigned_to ON public.linklist_nfc_projects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_linklist_nfc_projects_client ON public.linklist_nfc_projects(client_name);
CREATE INDEX IF NOT EXISTS idx_linklist_nfc_projects_created_at ON public.linklist_nfc_projects(created_at);
CREATE INDEX IF NOT EXISTS idx_linklist_nfc_projects_completion_date ON public.linklist_nfc_projects(estimated_completion_date);

-- Create a composite index for project searches
CREATE INDEX IF NOT EXISTS idx_linklist_nfc_projects_search ON public.linklist_nfc_projects(project_status, project_priority, created_by);

-- Enable Row Level Security for NFC projects
ALTER TABLE public.linklist_nfc_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for NFC projects
DROP POLICY IF EXISTS "Allow all operations on linklist_nfc_projects" ON public.linklist_nfc_projects;
CREATE POLICY "Allow all operations on linklist_nfc_projects"
ON public.linklist_nfc_projects FOR ALL USING (true);

-- Add foreign key relationship to bug_reports table for integration
-- This allows bug reports to reference NFC projects
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'bug_reports' AND column_name = 'nfc_project_id') THEN
        ALTER TABLE public.bug_reports ADD COLUMN nfc_project_id UUID REFERENCES public.linklist_nfc_projects(id);
        CREATE INDEX idx_bug_reports_nfc_project_id ON public.bug_reports(nfc_project_id);
    END IF;
END $$;

-- ===== MIGRATION 003: Testing Tracker Table =====

-- Create testing_tracker table
CREATE TABLE IF NOT EXISTS public.testing_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bug_report_id UUID NOT NULL REFERENCES public.bug_reports(id) ON DELETE CASCADE,
    project_name VARCHAR(100) NOT NULL CHECK (project_name IN ('LinkList', 'Neuro360')),
    test_case_name VARCHAR(255) NOT NULL,
    test_description TEXT,
    expected_result TEXT,
    actual_result TEXT,
    test_status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (test_status IN ('Pass', 'Fail', 'Blocked', 'Pending')),
    tester_name VARCHAR(255) NOT NULL,
    test_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_testing_tracker_bug_report_id ON public.testing_tracker(bug_report_id);
CREATE INDEX IF NOT EXISTS idx_testing_tracker_project_name ON public.testing_tracker(project_name);
CREATE INDEX IF NOT EXISTS idx_testing_tracker_test_status ON public.testing_tracker(test_status);
CREATE INDEX IF NOT EXISTS idx_testing_tracker_tester_name ON public.testing_tracker(tester_name);
CREATE INDEX IF NOT EXISTS idx_testing_tracker_test_date ON public.testing_tracker(test_date);

-- Enable Row Level Security
ALTER TABLE public.testing_tracker ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Allow all operations on testing_tracker for authenticated users" ON public.testing_tracker;
CREATE POLICY "Allow all operations on testing_tracker for authenticated users"
ON public.testing_tracker
FOR ALL
USING (true);

-- ===== MIGRATION 004: Project Images Table =====

-- Create project_images table
CREATE TABLE IF NOT EXISTS public.project_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bug_report_id UUID NOT NULL REFERENCES public.bug_reports(id) ON DELETE CASCADE,
    project_name VARCHAR(100) NOT NULL CHECK (project_name IN ('LinkList', 'Neuro360')),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    content_type VARCHAR(100),
    uploaded_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure file path is unique
    CONSTRAINT unique_file_path UNIQUE (file_path)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_images_bug_report_id ON public.project_images(bug_report_id);
CREATE INDEX IF NOT EXISTS idx_project_images_project_name ON public.project_images(project_name);
CREATE INDEX IF NOT EXISTS idx_project_images_uploaded_by ON public.project_images(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_project_images_content_type ON public.project_images(content_type);

-- Enable Row Level Security
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Allow all operations on project_images for authenticated users" ON public.project_images;
CREATE POLICY "Allow all operations on project_images for authenticated users"
ON public.project_images
FOR ALL
USING (true);

-- ===== FUNCTIONS AND TRIGGERS =====

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at for all tables
DROP TRIGGER IF EXISTS update_bug_reports_updated_at ON public.bug_reports;
CREATE TRIGGER update_bug_reports_updated_at
    BEFORE UPDATE ON public.bug_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_testing_tracker_updated_at ON public.testing_tracker;
CREATE TRIGGER update_testing_tracker_updated_at
    BEFORE UPDATE ON public.testing_tracker
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_linklist_nfc_projects_updated_at ON public.linklist_nfc_projects;
CREATE TRIGGER trigger_update_linklist_nfc_projects_updated_at
    BEFORE UPDATE ON public.linklist_nfc_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get next serial number for a project
CREATE OR REPLACE FUNCTION public.get_next_bug_sno(project_name TEXT)
RETURNS INTEGER AS $$
DECLARE
    next_sno INTEGER;
BEGIN
    SELECT COALESCE(MAX(sno), 0) + 1
    INTO next_sno
    FROM public.bug_reports
    WHERE bug_reports.project_name = get_next_bug_sno.project_name;

    RETURN next_sno;
END;
$$ LANGUAGE plpgsql;

-- Create function to get testing summary for a bug report
CREATE OR REPLACE FUNCTION public.get_testing_summary(bug_id UUID)
RETURNS TABLE (
    total_tests BIGINT,
    passed_tests BIGINT,
    failed_tests BIGINT,
    blocked_tests BIGINT,
    pending_tests BIGINT,
    latest_test_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_tests,
        COUNT(*) FILTER (WHERE test_status = 'Pass') as passed_tests,
        COUNT(*) FILTER (WHERE test_status = 'Fail') as failed_tests,
        COUNT(*) FILTER (WHERE test_status = 'Blocked') as blocked_tests,
        COUNT(*) FILTER (WHERE test_status = 'Pending') as pending_tests,
        MAX(test_date) as latest_test_date
    FROM public.testing_tracker
    WHERE bug_report_id = bug_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update bug report testing status based on test results
CREATE OR REPLACE FUNCTION public.update_bug_testing_status()
RETURNS TRIGGER AS $$
DECLARE
    bug_id UUID;
    test_summary RECORD;
BEGIN
    -- Get the bug_report_id from the affected row
    IF TG_OP = 'DELETE' THEN
        bug_id := OLD.bug_report_id;
    ELSE
        bug_id := NEW.bug_report_id;
    END IF;

    -- Get testing summary for this bug
    SELECT * INTO test_summary FROM public.get_testing_summary(bug_id);

    -- Update bug report testing status based on test results
    IF test_summary.total_tests = 0 THEN
        UPDATE public.bug_reports
        SET testing_status = 'Pending'
        WHERE id = bug_id;
    ELSIF test_summary.failed_tests > 0 OR test_summary.blocked_tests > 0 THEN
        UPDATE public.bug_reports
        SET testing_status = 'Fail'
        WHERE id = bug_id;
    ELSIF test_summary.pending_tests > 0 THEN
        UPDATE public.bug_reports
        SET testing_status = 'Pending'
        WHERE id = bug_id;
    ELSE
        UPDATE public.bug_reports
        SET testing_status = 'Pass'
        WHERE id = bug_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update bug testing status
DROP TRIGGER IF EXISTS update_bug_testing_status_on_insert ON public.testing_tracker;
CREATE TRIGGER update_bug_testing_status_on_insert
    AFTER INSERT ON public.testing_tracker
    FOR EACH ROW
    EXECUTE FUNCTION public.update_bug_testing_status();

DROP TRIGGER IF EXISTS update_bug_testing_status_on_update ON public.testing_tracker;
CREATE TRIGGER update_bug_testing_status_on_update
    AFTER UPDATE ON public.testing_tracker
    FOR EACH ROW
    EXECUTE FUNCTION public.update_bug_testing_status();

DROP TRIGGER IF EXISTS update_bug_testing_status_on_delete ON public.testing_tracker;
CREATE TRIGGER update_bug_testing_status_on_delete
    AFTER DELETE ON public.testing_tracker
    FOR EACH ROW
    EXECUTE FUNCTION public.update_bug_testing_status();

-- Create function to get image summary for a bug report
CREATE OR REPLACE FUNCTION public.get_bug_images(bug_id UUID)
RETURNS TABLE (
    id UUID,
    file_name VARCHAR(255),
    file_path TEXT,
    file_size INTEGER,
    content_type VARCHAR(100),
    uploaded_by VARCHAR(255),
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pi.id,
        pi.file_name,
        pi.file_path,
        pi.file_size,
        pi.content_type,
        pi.uploaded_by,
        pi.created_at
    FROM public.project_images pi
    WHERE pi.bug_report_id = bug_id
    ORDER BY pi.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get storage usage statistics
CREATE OR REPLACE FUNCTION public.get_storage_stats()
RETURNS TABLE (
    project_name VARCHAR(100),
    total_images BIGINT,
    total_size_bytes BIGINT,
    avg_file_size_bytes NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pi.project_name,
        COUNT(*) as total_images,
        COALESCE(SUM(pi.file_size), 0) as total_size_bytes,
        COALESCE(AVG(pi.file_size), 0) as avg_file_size_bytes
    FROM public.project_images pi
    GROUP BY pi.project_name
    ORDER BY pi.project_name;
END;
$$ LANGUAGE plpgsql;

-- Create function to get NFC project statistics
CREATE OR REPLACE FUNCTION public.get_nfc_project_stats()
RETURNS TABLE (
    total_projects BIGINT,
    active_projects BIGINT,
    completed_projects BIGINT,
    draft_projects BIGINT,
    total_tags BIGINT,
    avg_project_duration NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_projects,
        COUNT(*) FILTER (WHERE project_status = 'Active') as active_projects,
        COUNT(*) FILTER (WHERE project_status = 'Completed') as completed_projects,
        COUNT(*) FILTER (WHERE project_status = 'Draft') as draft_projects,
        COALESCE(SUM(tag_quantity), 0) as total_tags,
        AVG(EXTRACT(EPOCH FROM (actual_completion_date - created_at::date))/86400) as avg_project_duration
    FROM public.linklist_nfc_projects;
END;
$$ LANGUAGE plpgsql;

-- Create function to search NFC projects
CREATE OR REPLACE FUNCTION public.search_nfc_projects(search_term VARCHAR)
RETURNS TABLE (
    id UUID,
    project_name VARCHAR,
    project_description TEXT,
    project_status VARCHAR,
    client_name VARCHAR,
    assigned_to VARCHAR,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.project_name, p.project_description, p.project_status,
           p.client_name, p.assigned_to, p.created_at
    FROM public.linklist_nfc_projects p
    WHERE
        p.project_name ILIKE '%' || search_term || '%' OR
        p.project_description ILIKE '%' || search_term || '%' OR
        p.client_name ILIKE '%' || search_term || '%' OR
        p.assigned_to ILIKE '%' || search_term || '%'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ===== STORAGE SETUP =====

-- Create storage bucket for bug report images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('bug-report-images', 'bug-report-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for storage buckets
DROP POLICY IF EXISTS "Allow authenticated users to upload bug report images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload bug report images"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'bug-report-images'
);

DROP POLICY IF EXISTS "Allow public access to view bug report images" ON storage.objects;
CREATE POLICY "Allow public access to view bug report images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'bug-report-images');

DROP POLICY IF EXISTS "Allow users to update their own bug report images" ON storage.objects;
CREATE POLICY "Allow users to update their own bug report images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'bug-report-images');

DROP POLICY IF EXISTS "Allow users to delete their own bug report images" ON storage.objects;
CREATE POLICY "Allow users to delete their own bug report images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'bug-report-images');

-- Create function to generate storage path for bug report images
CREATE OR REPLACE FUNCTION public.generate_bug_image_path(
    project_name TEXT,
    bug_report_id UUID,
    file_name TEXT
)
RETURNS TEXT AS $$
BEGIN
    RETURN format('%s/%s/%s/%s',
        LOWER(project_name),
        bug_report_id::text,
        EXTRACT(YEAR FROM NOW())::text,
        file_name
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to handle file upload and create database record
CREATE OR REPLACE FUNCTION public.handle_bug_image_upload(
    p_bug_report_id UUID,
    p_project_name TEXT,
    p_file_name TEXT,
    p_file_size INTEGER,
    p_content_type TEXT,
    p_uploaded_by TEXT
)
RETURNS UUID AS $$
DECLARE
    image_id UUID;
    file_path TEXT;
BEGIN
    -- Generate file path
    file_path := public.generate_bug_image_path(p_project_name, p_bug_report_id, p_file_name);

    -- Insert image record
    INSERT INTO public.project_images (
        bug_report_id,
        project_name,
        file_name,
        file_path,
        file_size,
        content_type,
        uploaded_by
    ) VALUES (
        p_bug_report_id,
        p_project_name,
        p_file_name,
        file_path,
        p_file_size,
        p_content_type,
        p_uploaded_by
    ) RETURNING id INTO image_id;

    RETURN image_id;
END;
$$ LANGUAGE plpgsql;

-- ===== SAMPLE DATA =====

-- Insert sample LinkList NFC project
INSERT INTO public.linklist_nfc_projects (
    project_name,
    project_description,
    nfc_tag_type,
    nfc_data_format,
    nfc_payload,
    project_status,
    project_priority,
    created_by,
    assigned_to,
    client_name,
    deployment_location,
    tag_quantity,
    estimated_completion_date,
    project_budget,
    notes
) VALUES
(
    'Smart Business Cards - TechCorp',
    'Digital business cards with NFC technology for TechCorp executives',
    'NTAG213',
    'vCard',
    '{"name": "John Doe", "title": "CEO", "company": "TechCorp", "email": "john@techcorp.com", "phone": "+1234567890"}',
    'Active',
    'High',
    'project.manager@linklist.com',
    'developer@linklist.com',
    'TechCorp Inc.',
    'Corporate Headquarters',
    50,
    CURRENT_DATE + INTERVAL '30 days',
    5000.00,
    'Premium NFC business cards with custom branding'
) ON CONFLICT DO NOTHING;

-- Insert sample bug reports for both projects with proper SNO values
INSERT INTO public.bug_reports (
    project_name,
    project_version,
    sno,
    module,
    screen,
    snag,
    severity,
    reported_by
) VALUES
(
    'Neuro360',
    '1.0.0',
    1,
    'Authentication',
    'Login Page',
    'User cannot login with valid credentials',
    'P1',
    'qa@neuro360.com'
),
(
    'LinkList',
    '2.0.0',
    1,
    'NFC Programming',
    'Tag Writer',
    'NFC write operation fails on NTAG213 tags',
    'P2',
    'qa@linklist.com'
) ON CONFLICT (project_name, sno) DO NOTHING;

-- Add table comments for documentation
COMMENT ON TABLE public.bug_reports IS 'Store bug reports for LinkList and Neuro360 projects';
COMMENT ON TABLE public.testing_tracker IS 'Track testing activities and results for bug reports';
COMMENT ON TABLE public.project_images IS 'Store uploaded images and files for bug reports';
COMMENT ON TABLE public.linklist_nfc_projects IS 'Store comprehensive information about NFC projects for LinkList platform';

-- ===== VERIFICATION QUERIES =====

-- Check if all tables exist
SELECT
    schemaname,
    tablename,
    CASE
        WHEN tablename IN ('bug_reports', 'testing_tracker', 'project_images', 'linklist_nfc_projects')
        THEN '✅ Required table'
        ELSE 'ℹ️ Other table'
    END as status
FROM pg_tables
WHERE tablename IN ('bug_reports', 'testing_tracker', 'project_images', 'linklist_nfc_projects')
AND schemaname = 'public'
ORDER BY tablename;

-- Check if all functions exist
SELECT
    routine_name,
    routine_type,
    '✅ Function created' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (routine_name LIKE '%bug%'
     OR routine_name LIKE '%testing%'
     OR routine_name LIKE '%image%'
     OR routine_name LIKE '%nfc%')
ORDER BY routine_name;

-- Check if storage bucket exists
SELECT
    id,
    name,
    public,
    file_size_limit,
    '✅ Storage bucket configured' as status
FROM storage.buckets
WHERE id = 'bug-report-images';

-- Final success message
SELECT
    '🎉 DATABASE MIGRATION COMPLETED SUCCESSFULLY!' as status,
    COUNT(*) as total_tables_created
FROM pg_tables
WHERE tablename IN ('bug_reports', 'testing_tracker', 'project_images', 'linklist_nfc_projects')
AND schemaname = 'public';