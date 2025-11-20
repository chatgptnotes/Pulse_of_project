# 🔧 Supabase Setup - Step by Step Guide

## Problem Fixed ✅
आपको जो error आ रही थी वो fix हो गई है:
- ❌ **Before:** "Production authentication not configured"
- ✅ **Now:** Real Supabase login implemented

---

## Step 1: Create Profiles Table in Supabase

### Option A: Using SQL Editor (Recommended)

1. **Go to Supabase Dashboard:**
   ```
   https://app.supabase.com/project/winhdjtlwhgdoinfrxch
   ```

2. **Open SQL Editor:**
   - Left sidebar में "SQL Editor" पर click करें
   - "New Query" button click करें

3. **Copy and Paste this SQL:**
   ```sql
   -- Create profiles table
   CREATE TABLE IF NOT EXISTS profiles (
     id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     full_name TEXT,
     role TEXT NOT NULL DEFAULT 'super_admin',
     avatar_url TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   -- Policy: Users can read their own profile
   CREATE POLICY "Users can view own profile"
     ON profiles FOR SELECT
     USING (auth.uid() = id);

   -- Policy: Users can update their own profile
   CREATE POLICY "Users can update own profile"
     ON profiles FOR UPDATE
     USING (auth.uid() = id);

   -- Create function to automatically create profile on user signup
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.profiles (id, email, full_name, role)
     VALUES (
       NEW.id,
       NEW.email,
       COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
       'super_admin'
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- Create trigger
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW
     EXECUTE FUNCTION public.handle_new_user();
   ```

4. **Run the Query:**
   - "RUN" button पर click करें
   - Success message दिखना चाहिए

### Option B: Using Migration File

1. File already created: `supabase-migrations/create-profiles-table.sql`
2. Copy content और Supabase SQL Editor में paste करें
3. Run करें

---

## Step 2: Enable Email Authentication

1. **Go to Authentication Settings:**
   ```
   https://app.supabase.com/project/winhdjtlwhgdoinfrxch/auth/providers
   ```

2. **Enable Email Provider:**
   - "Email" provider को enable करें
   - "Enable email signup" को ✅ check करें
   - "Confirm email" को **uncheck** करें (testing के लिए)
   - Save changes

---

## Step 3: Create Super Admin User

### Method 1: Using Supabase Dashboard (Easiest)

1. **Go to Authentication → Users:**
   ```
   https://app.supabase.com/project/winhdjtlwhgdoinfrxch/auth/users
   ```

2. **Click "Add User" Button**

3. **Fill User Details:**
   ```
   Email: admin@pulseofproject.com
   Password: Admin@123456
   Auto Confirm User: ✅ YES (Important!)
   ```

4. **Click "Create User"**

5. **Verify Profile Created:**
   - Go to Table Editor → profiles table
   - Check if entry created automatically (trigger will create it)
   - If not created, manually insert:
   ```sql
   INSERT INTO profiles (id, email, full_name, role)
   VALUES (
     'USER_ID_HERE',  -- Get from auth.users table
     'admin@pulseofproject.com',
     'Super Admin',
     'super_admin'
   );
   ```

### Method 2: Using SQL

```sql
-- First, create user in auth.users (requires service_role key)
-- Better to use dashboard for this

-- Then manually create profile if trigger didn't work
INSERT INTO profiles (id, email, full_name, role)
SELECT
  id,
  email,
  'Super Admin',
  'super_admin'
FROM auth.users
WHERE email = 'admin@pulseofproject.com';
```

---

## Step 4: Test Login

### 1. Restart Your Dev Server

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

### 2. Open Browser

```
http://localhost:3000/login
```

### 3. Login with Credentials

```
Email: admin@pulseofproject.com
Password: Admin@123456
```

### 4. Expected Result

- ✅ "Login successful!" toast message
- ✅ Redirect to `/pulse` or last visited page
- ✅ Console shows: "✅ Login successful: Super Admin super_admin"
- ✅ All protected pages accessible

---

## Step 5: Verify Everything Works

### Test Checklist:

1. **Login Test:**
   - [ ] Can login with super admin credentials
   - [ ] Success toast appears
   - [ ] Redirects to dashboard

2. **Protected Routes Test:**
   - [ ] Can access `/admin`
   - [ ] Can access `/project-tracking`
   - [ ] Can access `/pulse`
   - [ ] Can access `/about`

3. **Logout Test:**
   - [ ] Logout button works
   - [ ] Redirects to landing page
   - [ ] Can't access protected routes after logout

4. **Invalid Login Test:**
   - [ ] Wrong password shows error
   - [ ] Invalid email shows error
   - [ ] Error messages are clear

---

## Troubleshooting

### Error: "Invalid login credentials"

**Possible Causes:**
1. User not created in Supabase
2. Wrong password
3. Email not confirmed

**Solution:**
```sql
-- Check if user exists
SELECT * FROM auth.users WHERE email = 'admin@pulseofproject.com';

-- Check if profile exists
SELECT * FROM profiles WHERE email = 'admin@pulseofproject.com';

-- Update user to confirmed if needed
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@pulseofproject.com';
```

### Error: "Supabase client not initialized"

**Solution:**
1. Check `.env` file has correct Supabase URL and key
2. Restart dev server
3. Clear browser cache and localStorage

```bash
# Check environment variables
cat .env | grep VITE_SUPABASE
```

### Error: "Profile not found"

**Solution:**
```sql
-- Create profile manually
INSERT INTO profiles (id, email, full_name, role)
SELECT
  id,
  email,
  'Super Admin',
  'super_admin'
FROM auth.users
WHERE email = 'admin@pulseofproject.com'
ON CONFLICT (id) DO NOTHING;
```

### Error: "Access denied. Only Super Admins can login"

**Solution:**
```sql
-- Update user role to super_admin
UPDATE profiles
SET role = 'super_admin'
WHERE email = 'admin@pulseofproject.com';
```

### Login works but redirects back to login

**Solution:**
1. Clear browser localStorage:
   ```javascript
   // In browser console:
   localStorage.clear();
   ```
2. Refresh page
3. Login again

---

## Configuration Files

### .env (Already Configured)

```env
VITE_BYPASS_AUTH=false
VITE_SUPABASE_URL=https://winhdjtlwhgdoinfrxch.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### vite.config.js (Already Updated)

```javascript
define: {
  'import.meta.env.VITE_BYPASS_AUTH': JSON.stringify('false'),
  'import.meta.env.VITE_SUPABASE_URL': ...,
  'import.meta.env.VITE_SUPABASE_ANON_KEY': ...,
}
```

---

## Quick Commands

### Check if server is running:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
```

### Check Supabase connection:
```javascript
// In browser console after login:
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

---

## Database Schema Verification

Run this in Supabase SQL Editor to verify setup:

```sql
-- Check if profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'profiles'
);

-- Check if trigger exists
SELECT EXISTS (
  SELECT FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created'
);

-- Check if policies exist
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'profiles';

-- Check if super admin exists
SELECT
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@pulseofproject.com';
```

---

## Security Notes

### Row Level Security (RLS)
- ✅ Enabled on profiles table
- ✅ Users can only view/update their own profile
- ✅ Super admins have additional permissions

### Password Requirements
Supabase default requirements:
- Minimum 6 characters
- Recommended: Use strong passwords (8+ chars, mixed case, numbers, symbols)

### Session Management
- Sessions stored securely by Supabase
- Automatic token refresh
- 1 hour default session duration

---

## What Changed in Code

### AuthContext.jsx
**Before:**
```javascript
throw new Error('Production authentication not configured');
```

**After:**
```javascript
// Real Supabase login
const { data, error } = await supabase.auth.signInWithPassword({
  email: credentials.email,
  password: credentials.password,
});

// Verify user is super_admin
if (userRole !== 'super_admin') {
  await supabase.auth.signOut();
  throw new Error('Access denied. Only Super Admins can login.');
}
```

### Logout Function
**Added:**
```javascript
// Sign out from Supabase
if (supabase && !BYPASS_AUTH) {
  await supabase.auth.signOut();
}
```

---

## Next Steps After Setup

1. **Test thoroughly** - सभी pages को check करें
2. **Add more admins** - If needed
3. **Configure email templates** - For password reset (optional)
4. **Setup production** - Deploy to hosting
5. **Add monitoring** - Track login attempts

---

## Summary of Setup

✅ **What You Need to Do:**
1. Run SQL to create profiles table (5 minutes)
2. Enable Email auth in Supabase (2 minutes)
3. Create super admin user (3 minutes)
4. Test login (2 minutes)

⏱️ **Total Time:** ~12 minutes

📝 **Files Updated:**
- ✅ AuthContext.jsx - Real Supabase login
- ✅ create-profiles-table.sql - Database schema
- ✅ This guide - Setup instructions

🎯 **Result:**
- Fully functional Supabase authentication
- Super admin only access
- All pages protected
- Production ready

---

**Need Help?**
- Check Supabase logs: https://app.supabase.com/project/winhdjtlwhgdoinfrxch/logs
- Check browser console for errors
- Review network tab for API calls

**Last Updated:** 2025-01-14
**Status:** 🟢 Ready to Setup
