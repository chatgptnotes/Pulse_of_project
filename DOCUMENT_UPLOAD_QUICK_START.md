# Document Upload - Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Supabase project is active
- Environment variables are configured in `.env`
- Node.js and npm are installed

### Step 1: Run Automated Setup (30 seconds)

```bash
node setup-storage-bucket.js
```

This creates the storage bucket automatically.

### Step 2: Create Database Table (1 minute)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Click **New query**
4. Copy and paste this file's contents: `supabase/migrations/20250107_create_project_documents.sql`
5. Click **Run**
6. Wait for "Success" message

### Step 3: Configure Storage Policies (1 minute)

1. Still in **SQL Editor**
2. Click **New query**
3. Copy and paste this file's contents: `supabase/migrations/20250107_create_storage_bucket.sql`
4. Click **Run**
5. Wait for "Success" message

### Step 4: Verify Setup (1 minute)

1. Go to **Storage** in Supabase Dashboard
2. Verify `project-documents` bucket exists
3. Click on bucket name
4. Click **Policies** tab
5. You should see 4-5 policies listed

### Step 5: Test Upload (2 minutes)

1. Start your app: `npm run dev`
2. Navigate to any project page
3. Scroll to "Project Documents" section
4. Click **Upload Document** button
5. Select a test file (PDF, image, or Word doc)
6. Wait for upload confirmation
7. Verify file appears in the list
8. Try downloading the file

Done! Document upload is now working.

## Troubleshooting

### If bucket creation fails:
Run manually via Dashboard: Storage > New bucket > Name: `project-documents` > Create

### If migrations fail:
- Check SQL Editor for error messages
- Verify you're using the correct Supabase project
- Ensure you have admin access

### If upload fails:
1. Check browser console for errors
2. Verify bucket exists in Storage
3. Check that policies are created
4. Ensure file is under 50MB

## Files Created

- `supabase/migrations/20250107_create_project_documents.sql` - Database table
- `supabase/migrations/20250107_create_storage_bucket.sql` - Storage policies
- `apps/web/src/services/documentStorageService.ts` - API service
- `setup-storage-bucket.js` - Automated setup script

## Next Steps

For detailed documentation, see: `DOCUMENT_UPLOAD_SETUP_GUIDE.md`

## Quick Commands

```bash
# View all buckets
supabase storage list

# View documents in database
psql $DATABASE_URL -c "SELECT filename, uploaded_at FROM project_documents;"

# Check storage usage
supabase storage usage
```

## Support

If you encounter issues:
1. Check `DOCUMENT_UPLOAD_SETUP_GUIDE.md` troubleshooting section
2. Review browser console for errors
3. Check Supabase Dashboard logs
4. Verify all environment variables are set
