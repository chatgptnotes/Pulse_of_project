-- =====================================================
-- BOOTSTRAP SUPER ADMIN USER
-- =====================================================
-- Run this to add your current logged-in user to public.users table
-- This will make them visible in User Management page

-- Step 1: Check if users table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'users';

-- Step 2: Check current auth users
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Step 3: Bootstrap the first user as super admin
-- IMPORTANT: Replace 'your-email@example.com' with your actual email

DO $$
DECLARE
  user_id UUID;
  user_email TEXT;
BEGIN
  -- Get the first user from auth.users (or specify your email)
  SELECT id, email INTO user_id, user_email
  FROM auth.users
  WHERE email = 'admin@pulseofproject.com'  -- 👈 CHANGE THIS to your email
  LIMIT 1;

  -- If user found, insert into public.users
  IF user_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, full_name, role, is_active, created_at)
    VALUES (
      user_id,
      user_email,
      'Super Admin',  -- You can change this name
      'super_admin',  -- This gives full access
      true,
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET
      role = 'super_admin',
      is_active = true;

    RAISE NOTICE 'User bootstrapped: % (ID: %)', user_email, user_id;
  ELSE
    RAISE NOTICE 'No user found with that email. Check auth.users table.';
  END IF;
END $$;

-- Step 4: Verify the user was added
SELECT id, email, full_name, role, is_active, created_at
FROM public.users
ORDER BY created_at DESC;

-- =====================================================
-- QUICK FIX: If you don't know your email
-- =====================================================
-- Run this to bootstrap ALL auth users into public.users:

INSERT INTO public.users (id, email, full_name, role, is_active, created_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', SPLIT_PART(email, '@', 1)) as full_name,
  'super_admin' as role,  -- First user gets super_admin
  true as is_active,
  created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET
  role = CASE
    WHEN public.users.role = 'super_admin' THEN 'super_admin'
    ELSE 'user'
  END,
  is_active = true;

-- Final verification
SELECT
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.is_active,
  COUNT(up.id) as assigned_projects
FROM public.users u
LEFT JOIN public.user_projects up ON u.id = up.user_id
GROUP BY u.id, u.email, u.full_name, u.role, u.is_active
ORDER BY u.created_at DESC;
