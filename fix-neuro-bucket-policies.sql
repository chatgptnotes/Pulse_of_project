-- =====================================================
-- FIX NEURO_BUCKET STORAGE POLICIES
-- =====================================================
-- Run this in Supabase Dashboard → SQL Editor
-- This will fix the "row violates row-level security policy" error

-- Step 1: Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all uploads to neuro_bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow all reads from neuro_bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow all updates to neuro_bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow all deletes from neuro_bucket" ON storage.objects;

-- Step 2: Create new storage policies for neuro_bucket
-- These policies allow anyone to upload, download, update, and delete files

-- Policy 1: Allow anyone to upload files to neuro_bucket
CREATE POLICY "Allow all uploads to neuro_bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'neuro_bucket');

-- Policy 2: Allow anyone to download/read files from neuro_bucket
CREATE POLICY "Allow all reads from neuro_bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'neuro_bucket');

-- Policy 3: Allow anyone to update files in neuro_bucket
CREATE POLICY "Allow all updates to neuro_bucket"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'neuro_bucket')
WITH CHECK (bucket_id = 'neuro_bucket');

-- Policy 4: Allow anyone to delete files from neuro_bucket
CREATE POLICY "Allow all deletes from neuro_bucket"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'neuro_bucket');

-- =====================================================
-- OPTIONAL: More restrictive policies (if you want authentication)
-- Comment out the above policies and uncomment these instead
-- =====================================================

-- DROP POLICY IF EXISTS "Allow authenticated uploads to neuro_bucket" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated reads from neuro_bucket" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated updates to neuro_bucket" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated deletes from neuro_bucket" ON storage.objects;

-- CREATE POLICY "Allow authenticated uploads to neuro_bucket"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'neuro_bucket');

-- CREATE POLICY "Allow authenticated reads from neuro_bucket"
-- ON storage.objects
-- FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'neuro_bucket');

-- CREATE POLICY "Allow authenticated updates to neuro_bucket"
-- ON storage.objects
-- FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'neuro_bucket')
-- WITH CHECK (bucket_id = 'neuro_bucket');

-- CREATE POLICY "Allow authenticated deletes from neuro_bucket"
-- ON storage.objects
-- FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'neuro_bucket');

-- =====================================================
-- Verify policies were created
-- =====================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%neuro_bucket%';
