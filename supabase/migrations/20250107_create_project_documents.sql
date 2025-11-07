-- Create project_documents table to track uploaded documents
-- This table stores metadata about documents stored in Supabase Storage

CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT,
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,

  -- Add foreign key constraint if projects table exists
  -- Uncomment if you want strict referential integrity
  -- FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,

  -- Indexes for better query performance
  CONSTRAINT project_documents_file_path_unique UNIQUE(file_path)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_uploaded_by ON project_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_project_documents_uploaded_at ON project_documents(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_documents_file_type ON project_documents(file_type);

-- Enable Row Level Security
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view documents for their projects" ON project_documents;
DROP POLICY IF EXISTS "Users can upload documents to their projects" ON project_documents;
DROP POLICY IF EXISTS "Users can update their own uploaded documents" ON project_documents;
DROP POLICY IF EXISTS "Users can delete their own uploaded documents" ON project_documents;
DROP POLICY IF EXISTS "Public documents are viewable by all" ON project_documents;

-- RLS Policies

-- 1. Allow authenticated users to view documents for projects they have access to
-- For now, we'll allow all authenticated users to view all documents
-- In production, you would join with a project_members table or similar
CREATE POLICY "Users can view documents for their projects"
  ON project_documents
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    -- Add additional checks here for project membership if needed
    -- OR is_public = TRUE
  );

-- 2. Allow authenticated users to upload documents
CREATE POLICY "Users can upload documents to their projects"
  ON project_documents
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    -- Add additional checks here for project membership if needed
  );

-- 3. Allow users to update their own uploaded documents
CREATE POLICY "Users can update their own uploaded documents"
  ON project_documents
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND uploaded_by = auth.jwt() ->> 'email'
    -- Or use uploaded_by = auth.uid()::text if storing user IDs
  );

-- 4. Allow users to delete their own uploaded documents
CREATE POLICY "Users can delete their own uploaded documents"
  ON project_documents
  FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND uploaded_by = auth.jwt() ->> 'email'
    -- Or use uploaded_by = auth.uid()::text if storing user IDs
  );

-- 5. Allow anyone to view public documents
CREATE POLICY "Public documents are viewable by all"
  ON project_documents
  FOR SELECT
  USING (is_public = TRUE);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_project_documents_updated_at ON project_documents;
CREATE TRIGGER update_project_documents_updated_at
  BEFORE UPDATE ON project_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON project_documents TO authenticated;
GRANT SELECT ON project_documents TO anon;

-- Add comment for documentation
COMMENT ON TABLE project_documents IS 'Stores metadata for project documents uploaded to Supabase Storage';
COMMENT ON COLUMN project_documents.file_path IS 'Path in Supabase Storage bucket (e.g., project-id/filename.pdf)';
COMMENT ON COLUMN project_documents.is_public IS 'Whether this document is publicly accessible without authentication';
