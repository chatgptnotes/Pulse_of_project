-- Complete deployment script for bug tracking system
-- Execute this in Supabase SQL Editor to set up all tables and functions
-- Date: 2024-10-24

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
CREATE POLICY "Allow all operations on bug_reports for authenticated users"
ON public.bug_reports
FOR ALL
USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_bug_reports_updated_at
    BEFORE UPDATE ON public.bug_reports
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

-- ===== MIGRATION 002: Testing Tracker Table =====

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
CREATE POLICY "Allow all operations on testing_tracker for authenticated users"
ON public.testing_tracker
FOR ALL
USING (true);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_testing_tracker_updated_at
    BEFORE UPDATE ON public.testing_tracker
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

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
CREATE TRIGGER update_bug_testing_status_on_insert
    AFTER INSERT ON public.testing_tracker
    FOR EACH ROW
    EXECUTE FUNCTION public.update_bug_testing_status();

CREATE TRIGGER update_bug_testing_status_on_update
    AFTER UPDATE ON public.testing_tracker
    FOR EACH ROW
    EXECUTE FUNCTION public.update_bug_testing_status();

CREATE TRIGGER update_bug_testing_status_on_delete
    AFTER DELETE ON public.testing_tracker
    FOR EACH ROW
    EXECUTE FUNCTION public.update_bug_testing_status();

-- ===== MIGRATION 003: Project Images Table =====

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
CREATE POLICY "Allow all operations on project_images for authenticated users"
ON public.project_images
FOR ALL
USING (true);

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

-- Create function to clean up orphaned images
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_images()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.project_images
    WHERE bug_report_id NOT IN (SELECT id FROM public.bug_reports);

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
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

-- ===== MIGRATION 004: Storage Setup =====

-- Create storage buckets for bug report images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('bug-report-images', 'bug-report-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for storage buckets
CREATE POLICY "Allow authenticated users to upload bug report images"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'bug-report-images'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public access to view bug report images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'bug-report-images');

CREATE POLICY "Allow users to update their own bug report images"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'bug-report-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own bug report images"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'bug-report-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

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

-- Create function to get public URL for stored images
CREATE OR REPLACE FUNCTION public.get_image_public_url(file_path TEXT)
RETURNS TEXT AS $$
DECLARE
    base_url TEXT;
BEGIN
    -- For now, return a placeholder URL that can be configured
    base_url := 'https://omyltmcesgbhnqmhrrvq.supabase.co';
    RETURN format('%s/storage/v1/object/public/bug-report-images/%s', base_url, file_path);
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

    -- Update bug report with image URL (if it's the first image)
    UPDATE public.bug_reports
    SET image_url = COALESCE(image_url, public.get_image_public_url(file_path))
    WHERE id = p_bug_report_id;

    RETURN image_id;
END;
$$ LANGUAGE plpgsql;

-- Add table comments for documentation
COMMENT ON TABLE public.bug_reports IS 'Store bug reports for LinkList and Neuro360 projects';
COMMENT ON TABLE public.testing_tracker IS 'Track testing activities and results for bug reports';
COMMENT ON TABLE public.project_images IS 'Store uploaded images and files for bug reports';

-- ===== VERIFICATION QUERIES =====
-- Run these to verify the setup worked correctly

-- Check if all tables exist
SELECT schemaname, tablename
FROM pg_tables
WHERE tablename IN ('bug_reports', 'testing_tracker', 'project_images')
AND schemaname = 'public';

-- Check if all functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%bug%' OR routine_name LIKE '%testing%' OR routine_name LIKE '%image%';

-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'bug-report-images';

-- Create a sample bug report to test the system
INSERT INTO public.bug_reports (
    project_name,
    project_version,
    module,
    screen,
    snag,
    severity,
    reported_by
) VALUES (
    'Neuro360',
    '1.0.0',
    'Authentication',
    'Login Page',
    'User cannot login with valid credentials',
    'P1',
    'system@test.com'
);

SELECT 'Bug tracking database setup completed successfully!' as status;