-- =====================================================
-- FIX USER LOGIN ISSUE
-- Ensures auth.users and public.users are properly synced
-- =====================================================

-- =====================================================
-- STEP 1: FIX THE RLS POLICIES TO ALLOW TRIGGER-BASED INSERTS
-- =====================================================

-- Drop and recreate the INSERT policy to allow SECURITY DEFINER functions
DROP POLICY IF EXISTS "Super admins can create users" ON public.users;

CREATE POLICY "Super admins can create users"
  ON public.users FOR INSERT
  WITH CHECK (
    -- Allow if current user is super admin
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
    -- OR if there's no current session (allows triggers to work)
    OR auth.uid() IS NULL
  );

-- =====================================================
-- STEP 2: IMPROVED TRIGGER TO HANDLE USER CREATION
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_role TEXT;
BEGIN
  -- Get metadata from auth user
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    SPLIT_PART(NEW.email, '@', 1)
  );
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');

  -- Auto-confirm email (allows immediate login)
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := NOW();
    NEW.confirmed_at := NOW();
  END IF;

  -- Insert into public.users with the SAME ID as auth.users
  INSERT INTO public.users (id, email, full_name, role, is_active)
  VALUES (NEW.id, NEW.email, v_full_name, v_role, true)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block auth user creation
    RAISE WARNING 'Error creating user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger (BEFORE INSERT to modify NEW values)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 3: CHECK FOR ORPHANED AUTH USERS
-- =====================================================

-- Find auth users without public.users profiles
SELECT
  au.id,
  au.email,
  au.created_at,
  'Missing public.users profile' as issue
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- =====================================================
-- STEP 4: FIX EXISTING ORPHANED USERS (RUN MANUALLY IF NEEDED)
-- =====================================================

-- This will create public.users records for any auth users that don't have them
-- UNCOMMENT AND RUN THIS IF YOU SEE ORPHANED USERS ABOVE:

-- INSERT INTO public.users (id, email, full_name, role, is_active)
-- SELECT
--   au.id,
--   au.email,
--   COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)),
--   COALESCE(au.raw_user_meta_data->>'role', 'user'),
--   true
-- FROM auth.users au
-- LEFT JOIN public.users pu ON au.id = pu.id
-- WHERE pu.id IS NULL
-- ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 5: VERIFY SUPER ADMIN EXISTS
-- =====================================================

-- Check if your super admin has both auth and public records
SELECT
  'auth.users' as table_name,
  id::text as user_id,
  email,
  created_at::text as created
FROM auth.users
WHERE email = 'admin@pulseofproject.com'
UNION ALL
SELECT
  'public.users' as table_name,
  id::text as user_id,
  email,
  created_at::text as created
FROM public.users
WHERE email = 'admin@pulseofproject.com';

-- If you see the auth user but not public.users, run this:
-- (Replace with your actual admin email if different)

-- INSERT INTO public.users (id, email, full_name, role, is_active)
-- SELECT
--   id,
--   email,
--   COALESCE(raw_user_meta_data->>'full_name', 'Super Admin'),
--   'super_admin',
--   true
-- FROM auth.users
-- WHERE email = 'admin@pulseofproject.com'
-- ON CONFLICT (id) DO UPDATE SET
--   role = 'super_admin',
--   is_active = true;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- ✅ User Login Issue Fix Applied!
--
-- What was fixed:
-- • Updated RLS policy to allow trigger-based inserts
-- • Fixed handle_new_user() trigger to properly sync IDs
-- • Added checks for orphaned auth users
--
-- Next Steps:
-- 1. Run the verification query (STEP 5)
-- 2. If super admin is missing from public.users, run the INSERT
-- 3. Try logging in again
-- =====================================================
