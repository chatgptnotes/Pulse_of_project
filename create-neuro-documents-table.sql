-- Create table for storing document metadata
-- This tracks all documents uploaded to the neuro_bucket

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_uploaded_at ON project_documents(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_documents_file_type ON project_documents(file_type);

-- Enable Row Level Security (RLS)
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for document access
-- Policy: Anyone can view all documents
CREATE POLICY "Allow all to view project documents"
  ON project_documents
  FOR SELECT
  TO public
  USING (true);

-- Policy: Anyone can insert documents
CREATE POLICY "Allow all to upload documents"
  ON project_documents
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Anyone can update documents
CREATE POLICY "Allow all to update documents"
  ON project_documents
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Policy: Anyone can delete documents
CREATE POLICY "Allow all to delete documents"
  ON project_documents
  FOR DELETE
  TO public
  USING (true);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_project_documents_updated_at ON project_documents;
CREATE TRIGGER update_project_documents_updated_at
  BEFORE UPDATE ON project_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust based on your authentication setup)
-- GRANT ALL ON project_documents TO authenticated;
-- GRANT ALL ON project_documents TO anon;

COMMENT ON TABLE project_documents IS 'Stores metadata for documents uploaded to neuro_bucket';
COMMENT ON COLUMN project_documents.project_id IS 'ID of the project this document belongs to';
COMMENT ON COLUMN project_documents.file_path IS 'Path in Supabase Storage (project_id/timestamp-filename)';
COMMENT ON COLUMN project_documents.file_type IS 'Category: document, spreadsheet, presentation, image, archive, other';
COMMENT ON COLUMN project_documents.is_public IS 'Whether the document is publicly accessible';
