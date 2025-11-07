# External Links Feature - Database Setup

## Overview
This feature allows users to add Google Docs, Google Sheets, or any website links alongside uploaded documents, with descriptions/comments for each.

## Database Migration Required

To enable external links, you need to add two new columns to the `project_documents` table.

### Option 1: Run SQL in Supabase Dashboard

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project (`winhdjtlwhgdoinfrxch`)
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Paste and run the following SQL:

```sql
-- Add external_url column to store the link URL
ALTER TABLE project_documents
ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Add is_external_link flag to distinguish links from uploaded files
ALTER TABLE project_documents
ADD COLUMN IF NOT EXISTS is_external_link BOOLEAN DEFAULT FALSE;
```

6. Click "Run" to execute the migration

### Option 2: Use the Migration Script

The migration SQL is available in:
```
apps/web/database-migrations/add-external-link-support.sql
```

## Features Enabled

After running the migration, users will be able to:

✅ **Upload Files** with descriptions
- Select one or multiple files
- Add a required description/comment
- Files are stored in Supabase Storage (`neuro_bucket`)

✅ **Add External Links** with descriptions
- Paste Google Docs, Sheets, Drive, or any website URL
- Provide a title for the link
- Add a required description/comment
- Links are saved as metadata (no file upload needed)

✅ **View Documents with Comments**
- All documents and links display with their descriptions
- External links show with a purple "External Link" badge
- Uploaded files show with file size and metadata
- Comments are visible in a styled box with icon

✅ **Client Access**
- Clients accessing via share links can upload files and add links
- Clients can view all documents and their descriptions
- Delete functionality is restricted to admin users only

## UI Components

### Upload Modal
- **Tabs**: Switch between "Upload Files" and "Add Link"
- **File Upload Tab**:
  - File selector supporting multiple files
  - Required description field
  - Supported formats: PDF, Word, Excel, PowerPoint, Images, Archives
- **Add Link Tab**:
  - URL input field (required)
  - Title input field (required)
  - Description field (required)
  - Info box showing supported link types

### Document List
- Purple link icon for external links
- Blue file icon for uploaded documents
- Description/comment displayed in gray box with message icon
- "Open Link" button (purple) for external links
- "Download" button (green) for uploaded files
- Delete button (red) only visible in edit mode

## Code Changes

### Files Modified

1. **documentStorageService.ts**
   - Added `external_url` and `is_external_link` to `DocumentMetadata` interface
   - Added `addExternalLink()` method to save link metadata
   - Updated `deleteDocument()` to skip storage deletion for external links

2. **ProjectDocuments.tsx**
   - Added upload modal with file/link tabs
   - Added description/comment field (required for both modes)
   - Updated document list to display descriptions
   - Added visual distinction for external links vs files
   - Changed "Download" button to "Open Link" for external links

## Testing

To test the feature:

1. Start the development server: `pnpm dev`
2. Navigate to any project page (e.g., http://localhost:3000/client/lbw-share-x7k9p)
3. Click "Add Document / Link" button
4. **Test File Upload**:
   - Select "Upload Files" tab
   - Choose a file
   - Enter a description
   - Click "Upload Files"
5. **Test Link Upload**:
   - Select "Add Link" tab
   - Paste a Google Sheets/Docs URL
   - Enter a title
   - Enter a description
   - Click "Save Link"
6. Verify both appear in the document list with descriptions visible

## Rollback

If you need to remove these columns:

```sql
ALTER TABLE project_documents DROP COLUMN IF EXISTS external_url;
ALTER TABLE project_documents DROP COLUMN IF EXISTS is_external_link;
```
