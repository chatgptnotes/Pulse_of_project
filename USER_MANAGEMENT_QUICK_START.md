# 🚀 User Management - Quick Start

## 📌 3-Minute Setup

### Step 1: Run Migration (1 min)
1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy all content from `USER_MANAGEMENT_MIGRATION.sql`
3. Paste and click **Run**

### Step 2: Make Yourself Super Admin (30 sec)
```sql
UPDATE public.users
SET role = 'super_admin'
WHERE email = 'your-email@example.com';
```

### Step 3: Access User Management (30 sec)
1. Login to your app
2. Click **"Users"** button in header
3. Or go to: `http://localhost:3000/users`

### Step 4: Create First User (1 min)
1. Click **"Add User"**
2. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
   - Role: User
3. Click **"Create User"**

### Step 5: Assign Projects (1 min)
1. Find the user in table
2. Click **folder icon** (Assign Projects)
3. Select projects
4. Click **"Assign Projects"**

---

## ✅ Done! Test It

### Login as User:
- Email: test@example.com
- Password: test123
- Should see only assigned projects!

---

## 📁 Files Created

✅ `USER_MANAGEMENT_MIGRATION.sql` - Database schema
✅ `apps/web/src/services/userManagementService.js` - Service
✅ `apps/web/src/pages/UserManagement.jsx` - UI Page
✅ `USER_MANAGEMENT_SETUP_GUIDE.md` - Full documentation

---

## 🎯 What You Get

### Super Admin Can:
- ✅ Create/manage users
- ✅ Assign projects to users
- ✅ View all projects
- ✅ Delete/deactivate users

### Regular Users:
- ✅ Login and view assigned projects only
- ✅ Cannot see other users
- ✅ Limited to their assigned projects

---

## 🔥 Quick Commands

### Check your role:
```sql
SELECT email, role FROM public.users WHERE email = 'your-email@example.com';
```

### View all users:
```sql
SELECT * FROM users_with_stats;
```

### View assignments:
```sql
SELECT * FROM project_assignments_detail;
```

### Make someone super admin:
```sql
UPDATE public.users SET role = 'super_admin' WHERE email = 'email@example.com';
```

---

## 📖 Need More Help?

Read the complete guide: `USER_MANAGEMENT_SETUP_GUIDE.md`

---

## 🎉 That's It!

Your user management system is ready! 🚀

**Access**: http://localhost:3000/users
