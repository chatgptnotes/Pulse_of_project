# 👥 User Management System - Complete Setup Guide

## 📋 Overview

This guide will help you set up a complete user management system where:
- **Super Admins** can create and manage users
- **Super Admins** can assign projects to users
- **Users** can login and view only their assigned projects
- **Role-based access control** ensures proper permissions

---

## 🚀 Step-by-Step Setup

### Step 1: Run Database Migration

Open your **Supabase Dashboard** → **SQL Editor** → **New Query**

Copy and paste the entire content of `USER_MANAGEMENT_MIGRATION.sql` and run it.

This will create:
- ✅ `users` table with role management
- ✅ `user_projects` table for project assignments
- ✅ Row Level Security policies
- ✅ Helper functions and views
- ✅ Automatic triggers

```sql
-- The migration creates these tables:
-- 1. public.users (user profiles with roles)
-- 2. public.user_projects (project assignments)
-- Plus helper functions and security policies
```

### Step 2: Make Yourself a Super Admin

After running the migration, you need to promote your account to super admin.

**In Supabase SQL Editor, run:**

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE public.users
SET role = 'super_admin'
WHERE email = 'your-email@example.com';
```

**Verify it worked:**
```sql
SELECT id, email, full_name, role
FROM public.users
WHERE email = 'your-email@example.com';
```

You should see `role = 'super_admin'`

### Step 3: Enable Auth Admin in Supabase

For creating users programmatically, you need to enable the Auth Admin API.

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Find your **Service Role Key** (keep it secret!)
3. This is already configured in your app via `supabaseService.ts`

### Step 4: Test the System

#### A. Login to Your App
```
http://localhost:3000/login
```

Login with your super admin account.

#### B. Navigate to User Management
```
http://localhost:3000/users
```

Or click the **"Users"** button in the admin header.

#### C. Create a Test User

1. Click **"Add User"** button
2. Fill in:
   - **Full Name**: Test User
   - **Email**: testuser@example.com
   - **Password**: testpass123
   - **Role**: User (not super admin)
3. Click **"Create User"**

#### D. Assign Projects to User

1. Find the test user in the table
2. Click the **folder icon** (Assign Projects)
3. Select some projects
4. Optional: Check "Allow user to edit"
5. Click **"Assign Projects"**

#### E. Login as Regular User

1. Logout from super admin
2. Login as `testuser@example.com` with password `testpass123`
3. Go to `/admin` page
4. You should only see the projects assigned to this user!

---

## 📁 Files Created

### 1. Database Migration
- **USER_MANAGEMENT_MIGRATION.sql** - Complete database schema

### 2. Service Layer
- **apps/web/src/services/userManagementService.js** - User CRUD operations

### 3. UI Components
- **apps/web/src/pages/UserManagement.jsx** - User management page

### 4. Routes
- **apps/web/src/App.jsx** - Added `/users` route

### 5. Documentation
- **USER_MANAGEMENT_SETUP_GUIDE.md** - This file

---

## 🎯 Features Implemented

### Super Admin Can:
- ✅ View all users with statistics
- ✅ Create new users (both super admins and regular users)
- ✅ Delete users (except themselves)
- ✅ Activate/Deactivate users
- ✅ Assign multiple projects to users
- ✅ Set edit permissions per user
- ✅ View all projects (unrestricted)

### Regular Users Can:
- ✅ Login to the system
- ✅ View only their assigned projects
- ✅ View project details (if can_edit=true, can edit)
- ✅ Update their own profile
- ❌ Cannot create/delete projects (unless assigned edit rights)
- ❌ Cannot see other users
- ❌ Cannot access user management

---

## 🗃️ Database Schema

### users table
```sql
id UUID PRIMARY KEY (references auth.users)
email TEXT UNIQUE
full_name TEXT
role TEXT ('super_admin' | 'user')
is_active BOOLEAN
avatar_url TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
created_by UUID
last_login TIMESTAMP
```

### user_projects table
```sql
id UUID PRIMARY KEY
user_id UUID (references users)
project_id TEXT (references admin_projects)
assigned_by UUID (who assigned it)
assigned_at TIMESTAMP
can_edit BOOLEAN (edit permissions)
notes TEXT
```

---

## 🔐 Security & Permissions

### Row Level Security (RLS)

**Users Table:**
- Super admins can see all users
- Regular users can only see themselves
- Super admins can create/update/delete users
- Users can update their own profile

**User_Projects Table:**
- Users can see their own assignments
- Super admins can see all assignments
- Only super admins can create/modify assignments

**Admin_Projects Table:**
- Super admins see all projects
- Regular users see only assigned projects (via `get_user_projects` function)

---

## 🔄 How It Works

### 1. User Creation Flow
```
Super Admin clicks "Add User"
  ↓
Fills form (email, password, name, role)
  ↓
userManagementService.createUser()
  ↓
Creates auth.users entry via Supabase Auth API
  ↓
Trigger automatically creates public.users entry
  ↓
User can now login
```

### 2. Project Assignment Flow
```
Super Admin clicks "Assign Projects" on user
  ↓
Selects projects from list
  ↓
Optionally sets "can_edit" permission
  ↓
userManagementService.assignMultipleProjects()
  ↓
Inserts/updates records in user_projects table
  ↓
User now sees those projects when they login
```

### 3. User Login & Project View Flow
```
User logs in
  ↓
System gets user.id from auth
  ↓
Checks user.role from public.users
  ↓
If super_admin:
  → Fetch all projects
If regular user:
  → Call get_user_projects(user.id)
  → Returns only assigned projects
  ↓
Display filtered projects on /admin page
```

---

## 📊 Statistics Dashboard

The User Management page shows:
- **Total Users** - Count of all users
- **Active Users** - Users with is_active=true
- **Super Admins** - Users with role='super_admin'
- **Project Assignments** - Total project assignments

---

## 🧪 Testing Checklist

### Test Super Admin Functions
- [ ] Create a new super admin user
- [ ] Create a new regular user
- [ ] Assign projects to a user
- [ ] Remove project assignment
- [ ] Activate/Deactivate a user
- [ ] Delete a user (not yourself)
- [ ] View user statistics

### Test Regular User Functions
- [ ] Login as regular user
- [ ] View only assigned projects
- [ ] Cannot access /users page
- [ ] Cannot see other users' projects
- [ ] Update own profile

### Test Security
- [ ] Regular user cannot access super admin endpoints
- [ ] Users cannot see each other's data
- [ ] Deactivated users cannot login
- [ ] Deleted users cannot login

---

## 🐛 Troubleshooting

### Issue: Cannot create users

**Error**: "Failed to create user"

**Solution**:
1. Check if you're a super admin:
   ```sql
   SELECT role FROM public.users WHERE email = 'your-email@example.com';
   ```
2. Ensure Supabase Auth is enabled
3. Check browser console for detailed errors

### Issue: Users not seeing assigned projects

**Error**: User sees no projects after login

**Solution**:
1. Verify project assignments:
   ```sql
   SELECT * FROM public.user_projects WHERE user_id = 'USER_UUID';
   ```
2. Check if user is active:
   ```sql
   SELECT is_active FROM public.users WHERE id = 'USER_UUID';
   ```
3. Verify the `get_user_projects` function exists:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'get_user_projects';
   ```

### Issue: "Trigger not found" error

**Solution**:
Re-run the migration SQL. The `handle_new_user()` trigger might not have been created.

### Issue: RLS blocking queries

**Error**: "Row level security policy violation"

**Solution**:
1. Check if RLS policies were created:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```
2. Verify you're logged in as the correct user
3. Check user role is set correctly

---

## 🔄 Database Functions Reference

### get_user_projects(user_uuid)
Returns all projects for a user. If super admin, returns all projects. If regular user, returns only assigned projects.

```sql
SELECT * FROM get_user_projects('USER_UUID_HERE');
```

### assign_project_to_user(user_id, project_id, can_edit, notes)
Assigns a project to a user with optional edit permission and notes.

```sql
SELECT assign_project_to_user(
  'USER_UUID',
  'project-id',
  true,  -- can_edit
  'Important client project'  -- notes
);
```

### remove_project_assignment(user_id, project_id)
Removes a project assignment from a user.

```sql
SELECT remove_project_assignment('USER_UUID', 'project-id');
```

---

## 📈 Views Available

### users_with_stats
Shows all users with their assigned project counts.

```sql
SELECT * FROM users_with_stats;
```

### project_assignments_detail
Shows detailed project assignments with user and project info.

```sql
SELECT * FROM project_assignments_detail;
```

---

## 🎨 UI Components

### User Management Page (`/users`)

**Features**:
- User list table
- Add new user modal
- Assign projects modal
- User statistics cards
- Search and filter users
- Activate/Deactivate toggle
- Delete user button

**Navigation**:
- From Admin page → Click "Users" button
- Direct URL: `http://localhost:3000/users`

---

## 🔒 Best Practices

1. **Always use strong passwords** (min 6 characters, but recommend 12+)
2. **Limit super admin accounts** - Only give to trusted users
3. **Regularly review user assignments** - Remove access when not needed
4. **Use "can_edit" sparingly** - Most users should be view-only
5. **Deactivate instead of delete** - Preserves audit trail
6. **Monitor last_login** - Identify inactive accounts

---

## 📚 API Service Methods

### User Management Service

```javascript
import userManagementService from '../services/userManagementService';

// Get all users
const users = await userManagementService.getAllUsers();

// Get users with statistics
const usersWithStats = await userManagementService.getUsersWithStats();

// Create user
await userManagementService.createUser({
  email: 'user@example.com',
  password: 'password123',
  full_name: 'John Doe',
  role: 'user'
});

// Update user
await userManagementService.updateUser(userId, { full_name: 'Jane Doe' });

// Delete user
await userManagementService.deleteUser(userId);

// Get user's projects
const projects = await userManagementService.getUserProjects(userId);

// Assign project
await userManagementService.assignProject({
  userId: 'user-uuid',
  projectId: 'project-id',
  canEdit: false,
  notes: 'Optional notes'
});

// Assign multiple projects
await userManagementService.assignMultipleProjects(
  userId,
  ['project-1', 'project-2'],
  false // canEdit
);

// Remove assignment
await userManagementService.removeAssignment(userId, projectId);

// Get statistics
const stats = await userManagementService.getStatistics();
```

---

## ✅ Success Criteria

Your system is working correctly if:

1. ✅ Super admin can access `/users` page
2. ✅ Super admin can create new users
3. ✅ Super admin can assign projects to users
4. ✅ Regular users see only their assigned projects
5. ✅ Regular users cannot access `/users` page
6. ✅ Deactivated users cannot login
7. ✅ All statistics display correctly
8. ✅ No console errors

---

## 🎉 Conclusion

You now have a complete user management system with:
- Role-based access control (Super Admin vs User)
- Project assignment functionality
- Secure authentication and authorization
- Beautiful UI for managing users and projects

**Next Steps**:
1. Create your first users
2. Assign projects to them
3. Test login as different users
4. Monitor usage and adjust permissions as needed

**Need Help?**
- Check console logs for detailed errors
- Review Supabase logs in dashboard
- Verify all migration steps completed
- Test with simple scenarios first

Happy managing! 🚀
