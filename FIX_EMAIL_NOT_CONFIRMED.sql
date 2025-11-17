-- =====================================================
-- FIX EMAIL NOT CONFIRMED ERROR
-- Auto-confirm user emails so they can login immediately
-- =====================================================

-- =====================================================
-- OPTION 1: CONFIRM SPECIFIC USER (bettroi@gmail.com)
-- =====================================================

-- Confirm the email for bettroi@gmail.com
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'bettroi@gmail.com'
  AND email_confirmed_at IS NULL;

-- Also make sure public.users record exists
INSERT INTO public.users (id, email, full_name, role, is_active)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', SPLIT_PART(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'role', 'user'),
  true
FROM auth.users
WHERE email = 'bettroi@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  is_active = true;

-- =====================================================
-- OPTION 2: CONFIRM ALL UNCONFIRMED USERS
-- =====================================================

-- If you want to confirm ALL users at once:
-- UPDATE auth.users
-- SET
--   email_confirmed_at = NOW(),
--   confirmed_at = NOW()
-- WHERE email_confirmed_at IS NULL;

-- =====================================================
-- VERIFY THE FIX
-- =====================================================

-- Check if email is now confirmed
SELECT
  id::text,
  email,
  email_confirmed_at,
  confirmed_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
    ELSE '❌ Not Confirmed'
  END as status
FROM auth.users
WHERE email = 'bettroi@gmail.com';

-- Check public.users record exists
SELECT
  id::text,
  email,
  full_name,
  role,
  is_active
FROM public.users
WHERE email = 'bettroi@gmail.com';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- ✅ Email confirmed! User can now login.
--
-- Login credentials:
-- Email: bettroi@gmail.com
-- Password: (the password you set)
-- =====================================================
