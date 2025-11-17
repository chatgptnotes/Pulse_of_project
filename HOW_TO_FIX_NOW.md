# Fix Upload Error - Do This NOW!

## The Error You're Seeing:
```
❌ Upload error: StorageApiError: new row violates row-level security policy
```

## Quick Fix (2 Minutes):

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project (winhdjtlwhgdoinfrxch)
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Fix Script
1. Click **New Query** button
2. Open the file: `INSTANT_FIX.sql`
3. Copy the ENTIRE contents
4. Paste into SQL Editor
5. Click **RUN** button (or press Ctrl+Enter)

**Wait for it to finish** - you'll see success messages

### Step 3: Test Upload
1. Go back to your app
2. **Refresh the page** (Ctrl+R or Cmd+R)
3. Click **Upload Document**
4. Select a PDF or image
5. ✅ **SUCCESS!** Document should upload

---

## What the Fix Does:

✅ Creates `project_documents` table
✅ Sets up 4 storage policies for neuro_bucket:
   - Upload policy
   - Download policy
   - Update policy
   - Delete policy

---

## After Fix - Expected Behavior:

### Upload ✅
- Click "Upload Document"
- Select file
- See "Successfully uploaded 1 file(s)"
- File appears in list

### Download ✅
- Click download icon (⬇️)
- File downloads immediately

### Delete ✅
- Click trash icon (🗑️)
- Confirm
- File removed

---

## Still Not Working?

### Error: "Bucket neuro_bucket does not exist"
**Fix:** Create the bucket first
1. Supabase Dashboard → **Storage**
2. Click **New bucket**
3. Name: `neuro_bucket`
4. Public: **OFF**
5. Click **Create**
6. Then run `INSTANT_FIX.sql` again

### Error: "relation project_documents already exists"
**This is OK** - It means the table already exists. The policies will still be created.

### Error: "policy already exists"
**This is OK** - It means policies are already there. The DROP statements will handle it.

---

## Verification

After running the SQL, check:

1. **Storage Policies Created?**
   - Supabase → **Storage** → **neuro_bucket** → **Policies**
   - Should see 4 policies listed

2. **Table Created?**
   - Supabase → **Database** → **Tables**
   - Should see `project_documents` table

---

## That's It!

After running `INSTANT_FIX.sql`, your upload should work immediately!

**File to run:** `INSTANT_FIX.sql`
