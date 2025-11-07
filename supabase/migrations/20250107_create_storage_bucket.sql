-- Create Storage Bucket for Project Documents
-- This script sets up the Supabase Storage bucket and policies

-- Note: This SQL creates the bucket configuration
-- The bucket itself must be created via Supabase Dashboard or API first

-- Insert bucket configuration into storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-documents',
  'project-documents',
  false, -- not publicly accessible by default
  52428800, -- 50MB file size limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents for their projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Public documents are viewable" ON storage.objects;

-- Storage Policies for project-documents bucket

-- 1. Allow authenticated users to upload files to the project-documents bucket
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'project-documents'
    AND auth.role() = 'authenticated'
  );

-- 2. Allow authenticated users to read files from their projects
-- For now, allow all authenticated users to read all files
-- In production, you would check project membership
CREATE POLICY "Users can view documents for their projects"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'project-documents'
    AND auth.role() = 'authenticated'
  );

-- 3. Allow users to update their own uploaded files
-- Files are stored with path: {project-id}/{user-id}/{filename}
-- or {project-id}/{filename} depending on your preference
CREATE POLICY "Users can update their own documents"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'project-documents'
    AND auth.role() = 'authenticated'
    -- Add ownership check based on your file path structure
    -- For example: AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- 4. Allow users to delete their own uploaded files
CREATE POLICY "Users can delete their own documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'project-documents'
    AND auth.role() = 'authenticated'
    -- Add ownership check based on your file path structure
    -- For example: AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- 5. Optional: Allow public access to files marked as public in metadata
-- This would require checking against the project_documents table
-- CREATE POLICY "Public documents are viewable"
--   ON storage.objects
--   FOR SELECT
--   USING (
--     bucket_id = 'project-documents'
--     AND EXISTS (
--       SELECT 1 FROM project_documents
--       WHERE file_path = name
--       AND is_public = TRUE
--     )
--   );

-- Comments for documentation
COMMENT ON POLICY "Authenticated users can upload documents" ON storage.objects IS
  'Allows authenticated users to upload documents to the project-documents bucket';
COMMENT ON POLICY "Users can view documents for their projects" ON storage.objects IS
  'Allows authenticated users to view documents. Extend this policy to check project membership.';
