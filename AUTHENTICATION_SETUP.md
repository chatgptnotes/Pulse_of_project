# 🔐 Authentication Setup Guide - PulseOfProject

## Overview
यह project अब **Super Admin only authentication** के साथ configured है। सभी pages protected हैं और सिर्फ Super Admin login के बाद access कर सकता है।

---

## ✅ What Has Been Done

### 1. **Authentication Mode**
- ✅ BYPASS_AUTH mode **disabled** कर दिया गया
- ✅ Production Supabase Authentication **enabled** है
- ✅ सभी clinic और patient roles **remove** कर दिए गए
- ✅ सिर्फ **super_admin** role supported है

### 2. **Code Cleanup**
निम्नलिखित unused files **delete** कर दी गई हैं:

**Test Files:**
- test-multiauth-system.js
- test-registration.js
- test-production-payment.js
- test-subscription-popup.js
- test-popup-browser.js
- test-razorpay-integration.js
- test-complete-auth-flow.js

**Clinic/Patient Related:**
- remove-all-clinics.js
- check-dynamodb-clinics.js
- debug_clinics.js
- create-working-users.js
- cleanup-demo-data.js
- fix-priya-clinic-id.js
- check-clinic-data.js
- fix-clinic-data.js
- add-test-clinics.js
- initialize-database.js

**AWS Services:**
- apps/web/src/services/awsS3Service.js
- apps/web/src/services/fileStorageService.js

### 3. **Routes Protection**

**Public Routes (No Login Required):**
- `/` - Landing Page
- `/login` - Login Page
- `/auth` - Auth Page (alias)

**Protected Routes (Super Admin Only):**
- `/about` - About Page
- `/pulseofproject` - Main Product Dashboard
- `/pulse` - Dashboard (alias)
- `/project-tracking` - Project Tracking
- `/admin` - Admin Panel
- `/client/:shareToken` - Client View
- `/sharelinks` - Share Links
- `/share-links` - Share Links (alias)
- `/project-links` - Project Links (alias)

### 4. **Removed Routes**
निम्नलिखित routes **remove** कर दिए गए:
- `/register` - Registration (not needed for super admin only)
- `/forgot-password` - Password reset
- `/reset-password` - Password reset confirmation
- `/activation-pending` - Account activation
- `/pulse-demo` - Public demo
- `/project-tracking-public` - Public demo

---

## 🚀 How to Run the Project

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Environment Configuration**
`.env` file already configured है:

```env
# Authentication Mode - Super Admin Only
VITE_BYPASS_AUTH=false

# Supabase Configuration
VITE_SUPABASE_URL=https://winhdjtlwhgdoinfrxch.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. **Start Development Server**
```bash
npm run dev
```

Server `http://localhost:3000` पर चलेगा।

### 4. **Build for Production**
```bash
npm run build
```

---

## 👤 Creating Super Admin User in Supabase

⚠️ **IMPORTANT:** पहले `SUPABASE_SETUP_STEPS.md` file देखें - वहां complete step-by-step guide है!

### Quick Setup (3 Steps):

1. **Create Profiles Table:**
   - File: `supabase-migrations/create-profiles-table.sql`
   - Run in Supabase SQL Editor

2. **Enable Email Auth:**
   - Go to Authentication → Providers
   - Enable Email provider

3. **Create Super Admin User:**
   - Go to Authentication → Users
   - Add User: `admin@pulseofproject.com`
   - Password: `Admin@123456` (or your choice)
   - Auto Confirm: ✅ YES

**For detailed instructions, see:** `SUPABASE_SETUP_STEPS.md`

---

## 🔑 Login Process

### Development Mode (Currently Active):
चूंकि BYPASS_AUTH अब false है, आपको real Supabase user के साथ login करना होगा।

### Login Steps:
1. Go to `http://localhost:3000/login`
2. Enter Super Admin credentials:
   - Email: `admin@pulseofproject.com`
   - Password: Your password from Supabase
3. Click Login
4. आप automatically dashboard पर redirect हो जाएंगे

### Logout:
- Any page पर logout button click करें
- localStorage clear हो जाएगा
- आप landing page पर redirect हो जाएंगे

---

## 🛠️ Technical Details

### AuthContext Changes:
- ✅ सिर्फ `super_admin` role supported
- ✅ clinicId references removed
- ✅ clinic_admin और patient logic removed
- ✅ Supabase auth integration active

### ProtectedRoute Changes:
- ✅ Simplified to check only `super_admin` role
- ✅ requiredRole parameter removed
- ✅ Access denied message updated

### File Structure:
```
apps/web/src/
├── contexts/
│   └── AuthContext.jsx          ✅ Updated (super_admin only)
├── components/
│   ├── ProtectedRoute.jsx       ✅ Simplified
│   └── auth/
│       ├── LoginForm.jsx        ✅ Kept (for login)
│       ├── RegisterForm.jsx     ❌ Not used (but kept in code)
│       └── ...
├── pages/
│   ├── WelcomePage.jsx          ✅ Public
│   ├── SimpleAuth.jsx           ✅ Public (login)
│   ├── AdminPage.jsx            🔒 Protected
│   ├── ProjectTracking.jsx      🔒 Protected
│   ├── PulseOfProject.jsx       🔒 Protected
│   └── ...
└── App.jsx                      ✅ Routes updated
```

---

## 📊 Database Schema Required

Ensure your Supabase database has these tables:

### 1. `profiles` table:
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'super_admin',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### 2. Enable Email Authentication in Supabase:
1. Go to Authentication → Providers
2. Enable **Email** provider
3. Configure email templates (optional)

---

## 🔒 Security Notes

### Row Level Security (RLS):
सभी Supabase tables में RLS enable करें:

```sql
-- Example for projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can access
CREATE POLICY "Authenticated users can view projects"
  ON projects FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only super_admin can modify
CREATE POLICY "Super admins can modify projects"
  ON projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );
```

### Environment Variables:
- ⚠️ **Never commit** `.env` file to git
- ✅ Use `.env.example` for reference
- ✅ Keep Supabase keys secure

---

## 🧪 Testing the Setup

### 1. Test Public Access:
```bash
# Landing page should work without login
curl http://localhost:3000/
```

### 2. Test Protected Routes:
```bash
# Should redirect to login
curl http://localhost:3000/admin
```

### 3. Test Login:
1. Open browser
2. Go to `/login`
3. Enter super admin credentials
4. Should redirect to dashboard

### 4. Test Protected Access After Login:
1. Login as super admin
2. Navigate to `/admin`, `/project-tracking`, etc.
3. All pages should be accessible

---

## 📝 Next Steps

### 1. **Create Super Admin User**
   - Follow "Creating Super Admin User" section above
   - Test login with created credentials

### 2. **Configure Email Templates** (Optional)
   - Go to Supabase → Authentication → Email Templates
   - Customize welcome email, password reset, etc.

### 3. **Add More Super Admins** (If needed)
   - Use Supabase Dashboard
   - Or create SQL script for bulk creation

### 4. **Setup Production Environment**
   - Update `.env.production` with production Supabase URL
   - Deploy to hosting platform
   - Test production authentication

### 5. **Enable Additional Security**
   - Add rate limiting
   - Enable CAPTCHA (optional)
   - Configure session timeout
   - Add audit logging

---

## 🐛 Troubleshooting

### Issue: "No active session found"
**Solution:**
- Check Supabase credentials in `.env`
- Ensure user exists in Supabase auth.users
- Check browser console for errors

### Issue: "Access Denied"
**Solution:**
- Ensure user has `role = 'super_admin'` in profiles table
- Clear localStorage and login again
- Check ProtectedRoute logic

### Issue: Build fails
**Solution:**
- Run `npm install` again
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for import errors

### Issue: Redirect loop
**Solution:**
- Clear browser cache
- Clear localStorage
- Check App.jsx routes configuration

---

## 📞 Support

For issues or questions:
1. Check Supabase logs: https://app.supabase.com/project/winhdjtlwhgdoinfrxch/logs
2. Review browser console for errors
3. Check network tab for API calls

---

## ✨ Summary

**Authentication Flow:**
1. User visits any protected page → Redirected to `/login`
2. User enters super admin credentials
3. Supabase validates credentials
4. Session created and stored
5. User redirected to requested page
6. ProtectedRoute checks if user is `super_admin`
7. Access granted to all protected pages

**Current Status:**
- ✅ Authentication: Enabled (Supabase)
- ✅ Roles: Super Admin Only
- ✅ Protected Routes: All pages except landing and login
- ✅ Unused Code: Removed (clinic, patient, AWS)
- ✅ Build: Successful
- ⏳ Super Admin User: Need to create in Supabase

---

**Last Updated:** 2025-01-14
**Version:** 1.0.0
**Status:** ✅ Production Ready
