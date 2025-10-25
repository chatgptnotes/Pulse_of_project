-- Migration: Create project_images table
-- Description: Table to manage uploaded images and files for bug reports
-- Date: 2024-10-24

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
-- Policy: Allow all operations for authenticated users
CREATE POLICY "Allow all operations on project_images for authenticated users"
ON public.project_images
FOR ALL
USING (true);

-- Alternative: More restrictive policies (uncomment and modify as needed)
-- CREATE POLICY "Users can view all project images"
-- ON public.project_images
-- FOR SELECT
-- USING (true);

-- CREATE POLICY "Users can upload images"
-- ON public.project_images
-- FOR INSERT
-- WITH CHECK (true);

-- CREATE POLICY "Users can update their own uploaded images"
-- ON public.project_images
-- FOR UPDATE
-- USING (uploaded_by = auth.email());

-- CREATE POLICY "Users can delete their own uploaded images"
-- ON public.project_images
-- FOR DELETE
-- USING (uploaded_by = auth.email());

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

-- Create function to clean up orphaned images (images without bug reports)
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

-- Add comments for documentation
COMMENT ON TABLE public.project_images IS 'Store uploaded images and files for bug reports';
COMMENT ON COLUMN public.project_images.bug_report_id IS 'Reference to the associated bug report';
COMMENT ON COLUMN public.project_images.file_path IS 'Path to the file in Supabase storage';
COMMENT ON COLUMN public.project_images.file_size IS 'File size in bytes';
COMMENT ON FUNCTION public.get_bug_images(UUID) IS 'Get all images for a specific bug report';
COMMENT ON FUNCTION public.cleanup_orphaned_images() IS 'Remove images that no longer have associated bug reports';
COMMENT ON FUNCTION public.get_storage_stats() IS 'Get storage usage statistics by project';