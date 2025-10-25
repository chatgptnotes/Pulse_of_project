-- Migration: Setup storage buckets for bug report images
-- Description: Create and configure storage buckets for file uploads
-- Date: 2024-10-24

-- Create storage buckets for bug report images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('bug-report-images', 'bug-report-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for storage buckets
-- Policy: Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload bug report images"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'bug-report-images'
    AND auth.role() = 'authenticated'
);

-- Policy: Allow public access to view images
CREATE POLICY "Allow public access to view bug report images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'bug-report-images');

-- Policy: Allow users to update their own uploaded images
CREATE POLICY "Allow users to update their own bug report images"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'bug-report-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to delete their own uploaded images
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
    -- Get the Supabase project URL from settings (you may need to adjust this)
    SELECT value INTO base_url FROM pg_settings WHERE name = 'app.settings.supabase_url';

    -- If base_url is not found, use a placeholder (will need to be configured)
    IF base_url IS NULL THEN
        base_url := 'https://your-project.supabase.co';
    END IF;

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

-- Add comments for documentation
COMMENT ON FUNCTION public.generate_bug_image_path(TEXT, UUID, TEXT) IS 'Generate organized storage path for bug report images';
COMMENT ON FUNCTION public.get_image_public_url(TEXT) IS 'Get public URL for accessing stored images';
COMMENT ON FUNCTION public.handle_bug_image_upload(UUID, TEXT, TEXT, INTEGER, TEXT, TEXT) IS 'Handle complete image upload process with database record creation';