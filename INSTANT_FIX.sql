-- ============================================================
-- INSTANT FIX FOR UPLOAD ERROR
-- ============================================================
-- Copy this ENTIRE file and paste in Supabase SQL Editor
-- This will fix the "row violates row-level security policy" error
-- ============================================================

-- STEP 1: Create database table for document metadata
-- ============================================================

CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT,
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_uploaded_at ON project_documents(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_documents_file_type ON project_documents(file_type);

-- Enable RLS on table
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

-- Drop old table policies if they exist
DROP POLICY IF EXISTS "Allow all to view project documents" ON project_documents;
DROP POLICY IF EXISTS "Allow all to upload documents" ON project_documents;
DROP POLICY IF EXISTS "Allow all to update documents" ON project_documents;
DROP POLICY IF EXISTS "Allow all to delete documents" ON project_documents;

-- Create new table policies (allow everyone)
CREATE POLICY "Allow all to view project documents"
  ON project_documents FOR SELECT TO public USING (true);

CREATE POLICY "Allow all to upload documents"
  ON project_documents FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow all to update documents"
  ON project_documents FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow all to delete documents"
  ON project_documents FOR DELETE TO public USING (true);

-- Create auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_project_documents_updated_at ON project_documents;
CREATE TRIGGER update_project_documents_updated_at
  BEFORE UPDATE ON project_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STEP 2: Fix Storage Bucket Policies (THE MAIN FIX!)
-- ============================================================

-- Drop old storage policies if they exist
DROP POLICY IF EXISTS "Allow all uploads to neuro_bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow all reads from neuro_bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow all updates to neuro_bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow all deletes from neuro_bucket" ON storage.objects;

-- Create storage policies for neuro_bucket
-- These fix the "row violates row-level security policy" error

CREATE POLICY "Allow all uploads to neuro_bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'neuro_bucket');

CREATE POLICY "Allow all reads from neuro_bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'neuro_bucket');

CREATE POLICY "Allow all updates to neuro_bucket"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'neuro_bucket')
WITH CHECK (bucket_id = 'neuro_bucket');

CREATE POLICY "Allow all deletes from neuro_bucket"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'neuro_bucket');

-- ============================================================
-- STEP 3: Verify Setup
-- ============================================================

-- Check if table was created
SELECT 'project_documents table exists' as status
WHERE EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'project_documents'
);

-- Check storage policies
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%neuro_bucket%';

-- ============================================================
-- SUCCESS! Now try uploading again in your app
-- ============================================================
