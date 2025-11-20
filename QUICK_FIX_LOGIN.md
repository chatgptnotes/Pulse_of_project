# Quick Fix for Login Issue

## Problem
Super admin credentials are created but login shows: **"User profile not found. Please contact administrator."**

## Root Cause
The `auth.users` record exists but the `public.users` record is missing or has a different ID.

## Quick Fix Steps

### Step 1: Run the SQL Fix
1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `FIX_USER_LOGIN_ISSUE.sql`
3. Click **Run**

### Step 2: Fix Your Super Admin Account
Run this query in Supabase SQL Editor (replace with your actual email):

```sql
-- Check if both records exist
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
```

**If you see ONLY the auth.users record**, run this:

```sql
-- Create the missing public.users record
INSERT INTO public.users (id, email, full_name, role, is_active)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Super Admin'),
  'super_admin',
  true
FROM auth.users
WHERE email = 'admin@pulseofproject.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  is_active = true;
```

### Step 3: Verify the Fix
```sql
-- Should return 2 rows (one from auth.users, one from public.users)
-- with MATCHING IDs
SELECT 'auth.users' as source, id::text as user_id, email FROM auth.users WHERE email = 'admin@pulseofproject.com'
UNION ALL
SELECT 'public.users' as source, id::text as user_id, email FROM public.users WHERE email = 'admin@pulseofproject.com';
```

### Step 4: Try Login Again
1. Go to your login page
2. Enter: `admin@pulseofproject.com`
3. Enter your password
4. Click Sign In

✅ **You should now be able to login!**

## What Was Fixed

### Code Changes:
1. **Updated RLS Policy** - Now allows trigger-based inserts
2. **Fixed Trigger** - Properly syncs auth.users and public.users with matching IDs
3. **Updated createUser()** - Now saves and restores admin session to prevent logout

### How It Works Now:
1. Admin creates a new user
2. `auth.signUp()` creates user in auth.users
3. Trigger automatically creates matching record in public.users (SAME ID)
4. Admin session is restored
5. New user can login successfully ✅

## Creating New Users
After applying this fix:
1. Go to User Management (`/users`)
2. Click "Add User"
3. Fill in details (only regular users can be created, not super admins)
4. Click "Create User"
5. User will be created and can login immediately!

## Troubleshooting

### Still can't login?
1. Check browser console for errors
2. Verify both auth.users and public.users records exist with same ID
3. Make sure role is 'super_admin' in public.users
4. Clear browser cache and try again

### Session keeps logging out after creating user?
- The fix includes session restoration
- If it still happens, refresh the page manually after creating a user

## Need to Create Another Super Admin?
Super admins can only be created via SQL:

```sql
-- First create the user normally through UI, then run:
UPDATE public.users
SET role = 'super_admin'
WHERE email = 'newadmin@example.com';
```
