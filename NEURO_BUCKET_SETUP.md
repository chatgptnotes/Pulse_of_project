# Neuro Bucket Document Upload Setup

## Overview
Your Project Documents section is now configured to upload files to the `neuro_bucket` Supabase Storage bucket.

## Setup Steps

### 1. Create Database Table

Go to your Supabase Dashboard → SQL Editor and run this file:
```
create-neuro-documents-table.sql
```

This will create:
- `project_documents` table for storing document metadata
- Indexes for fast queries
- Row Level Security (RLS) policies
- Automatic timestamp updates

### 2. Verify Bucket Policies

Make sure your `neuro_bucket` has the following storage policies:

#### Policy 1: Allow uploads
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'neuro_bucket');
```

#### Policy 2: Allow downloads
```sql
CREATE POLICY "Allow authenticated downloads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'neuro_bucket');
```

#### Policy 3: Allow deletes
```sql
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'neuro_bucket');
```

### 3. Test the Upload


1. Go to your Project Documents section in the app
2. Click "Upload Document" button
3. Select a file (PDF, image, PPT, etc.)
4. File should upload and appear in the list
5. Click the download icon to download
6. Click the eye icon to preview (for supported formats)

## Supported File Types

- **Documents**: PDF, Word (.doc, .docx), Text (.txt, .md)
- **Spreadsheets**: Excel (.xls, .xlsx), CSV
- **Presentations**: PowerPoint (.ppt, .pptx)
- **Images**: JPG, PNG, GIF, WebP, SVG
- **Archives**: ZIP, RAR, TAR, GZ

**Maximum file size**: 50MB

## Features

✅ Upload multiple files at once
✅ Search documents by name
✅ Download uploaded documents
✅ Delete uploaded documents
✅ View file metadata (size, upload date, uploader)
✅ Automatic file organization by project

## File Storage Structure

Files are stored in the following path format:
```
neuro_bucket/
  └── {project-id}/
      └── {timestamp}-{filename}
```

Example: `neuro_bucket/project-123/1699123456789-report.pdf`

## Database Schema

The `project_documents` table tracks:
- `id` - Unique document ID
- `project_id` - Project this document belongs to
- `filename` - Original filename
- `file_path` - Path in Supabase Storage
- `file_size` - File size in bytes
- `file_type` - Category (document, image, etc.)
- `mime_type` - MIME type
- `uploaded_by` - Who uploaded it
- `uploaded_at` - When it was uploaded
- `description` - Optional description
- `tags` - Optional tags for categorization
- `is_public` - Public access flag

## Troubleshooting

### Upload fails with "403 Forbidden"
- Check that storage policies are correctly set
- Verify you're authenticated
- Check bucket name is exactly `neuro_bucket`

### Documents don't appear after upload
- Check browser console for errors
- Verify the database table was created
- Check that `project_documents` table has RLS policies

### Download doesn't work
- Verify storage download policy exists
- Check file_path in database matches actual storage path
- Try refreshing the page

## Security

- All files are stored in a private bucket
- Row Level Security (RLS) enforces access control
- File paths are unique to prevent overwrites
- File size limits prevent abuse (50MB max)

## Next Steps

After setup:
1. Test uploading a document
2. Test downloading a document
3. Test deleting a document
4. Verify search functionality works

## Support

If you encounter issues:
1. Check Supabase dashboard logs
2. Check browser console for errors
3. Verify all policies are created
4. Ensure bucket name matches exactly
