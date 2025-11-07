-- Migration: Add support for external links (Google Docs, Sheets, etc.)
-- This adds new columns to the project_documents table

-- Add external_url column to store the link URL
ALTER TABLE project_documents
ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Add is_external_link flag to distinguish links from uploaded files
ALTER TABLE project_documents
ADD COLUMN IF NOT EXISTS is_external_link BOOLEAN DEFAULT FALSE;

-- Update file_path constraint to allow NULL for external links
-- (external links don't have a storage file_path, they use external_url instead)
ALTER TABLE project_documents
ALTER COLUMN file_path DROP NOT NULL;

-- Update file_size to allow 0 for external links
ALTER TABLE project_documents
ALTER COLUMN file_size SET DEFAULT 0;

-- Add index on is_external_link for faster filtering
CREATE INDEX IF NOT EXISTS idx_project_documents_is_external_link 
ON project_documents(is_external_link);

-- Add index on external_url for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_documents_external_url 
ON project_documents(external_url) 
WHERE external_url IS NOT NULL;

-- Add comment explaining the schema
COMMENT ON COLUMN project_documents.external_url IS 'URL for external links (Google Docs, Sheets, websites, etc.)';
COMMENT ON COLUMN project_documents.is_external_link IS 'True if this is an external link rather than an uploaded file';
