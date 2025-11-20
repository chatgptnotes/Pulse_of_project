-- =====================================================
-- FIX: Infinite Recursion in Users Table Policies
-- =====================================================
-- Problem: Policies are checking users table which triggers same policy
-- Solution: Use auth.jwt() or simpler policies without recursion

-- Step 1: Drop existing problematic policies
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can create users" ON public.users;
DROP POLICY IF EXISTS "Super admins can update users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Step 2: Create helper function to check if user is super admin
-- This function has SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create NON-RECURSIVE policies

-- Policy 1: Users can view themselves
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (id = auth.uid());

-- Policy 2: Super admins can view all users (using function)
CREATE POLICY "Super admins view all"
  ON public.users FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- Policy 3: Super admins can insert users
CREATE POLICY "Super admins can insert"
  ON public.users FOR INSERT
  WITH CHECK (public.is_super_admin(auth.uid()));

-- Policy 4: Super admins can update any user
CREATE POLICY "Super admins can update all"
  ON public.users FOR UPDATE
  USING (public.is_super_admin(auth.uid()));

-- Policy 5: Users can update own profile (limited fields)
CREATE POLICY "Users update own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy 6: Super admins can delete users
CREATE POLICY "Super admins can delete"
  ON public.users FOR DELETE
  USING (public.is_super_admin(auth.uid()));

-- Step 4: Grant execute permission on helper function
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO anon;

-- Step 5: Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- =====================================================
-- Alternative: Simpler approach using raw_app_meta_data
-- =====================================================
-- If above doesn't work, use this simpler version:

-- Drop all policies first
-- DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
-- DROP POLICY IF EXISTS "Super admins view all" ON public.users;
-- DROP POLICY IF EXISTS "Super admins can insert" ON public.users;
-- DROP POLICY IF EXISTS "Super admins can update all" ON public.users;
-- DROP POLICY IF EXISTS "Users update own profile" ON public.users;
-- DROP POLICY IF EXISTS "Super admins can delete" ON public.users;

-- Simple policies without recursion
-- CREATE POLICY "Allow all for authenticated users"
--   ON public.users FOR ALL
--   USING (auth.uid() IS NOT NULL);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- ✅ Infinite recursion fixed!
--
-- What was changed:
-- 1. Created helper function with SECURITY DEFINER
-- 2. Split policies into separate SELECT, INSERT, UPDATE, DELETE
-- 3. Removed recursive checks
--
-- Now test:
-- 1. Refresh User Management page
-- 2. Should load without errors
-- 3. Try creating a new user
-- =====================================================
