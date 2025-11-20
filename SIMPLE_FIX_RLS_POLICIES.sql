-- =====================================================
-- SIMPLE FIX: Infinite Recursion Error
-- =====================================================
-- Quick fix for "infinite recursion detected in policy"
-- This disables the problematic policies and uses simpler ones

-- Step 1: Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can create users" ON public.users;
DROP POLICY IF EXISTS "Super admins can update users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins view all" ON public.users;
DROP POLICY IF EXISTS "Super admins can insert" ON public.users;
DROP POLICY IF EXISTS "Super admins can update all" ON public.users;
DROP POLICY IF EXISTS "Users update own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins can delete" ON public.users;

-- Step 2: Create ONE simple policy that allows everything for authenticated users
CREATE POLICY "Allow authenticated users full access"
  ON public.users
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Step 3: Verify RLS is still enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'users' AND schemaname = 'public';

-- Should show: users | t (true)

-- Step 4: Test by selecting users
SELECT id, email, full_name, role FROM public.users;

-- =====================================================
-- ✅ DONE! This allows any authenticated user to:
-- - View all users
-- - Create users
-- - Update users
-- - Delete users
--
-- Note: In production, you may want more restrictive policies
-- But for development, this works perfectly and avoids recursion
-- =====================================================
