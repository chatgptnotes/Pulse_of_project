# Fix Upload Error - Step by Step Guide

## Error You're Seeing
```
Upload error: StorageApiError: new row violates row-level security policy
```

## Root Cause
The `neuro_bucket` doesn't have proper storage policies configured in Supabase.

## Fix Steps

### Step 1: Create Database Table (If Not Done Yet)

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- File: create-neuro-documents-table.sql
```

Copy and paste the entire contents of `create-neuro-documents-table.sql` and click **RUN**.

This creates:
- ✅ `project_documents` table
- ✅ Indexes for performance
- ✅ Database policies (RLS)
- ✅ Auto-update triggers

---

### Step 2: Fix Storage Bucket Policies ⚠️ MOST IMPORTANT

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- File: fix-neuro-bucket-policies.sql
```

Copy and paste the entire contents of `fix-neuro-bucket-policies.sql` and click **RUN**.

This will:
- ✅ Create upload policy for neuro_bucket
- ✅ Create download policy for neuro_bucket
- ✅ Create update policy for neuro_bucket
- ✅ Create delete policy for neuro_bucket

---

### Step 3: Verify Bucket Exists

1. Go to **Supabase Dashboard → Storage**
2. Make sure you see **neuro_bucket** in the list
3. If it doesn't exist, create it:
   - Click **New bucket**
   - Name: `neuro_bucket`
   - Public bucket: **OFF** (private)
   - Click **Create bucket**

---

### Step 4: Verify Policies Were Created

Go to **Supabase Dashboard → Storage → neuro_bucket → Policies**

You should see 4 policies:
1. ✅ Allow all uploads to neuro_bucket
2. ✅ Allow all reads from neuro_bucket
3. ✅ Allow all updates to neuro_bucket
4. ✅ Allow all deletes from neuro_bucket

---

### Step 5: Test Upload

1. Go back to your application
2. Refresh the page (Ctrl+R or Cmd+R)
3. Click **Upload Document**
4. Select a PDF or image
5. Upload should succeed! ✅

---

## Verification Checklist

After running the SQL scripts, verify:

- [ ] `project_documents` table exists
  - Go to: **Supabase → Database → Tables**

- [ ] `neuro_bucket` exists
  - Go to: **Supabase → Storage**

- [ ] Storage policies exist (4 policies)
  - Go to: **Supabase → Storage → neuro_bucket → Policies**

- [ ] Database table policies exist (4 policies)
  - Go to: **Supabase → Database → Tables → project_documents → Policies**

---

## Expected Behavior After Fix

### Upload
1. Click "Upload Document"
2. Select file
3. See "Uploading..." message
4. See "Successfully uploaded 1 file(s)" ✅
5. Document appears in list

### Download
1. Click download icon (⬇️) on any document
2. File downloads to your computer ✅

### Delete
1. Click trash icon (🗑️) on any document
2. Confirm deletion
3. Document removed from list and storage ✅

---

## Still Getting Errors?

### Error: "Table project_documents does not exist"
**Solution**: Run `create-neuro-documents-table.sql` first

### Error: "Bucket neuro_bucket does not exist"
**Solution**: Create the bucket manually in Supabase Dashboard → Storage

### Error: "new row violates row-level security policy"
**Solution**: Run `fix-neuro-bucket-policies.sql` again

### Error: "Failed to upload files"
**Solution**:
1. Check browser console for detailed error
2. Verify bucket name is exactly `neuro_bucket` (no typos)
3. Check Supabase URL and API key in .env file

---

## Security Notes

The current policies allow **anyone** to upload/download/delete files. This is fine for development.

For production, you may want to restrict access to authenticated users. See the commented section in `fix-neuro-bucket-policies.sql`.

---

## Quick Test Script

After setup, test with this checklist:

1. ✅ Upload a PDF → Should succeed
2. ✅ See file in list → Should show filename, size, date
3. ✅ Download the file → Should download successfully
4. ✅ Delete the file → Should remove from list
5. ✅ Upload an image → Should succeed
6. ✅ Upload multiple files → Should succeed

---

## Support

If you still face issues:
1. Check Supabase logs: **Dashboard → Logs**
2. Check browser console: F12 → Console tab
3. Verify .env file has correct Supabase credentials
