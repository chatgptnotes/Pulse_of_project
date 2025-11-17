-- =====================================================
-- CREATE SUPER ADMIN CREDENTIALS - IMMEDIATE FIX
-- =====================================================
-- This will fix your admin@pulseofproject.com account
-- Run this in Supabase SQL Editor
-- =====================================================

-- STEP 1: Check current situation
-- This will show if auth user exists but public.users is missing
SELECT
  'auth.users' as source,
  id::text as user_id,
  email,
  'User exists in auth' as status
FROM auth.users
WHERE email = 'admin@pulseofproject.com'
UNION ALL
SELECT
  'public.users' as source,
  id::text as user_id,
  email,
  'Profile exists' as status
FROM public.users
WHERE email = 'admin@pulseofproject.com';

-- =====================================================
-- STEP 2: CREATE THE MISSING public.users RECORD
-- =====================================================

-- This will create the public.users record for your admin
-- with the SAME ID as the auth.users record
INSERT INTO public.users (id, email, full_name, role, is_active, created_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Super Admin') as full_name,
  'super_admin' as role,
  true as is_active,
  au.created_at
FROM auth.users au
WHERE au.email = 'admin@pulseofproject.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
  )
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  is_active = true,
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);

-- =====================================================
-- STEP 3: VERIFY IT WORKED
-- =====================================================

-- This should now show BOTH records with MATCHING IDs
SELECT
  'auth.users' as source,
  id::text as user_id,
  email,
  created_at::text as created
FROM auth.users
WHERE email = 'admin@pulseofproject.com'
UNION ALL
SELECT
  'public.users' as source,
  id::text as user_id,
  email,
  created_at::text as created
FROM public.users
WHERE email = 'admin@pulseofproject.com';

-- =====================================================
-- STEP 4: CHECK ROLE IS SUPER_ADMIN
-- =====================================================

SELECT
  id::text as user_id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM public.users
WHERE email = 'admin@pulseofproject.com';

-- =====================================================
-- SUCCESS!
-- =====================================================
-- ✅ If you see your user with role = 'super_admin' above,
--    you can now login!
--
-- Go to: localhost:3000/login
-- Email: admin@pulseofproject.com
-- Password: (your password)
-- =====================================================
