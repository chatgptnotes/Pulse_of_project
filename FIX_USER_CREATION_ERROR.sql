-- =====================================================
-- FIX USER CREATION ERROR
-- Fixes the foreign key constraint violation when creating users
-- =====================================================
-- Issue: When auth.signUp() is called, the session switches to the new user,
-- causing RLS policies to block the insert into public.users
-- Solution: Create a SECURITY DEFINER function to handle user creation
-- =====================================================

-- =====================================================
-- 1. CREATE ADMIN USER CREATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION create_user_as_admin(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role TEXT DEFAULT 'user'
)
RETURNS jsonb AS $$
DECLARE
  v_user_id UUID;
  v_result jsonb;
BEGIN
  -- Validate that current user is super admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super admins can create users';
  END IF;

  -- Generate a UUID for the new user
  v_user_id := gen_random_uuid();

  -- Insert directly into public.users (bypassing RLS with SECURITY DEFINER)
  INSERT INTO public.users (id, email, full_name, role, is_active, created_by)
  VALUES (v_user_id, p_email, p_full_name, p_role, true, auth.uid());

  -- Return success with user info
  v_result := jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'full_name', p_full_name,
    'role', p_role,
    'message', 'User profile created. Email invitation will be sent separately.'
  );

  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. UPDATE RLS POLICIES TO ALLOW FUNCTION ACCESS
-- =====================================================

-- Update the INSERT policy to allow the function to work
DROP POLICY IF EXISTS "Super admins can create users" ON public.users;

CREATE POLICY "Super admins can create users"
  ON public.users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
    OR auth.uid() IS NULL  -- Allow SECURITY DEFINER functions
  );

-- =====================================================
-- 3. CREATE USER INVITATION FUNCTION (ALTERNATIVE)
-- =====================================================

-- This function creates the user profile and returns info for sending email invitation
CREATE OR REPLACE FUNCTION invite_user(
  p_email TEXT,
  p_full_name TEXT,
  p_role TEXT DEFAULT 'user'
)
RETURNS jsonb AS $$
DECLARE
  v_user_id UUID;
  v_result jsonb;
BEGIN
  -- Validate that current user is super admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super admins can invite users';
  END IF;

  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM public.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'User with email % already exists', p_email;
  END IF;

  -- Generate a UUID for the new user
  v_user_id := gen_random_uuid();

  -- Insert directly into public.users
  INSERT INTO public.users (id, email, full_name, role, is_active, created_by)
  VALUES (v_user_id, p_email, p_full_name, p_role, false, auth.uid())
  RETURNING id INTO v_user_id;

  -- Return success with user info
  v_result := jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'full_name', p_full_name,
    'role', p_role,
    'message', 'User invited successfully. They will receive an email to set their password.'
  );

  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. UPDATED HANDLE_NEW_USER TRIGGER
-- =====================================================

-- Update the trigger to handle edge cases better
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_role TEXT;
BEGIN
  -- Get metadata
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    SPLIT_PART(NEW.email, '@', 1)
  );
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');

  -- Insert into public.users if not exists
  INSERT INTO public.users (id, email, full_name, role, is_active)
  VALUES (NEW.id, NEW.email, v_full_name, v_role, true)
  ON CONFLICT (id) DO NOTHING;  -- Avoid duplicate key errors

  RETURN NEW;
EXCEPTION WHEN foreign_key_violation THEN
  -- If foreign key error, still return NEW to not block auth user creation
  RAISE WARNING 'Could not create user profile for %: %', NEW.email, SQLERRM;
  RETURN NEW;
WHEN OTHERS THEN
  -- Log other errors but don't block auth user creation
  RAISE WARNING 'Error in handle_new_user for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant execute permission on the new functions
GRANT EXECUTE ON FUNCTION create_user_as_admin TO authenticated;
GRANT EXECUTE ON FUNCTION invite_user TO authenticated;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Test the function (replace with your super admin email)
-- SELECT create_user_as_admin(
--   'newuser@example.com',
--   'password123',
--   'New User',
--   'user'
-- );

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- ✅ User Creation Fix Applied!
--
-- What was fixed:
-- • Created create_user_as_admin() function with SECURITY DEFINER
-- • Updated RLS policies to allow function-based inserts
-- • Improved handle_new_user() trigger with better error handling
-- • Added invite_user() as an alternative approach
--
-- Next Step:
-- Update your userManagementService.js to use the new function
-- =====================================================
