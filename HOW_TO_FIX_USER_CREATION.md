# How to Fix User Creation Error

## Problem
When creating a user from the superadmin side, you get this error:
```
insert or update on table "users" violates foreign key constraint "users_id_fkey"
Error code: 23503 - Key is not present in table "users"
```

## Root Cause
The issue occurs because:
1. `auth.signUp()` creates a user in `auth.users` and switches the session to that new user
2. The Row Level Security (RLS) policy on `public.users` checks if the current user (`auth.uid()`) is a super_admin
3. Since the session is now the NEW user (who doesn't exist in `public.users` yet), the RLS policy blocks the insert
4. This causes the foreign key constraint validation to fail

## Solution

### Step 1: Run the SQL Fix
1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Open the file `FIX_USER_CREATION_ERROR.sql`
4. Copy and paste the entire contents into the SQL Editor
5. Click **Run**

This will create:
- ✅ `create_user_as_admin()` function - bypasses RLS using SECURITY DEFINER
- ✅ Updated RLS policies to allow function-based inserts
- ✅ Improved error handling in the trigger

### Step 2: Verify the Fix
The code has already been updated in `userManagementService.js` to use the new database function.

### Step 3: Test User Creation
1. Restart your development server
2. Log in as super admin
3. Go to User Management page (`/users`)
4. Click "Add User"
5. Fill in the user details:
   - Full Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: User
6. Click "Create User"

### Expected Result
✅ User should be created successfully without the foreign key error!

## How It Works Now

**Old Flow (Broken):**
1. Super admin clicks "Create User"
2. `auth.signUp()` creates user → session switches to new user ❌
3. Try to insert into `public.users` → RLS blocks because new user is not super admin ❌
4. Foreign key error ❌

**New Flow (Fixed):**
1. Super admin clicks "Create User"
2. Call `create_user_as_admin()` database function
3. Function validates current user is super admin ✅
4. Function creates user profile in `public.users` (bypasses RLS with SECURITY DEFINER) ✅
5. Creates auth user for login ✅
6. Success! ✅

## Additional Notes

- The new function creates the user profile FIRST in `public.users`
- Then creates the auth user separately
- This avoids the RLS circular dependency issue
- The super admin session remains intact throughout the process

## Troubleshooting

### If you still get errors:

1. **Check super admin status:**
   ```sql
   SELECT id, email, role FROM public.users WHERE role = 'super_admin';
   ```

2. **Verify function exists:**
   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_name = 'create_user_as_admin';
   ```

3. **Test function directly:**
   ```sql
   SELECT create_user_as_admin(
     'test@example.com',
     'password123',
     'Test User',
     'user'
   );
   ```

4. **Check RLS policies:**
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies
   WHERE tablename = 'users';
   ```

## Need Help?
If you encounter any issues, check the browser console for detailed error messages.
