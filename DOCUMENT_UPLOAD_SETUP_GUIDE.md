# Document Upload Functionality Setup Guide

## Overview

This guide explains how to set up and use the document upload functionality in PulseOfProject. The system uses Supabase Storage for secure file storage and a PostgreSQL database table for metadata tracking.

## Architecture

The document upload system consists of:

1. **Supabase Storage Bucket** (`project-documents`) - Stores the actual files
2. **Database Table** (`project_documents`) - Stores metadata about uploaded documents
3. **Storage Policies** - Row Level Security (RLS) policies for access control
4. **Document Service** (`documentStorageService.ts`) - API for file operations
5. **UI Component** (`ProjectDocuments.tsx`) - User interface for document management

## File Structure

```
pulseofproject-main/
├── supabase/
│   └── migrations/
│       ├── 20250107_create_project_documents.sql      # Database table migration
│       └── 20250107_create_storage_bucket.sql         # Storage policies migration
├── apps/web/src/
│   ├── services/
│   │   ├── supabaseService.ts                         # Supabase client
│   │   └── documentStorageService.ts                  # Document operations
│   └── modules/project-tracking/components/
│       └── ProjectDocuments.tsx                       # UI component
└── setup-storage-bucket.js                            # Automated setup script
```

## Setup Instructions

### Step 1: Verify Environment Variables

Ensure your `.env` file contains the required Supabase credentials:

```env
# Project Tracking Supabase
VITE_SUPABASE_URL=https://winhdjtlwhgdoinfrxch.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_BUGTRACKING_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 2: Create the Storage Bucket

You have two options:

#### Option A: Automated Setup (Recommended)

Run the setup script:

```bash
node setup-storage-bucket.js
```

This script will:
- Check if the bucket already exists
- Create the `project-documents` bucket with proper configuration
- Test bucket access
- Provide next steps

#### Option B: Manual Setup via Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `project-documents`
   - **Public**: Unchecked (private bucket)
   - **File size limit**: 50 MB (52428800 bytes)
   - **Allowed MIME types**:
     ```
     application/pdf
     application/msword
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
     application/vnd.ms-powerpoint
     application/vnd.openxmlformats-officedocument.presentationml.presentation
     application/vnd.ms-excel
     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
     image/jpeg
     image/png
     image/gif
     image/webp
     image/svg+xml
     text/plain
     text/markdown
     text/csv
     application/zip
     ```
5. Click **Create bucket**

### Step 3: Run Database Migrations

#### Option A: Via Supabase Dashboard (Easiest)

1. Go to **SQL Editor** in your Supabase Dashboard
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/20250107_create_project_documents.sql`
4. Click **Run**
5. Verify no errors appear

#### Option B: Via Supabase CLI

If you have Supabase CLI installed:

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your project
supabase link --project-ref winhdjtlwhgdoinfrxch

# Run the migration
supabase db push
```

### Step 4: Configure Storage Policies

1. Go to **SQL Editor** in your Supabase Dashboard
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/20250107_create_storage_bucket.sql`
4. Click **Run**
5. Verify the policies were created under **Storage > Policies**

### Step 5: Verify Setup

#### Check Database Table

Run this query in SQL Editor:

```sql
SELECT * FROM project_documents LIMIT 1;
```

You should see an empty result set (no errors).

#### Check Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Verify `project-documents` bucket exists
3. Click on the bucket and verify policies are configured

#### Test File Upload

1. Start your application: `npm run dev`
2. Navigate to a project view
3. Scroll to the "Project Documents" section
4. Click "Upload Document"
5. Select a test file (PDF, image, or document)
6. Verify:
   - Upload progress appears
   - Success message is shown
   - Document appears in the list
   - You can download the document

## Database Schema

### `project_documents` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `project_id` | TEXT | Associated project identifier |
| `filename` | TEXT | Original filename |
| `file_path` | TEXT | Path in storage bucket (unique) |
| `file_size` | BIGINT | File size in bytes |
| `file_type` | TEXT | Categorized type (document, image, etc.) |
| `mime_type` | TEXT | MIME type of the file |
| `uploaded_by` | TEXT | User who uploaded the file |
| `uploaded_at` | TIMESTAMPTZ | Upload timestamp (default: NOW()) |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `description` | TEXT | Optional description |
| `tags` | TEXT[] | Array of tags for categorization |
| `is_public` | BOOLEAN | Whether document is publicly accessible |

### Indexes

- `idx_project_documents_project_id` - Fast lookups by project
- `idx_project_documents_uploaded_by` - Filter by uploader
- `idx_project_documents_uploaded_at` - Sort by date
- `idx_project_documents_file_type` - Filter by file type

## Security Policies

### Row Level Security (RLS)

The following RLS policies are configured:

1. **Users can view documents for their projects**
   - Allows authenticated users to SELECT documents
   - In production, add project membership checks

2. **Users can upload documents to their projects**
   - Allows authenticated users to INSERT documents
   - In production, verify project access

3. **Users can update their own uploaded documents**
   - Allows users to UPDATE only documents they uploaded
   - Checks `uploaded_by` field

4. **Users can delete their own uploaded documents**
   - Allows users to DELETE only documents they uploaded
   - Checks `uploaded_by` field

5. **Public documents are viewable by all**
   - Allows anyone to view documents with `is_public = TRUE`

### Storage Policies

Similar policies are configured for the storage bucket:

- **Authenticated users can upload** - INSERT on storage.objects
- **Users can view documents** - SELECT on storage.objects
- **Users can update their own** - UPDATE on storage.objects
- **Users can delete their own** - DELETE on storage.objects

## API Usage

### Upload Document

```typescript
import documentStorageService from '@/services/documentStorageService';

const file = // File object from input
const projectId = 'neurosense-mvp';
const uploadedBy = 'user@example.com';

const result = await documentStorageService.uploadDocument(
  file,
  projectId,
  uploadedBy,
  {
    description: 'Project requirements document',
    tags: ['requirements', 'v1.0'],
    isPublic: false
  }
);

if (result.success) {
  console.log('Uploaded:', result.document);
  console.log('URL:', result.publicUrl);
} else {
  console.error('Error:', result.error);
}
```

### Upload Multiple Documents

```typescript
const files = Array.from(fileInput.files);

const results = await documentStorageService.uploadMultipleDocuments(
  files,
  projectId,
  uploadedBy
);

const successful = results.filter(r => r.success);
const failed = results.filter(r => !r.success);

console.log(`Uploaded ${successful.length} of ${files.length} files`);
```

### Get Project Documents

```typescript
const documents = await documentStorageService.getProjectDocuments(projectId);

documents.forEach(doc => {
  console.log(`${doc.filename} - ${doc.file_size} bytes`);
});
```

### Download Document

```typescript
const result = await documentStorageService.downloadDocument(filePath);

if (result.success && result.data) {
  const url = URL.createObjectURL(result.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

### Delete Document

```typescript
const success = await documentStorageService.deleteDocument(documentId);

if (success) {
  console.log('Document deleted');
} else {
  console.error('Delete failed');
}
```

### Search Documents

```typescript
const results = await documentStorageService.searchDocuments(
  projectId,
  'requirements'
);

console.log(`Found ${results.length} documents`);
```

### Get Signed URL

```typescript
// Get a temporary signed URL (valid for 1 hour)
const signedUrl = await documentStorageService.getSignedUrl(
  filePath,
  3600 // expires in 1 hour
);

if (signedUrl) {
  console.log('Temporary URL:', signedUrl);
}
```

## Supported File Types

The system supports the following file types:

### Documents
- PDF (`.pdf`)
- Microsoft Word (`.doc`, `.docx`)
- Plain text (`.txt`)
- Markdown (`.md`)

### Spreadsheets
- Microsoft Excel (`.xls`, `.xlsx`)
- CSV (`.csv`)

### Presentations
- Microsoft PowerPoint (`.ppt`, `.pptx`)

### Images
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)
- SVG (`.svg`)

### Archives
- ZIP (`.zip`)
- RAR (`.rar`)

### File Size Limit
- Maximum: 50 MB per file

## Troubleshooting

### Issue: "Bucket does not exist"

**Solution:**
1. Run `node setup-storage-bucket.js`
2. OR manually create the bucket in Supabase Dashboard

### Issue: "Row Level Security policy violation"

**Solution:**
1. Verify RLS policies are created:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'project_documents';
   ```
2. Check that you're authenticated when testing
3. Verify the policies match your auth setup

### Issue: "Storage policy violation"

**Solution:**
1. Go to **Storage > Policies** in Supabase Dashboard
2. Verify policies exist for `project-documents` bucket
3. Run the storage policies migration SQL

### Issue: "File upload fails"

**Checklist:**
- [ ] File size is under 50 MB
- [ ] File type is in the allowed list
- [ ] User is authenticated
- [ ] Bucket exists and is accessible
- [ ] Storage policies are configured
- [ ] Service role key has proper permissions

### Issue: "Cannot read properties of undefined"

**Solution:**
1. Verify Supabase credentials in `.env`
2. Check that `supabaseService` is properly initialized
3. Ensure all imports are correct

## Production Considerations

### 1. Authentication

Update the RLS policies to use actual user authentication:

```sql
-- Example: Check project membership
CREATE POLICY "Users can view project documents"
  ON project_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_documents.project_id
      AND project_members.user_id = auth.uid()
    )
  );
```

### 2. File Validation

Add server-side validation:
- Virus scanning
- Content type verification
- File size limits per user role
- Filename sanitization

### 3. Storage Optimization

Consider:
- CDN integration for public documents
- Thumbnail generation for images
- File compression
- Archival of old documents

### 4. Monitoring

Set up monitoring for:
- Storage usage
- Upload/download rates
- Failed operations
- Policy violations

### 5. Backup

Configure:
- Regular storage bucket backups
- Database backups including metadata
- Disaster recovery procedures

## Advanced Features

### Add Document Versioning

```typescript
// Track document versions
const version = await documentStorageService.createDocumentVersion(
  documentId,
  newFile,
  uploadedBy
);
```

### Add Sharing Capabilities

```typescript
// Generate shareable link
const shareLink = await documentStorageService.generateShareLink(
  documentId,
  { expiresIn: 7 * 24 * 3600, password: 'optional' }
);
```

### Add Document Preview

```typescript
// Get preview URL for supported formats
const previewUrl = await documentStorageService.getPreviewUrl(
  filePath,
  { width: 800, height: 600 }
);
```

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Supabase documentation: https://supabase.com/docs/guides/storage
3. Check application logs for detailed error messages
4. Verify all migrations have been run successfully

## Summary

You've successfully set up document upload functionality with:

- Secure file storage in Supabase Storage
- Metadata tracking in PostgreSQL
- Row Level Security for access control
- Full CRUD operations via API
- User-friendly UI component
- Support for multiple file types
- Error handling and validation

The system is ready for use in development. Review the production considerations before deploying to production.
