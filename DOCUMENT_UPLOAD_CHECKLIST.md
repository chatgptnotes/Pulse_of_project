# Document Upload Implementation Checklist

## Setup Verification Checklist

Use this checklist to ensure the document upload system is properly configured.

### Pre-Setup

- [ ] Supabase project is active and accessible
- [ ] `.env` file contains required variables:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_BUGTRACKING_SERVICE_ROLE_KEY`
- [ ] Node.js and npm are installed
- [ ] Application dependencies are installed (`npm install`)

### Step 1: Storage Bucket Creation

- [ ] Run automated setup: `node setup-storage-bucket.js`
  - [ ] Script completes without errors
  - [ ] Success message displayed
- [ ] OR manually create bucket in Supabase Dashboard:
  - [ ] Navigate to Storage section
  - [ ] Create new bucket named `project-documents`
  - [ ] Set as private (not public)
  - [ ] Set file size limit to 50MB
  - [ ] Configure allowed MIME types

### Step 2: Database Migration

- [ ] Open Supabase Dashboard SQL Editor
- [ ] Create new query
- [ ] Copy contents of `supabase/migrations/20250107_create_project_documents.sql`
- [ ] Execute query
- [ ] Verify success (no error messages)
- [ ] Confirm table exists:
  ```sql
  SELECT * FROM project_documents LIMIT 1;
  ```

### Step 3: Storage Policies

- [ ] Open Supabase Dashboard SQL Editor
- [ ] Create new query
- [ ] Copy contents of `supabase/migrations/20250107_create_storage_bucket.sql`
- [ ] Execute query
- [ ] Verify success (no error messages)
- [ ] Navigate to Storage > project-documents > Policies
- [ ] Confirm 4-5 policies are listed

### Step 4: Verify Database Schema

Run these queries in SQL Editor:

- [ ] Check table structure:
  ```sql
  \d project_documents
  ```
- [ ] Verify indexes exist:
  ```sql
  SELECT indexname FROM pg_indexes WHERE tablename = 'project_documents';
  ```
- [ ] Check RLS is enabled:
  ```sql
  SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'project_documents';
  ```
- [ ] List RLS policies:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'project_documents';
  ```

### Step 5: Verify Storage Configuration

In Supabase Dashboard:

- [ ] Go to Storage section
- [ ] Verify `project-documents` bucket exists
- [ ] Click on bucket name
- [ ] Check Configuration tab:
  - [ ] Public: OFF (private)
  - [ ] File size limit: 50 MB
  - [ ] Allowed MIME types are configured
- [ ] Check Policies tab:
  - [ ] At least 4 policies exist
  - [ ] INSERT policy for authenticated users
  - [ ] SELECT policy for authenticated users
  - [ ] UPDATE policy for authenticated users
  - [ ] DELETE policy for authenticated users

### Step 6: Code Integration

- [ ] `documentStorageService.ts` exists in `/apps/web/src/services/`
- [ ] `ProjectDocuments.tsx` is updated with Supabase integration
- [ ] No TypeScript compilation errors
- [ ] No import errors

### Step 7: Application Testing

#### Upload Test
- [ ] Start application: `npm run dev`
- [ ] Navigate to project view
- [ ] Locate "Project Documents" section
- [ ] Click "Upload Document" button
- [ ] Select a test file (under 50MB)
- [ ] Verify upload progress indicator appears
- [ ] Verify success toast notification
- [ ] Confirm file appears in document list
- [ ] Check document metadata displays correctly (name, size, date, uploader)

#### Download Test
- [ ] Click download button on uploaded document
- [ ] Verify download starts
- [ ] Verify downloaded file opens correctly
- [ ] Compare file size and content with original

#### Delete Test
- [ ] Click delete button on uploaded document
- [ ] Confirm deletion prompt appears
- [ ] Accept deletion
- [ ] Verify success toast notification
- [ ] Confirm document removed from list

#### Search Test
- [ ] Enter search term in search box
- [ ] Verify filtered results display
- [ ] Clear search
- [ ] Verify all documents show again

#### File Type Test
Upload and verify each file type:
- [ ] PDF document
- [ ] Word document (.docx)
- [ ] Excel spreadsheet (.xlsx)
- [ ] PowerPoint presentation (.pptx)
- [ ] Image (JPEG or PNG)
- [ ] Text file (.txt)
- [ ] Markdown file (.md)

#### Validation Test
- [ ] Try uploading file over 50MB (should fail with error)
- [ ] Try uploading unsupported file type (should fail with error)
- [ ] Verify error messages display correctly

### Step 8: Database Verification

After uploading test files, verify in SQL Editor:

- [ ] Check documents are stored:
  ```sql
  SELECT filename, file_size, uploaded_at, uploaded_by
  FROM project_documents
  ORDER BY uploaded_at DESC;
  ```
- [ ] Verify project association:
  ```sql
  SELECT COUNT(*) as doc_count, project_id
  FROM project_documents
  GROUP BY project_id;
  ```
- [ ] Check file paths are unique:
  ```sql
  SELECT file_path, COUNT(*) as count
  FROM project_documents
  GROUP BY file_path
  HAVING COUNT(*) > 1;
  ```
  (Should return no results)

### Step 9: Storage Verification

In Supabase Dashboard:

- [ ] Go to Storage > project-documents
- [ ] Verify uploaded files appear in bucket
- [ ] Check folder structure (files organized by project_id)
- [ ] Verify file sizes match database records
- [ ] Check storage usage statistics

### Step 10: Security Testing

- [ ] Verify RLS policies are active:
  - [ ] Try accessing documents without authentication (should fail)
  - [ ] Try deleting another user's document (should fail)
  - [ ] Try accessing documents from unauthorized project (should fail)
- [ ] Check storage policies:
  - [ ] Verify direct bucket access requires authentication
  - [ ] Test signed URL expiration (if implemented)

### Step 11: Error Handling

Test error scenarios:

- [ ] Network disconnection during upload
- [ ] Server error simulation
- [ ] Invalid file path
- [ ] Duplicate file upload
- [ ] Delete already-deleted document
- [ ] Download non-existent file

All should display appropriate error messages.

### Step 12: Performance Testing

- [ ] Upload 5-10 files simultaneously
- [ ] Verify all uploads complete
- [ ] Check UI remains responsive
- [ ] Verify no memory leaks in browser console

### Step 13: UI/UX Verification

- [ ] Loading spinners display during operations
- [ ] Upload button disables during upload
- [ ] Progress indicators show for long operations
- [ ] Success/error toasts appear and auto-dismiss
- [ ] Document list updates automatically after operations
- [ ] File icons display correctly for different file types
- [ ] File sizes format correctly (KB, MB)
- [ ] Dates format correctly
- [ ] Search is case-insensitive
- [ ] Empty states display when no documents

### Step 14: Mobile/Responsive Testing

- [ ] Test on mobile device or responsive mode
- [ ] Verify upload button is accessible
- [ ] Check document list is scrollable
- [ ] Verify all buttons are tappable
- [ ] Check toast notifications display correctly

### Step 15: Documentation Review

- [ ] Read `DOCUMENT_UPLOAD_QUICK_START.md`
- [ ] Review `DOCUMENT_UPLOAD_SETUP_GUIDE.md`
- [ ] Check `DOCUMENT_UPLOAD_IMPLEMENTATION_SUMMARY.md`
- [ ] Verify all code examples work
- [ ] Confirm troubleshooting steps are accurate

## Post-Setup Cleanup

- [ ] Remove test documents from database
- [ ] Remove test files from storage bucket
- [ ] Clear browser localStorage cache
- [ ] Restart application

## Production Readiness

Before deploying to production:

- [ ] Update RLS policies for actual auth implementation
- [ ] Replace hardcoded "Current User" with auth context
- [ ] Add project membership validation
- [ ] Configure monitoring and alerts
- [ ] Set up automated backups
- [ ] Review and adjust file size limits
- [ ] Implement virus scanning (recommended)
- [ ] Add audit logging for document access
- [ ] Configure CDN for public documents (if applicable)
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Perform load testing
- [ ] Review security policies with team
- [ ] Update documentation with production URLs
- [ ] Create runbook for common issues

## Success Criteria

All of the following should be true:

- ✅ Storage bucket exists and is accessible
- ✅ Database table has proper schema and indexes
- ✅ RLS policies are active and working
- ✅ Storage policies are configured correctly
- ✅ Files can be uploaded successfully
- ✅ Files can be downloaded successfully
- ✅ Files can be deleted successfully
- ✅ Search functionality works
- ✅ All supported file types upload correctly
- ✅ Validation prevents invalid uploads
- ✅ Error handling displays appropriate messages
- ✅ UI is responsive and user-friendly
- ✅ Documentation is complete and accurate

## Rollback Plan

If issues occur during setup:

1. **Database Rollback:**
   ```sql
   DROP TABLE IF EXISTS project_documents CASCADE;
   DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
   ```

2. **Storage Rollback:**
   - Go to Storage > project-documents
   - Click "Delete bucket"
   - Confirm deletion

3. **Code Rollback:**
   - Revert changes to `ProjectDocuments.tsx`
   - Remove `documentStorageService.ts`
   - Clear any cached data

## Support

If any checklist item fails:

1. Check browser console for errors
2. Review Supabase Dashboard logs
3. Consult `DOCUMENT_UPLOAD_SETUP_GUIDE.md` troubleshooting section
4. Verify all environment variables
5. Ensure migrations were run in correct order
6. Test with different browser
7. Clear browser cache and restart

## Final Notes

- Keep this checklist with project documentation
- Update checklist as new features are added
- Review regularly during development
- Use for onboarding new team members
- Include in deployment procedures

---

**Date Completed:** _________________

**Completed By:** _________________

**Notes/Issues:** _________________
