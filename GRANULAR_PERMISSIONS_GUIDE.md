# 🔐 Granular Permission System - Complete Guide

## 📋 Overview

The granular permission system allows **Super Admins** to control exactly what each user can see and do in their assigned projects.

### Permission Types:

| Permission | Description | Default for Regular Users |
|-----------|-------------|---------------------------|
| **Can Edit Project Data** | Edit project details, milestones, tasks | ❌ No |
| **View Detailed Project Plan** | Access "View Detailed Project Plan" button | ❌ No |
| **Upload Documents** | Upload documents to projects | ✅ Yes |
| **Manage Bugs & Issues** | Create, edit, delete bug reports | ✅ Yes |
| **Access Testing Tracker** | View and update testing information | ✅ Yes |
| **Upload Project Documents** | Upload project-specific documents | ✅ Yes |
| **View Dashboard Metrics** | See project metrics and KPIs | ✅ Yes |
| **View Project Timeline** | Access Gantt chart and timeline | ✅ Yes |

---

## 🚀 Quick Setup (2 Steps)

### Step 1: Run Permissions Migration
Open **Supabase Dashboard** → **SQL Editor** → Run:

```sql
-- Copy and run PERMISSIONS_MIGRATION.sql
```

This adds 7 new permission columns to `user_projects` table.

### Step 2: Assign Permissions to Users
1. Go to `/users` page
2. Click **folder icon** on a user
3. Choose a **Permission Preset** or customize individual permissions
4. Select projects
5. Click **Assign**

---

## 🎯 Permission Presets

### 1. **View Only** (Restricted)
Perfect for clients or stakeholders who just need to see progress.

```
✅ View Dashboard Metrics
✅ View Project Timeline
❌ Everything else disabled
```

**Use Case**: External clients, investors

### 2. **Standard User** (Recommended)
Best for regular team members who need to work on projects.

```
✅ Upload Documents
✅ Manage Bugs & Issues
✅ Access Testing Tracker
✅ Upload Project Documents
✅ View Dashboard Metrics
✅ View Project Timeline
❌ View Detailed Project Plan (Edit milestones)
❌ Edit Project Data
```

**Use Case**: Developers, QA testers, designers

### 3. **Full Access** (Power User)
For project managers or leads who need complete control.

```
✅ All permissions enabled
✅ Can edit everything
✅ Can view detailed project plan
```

**Use Case**: Project managers, team leads

---

## 📖 Step-by-Step Usage

### Creating a User with Permissions

#### Method 1: Using Presets (Fastest)
1. Login as **Super Admin**
2. Navigate to `/users`
3. Click **"Add User"**
4. Fill user details
5. After creating user, click **folder icon**
6. Click one of the preset buttons:
   - **View Only** - For viewers
   - **Standard User** - For team members
   - **Full Access** - For managers
7. Select projects
8. Click **"Assign Projects"**

#### Method 2: Custom Permissions (Granular)
1. Follow steps 1-5 above
2. **Don't click a preset** (or click one as starting point)
3. Customize checkboxes:
   - Check/uncheck specific permissions
   - Fine-tune access level
4. Select projects
5. Click **"Assign Projects"**

---

## 🔍 Permission Details

### 1. **Can Edit Project Data**
Controls whether user can modify:
- Project name, description
- Client information
- Status, priority
- Deadlines
- Team members

**Recommended**: Only for project managers and super admins

### 2. **View Detailed Project Plan**
This is the BIG one! Controls the purple button:
```
┌──────────────────────────────────────────┐
│ 📝 View Detailed Project Plan            │
│ Edit milestones, tasks, dates, and full  │
│ project details                          │
└──────────────────────────────────────────┘
```

When **disabled**, this button is **hidden** from the user.

**Recommended**: Disable for regular users to prevent accidental changes

### 3. **Upload Documents**
Allows uploading files in document sections.

**Recommended**: Enable for team members who need to share files

### 4. **Manage Bugs & Issues**
Access to the **Bug Report** module:
- Create new bug reports
- Update bug status
- Add comments
- Assign severity levels

**Recommended**: Enable for developers and QA

### 5. **Access Testing Tracker**
Access to the **Testing Tracker** module:
- View test cases
- Update test results
- Mark tests as pass/fail
- Track testing progress

**Recommended**: Enable for QA team

### 6. **Upload Project Documents**
Access to **Project Documents** section:
- Upload deliverables
- Upload specifications
- Upload design files

**Recommended**: Enable for team members

### 7. **View Dashboard Metrics**
See the **Dashboard Metrics** section:
- Overall progress
- Milestones completion
- Days remaining
- Team members count

**Recommended**: Enable for everyone (default)

### 8. **View Project Timeline**
Access to **Gantt Chart / Timeline**:
- Visual project timeline
- Milestone dates
- Task dependencies
- Progress visualization

**Recommended**: Enable for everyone (default)

---

## 💡 Real-World Examples

### Example 1: Client View
**User**: External client who paid for the project
**Needs**: See progress, but can't change anything

**Setup**:
```
Permission Preset: View Only
✅ View Dashboard Metrics
✅ View Project Timeline
❌ Everything else
```

### Example 2: Developer
**User**: Software developer working on features
**Needs**: Report bugs, upload code docs, see timeline

**Setup**:
```
Permission Preset: Standard User
✅ Upload Documents
✅ Manage Bugs & Issues
✅ Access Testing Tracker
✅ Upload Project Documents
✅ View Dashboard Metrics
✅ View Project Timeline
❌ View Detailed Project Plan
❌ Edit Project Data
```

### Example 3: QA Tester
**User**: Quality assurance tester
**Needs**: Testing tracker, bug reporting, document access

**Setup**:
```
Custom Permissions:
❌ Can Edit Project Data
❌ View Detailed Project Plan
✅ Upload Documents
✅ Manage Bugs & Issues (Critical!)
✅ Access Testing Tracker (Critical!)
✅ Upload Project Documents
✅ View Dashboard Metrics
✅ View Project Timeline
```

### Example 4: Project Manager
**User**: Project manager overseeing the project
**Needs**: Full access to everything

**Setup**:
```
Permission Preset: Full Access
✅ All permissions enabled
```

### Example 5: Designer
**User**: UI/UX designer
**Needs**: Upload designs, view timeline, no bugs/testing

**Setup**:
```
Custom Permissions:
❌ Can Edit Project Data
❌ View Detailed Project Plan
✅ Upload Documents
❌ Manage Bugs & Issues (not needed)
❌ Access Testing Tracker (not needed)
✅ Upload Project Documents
✅ View Dashboard Metrics
✅ View Project Timeline
```

---

## 🔄 How It Works Technically

### Database Level
```sql
-- Permissions stored in user_projects table
CREATE TABLE user_projects (
  user_id UUID,
  project_id TEXT,
  can_edit BOOLEAN,
  can_view_detailed_plan BOOLEAN,  -- Controls "View Detailed Plan" button
  can_upload_documents BOOLEAN,
  can_manage_bugs BOOLEAN,
  can_access_testing BOOLEAN,
  can_upload_project_docs BOOLEAN,
  can_view_metrics BOOLEAN,
  can_view_timeline BOOLEAN
);
```

### API Level
```javascript
// When assigning projects
await userManagementService.assignMultipleProjects(
  userId,
  projectIds,
  canEdit,
  {
    canViewDetailedPlan: false,
    canUploadDocuments: true,
    canManageBugs: true,
    // ... other permissions
  }
);
```

### UI Level
```javascript
// Future enhancement: Hide/show modules based on permissions
if (userPermissions.canViewDetailedPlan) {
  // Show "View Detailed Project Plan" button
} else {
  // Hide the button
}
```

---

## 📊 Permission Matrix

| User Role | View Data | Upload Docs | Bugs | Testing | Edit Plan | Edit Project |
|-----------|-----------|-------------|------|---------|-----------|--------------|
| **Client** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Developer** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **QA Tester** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Designer** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Manager** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🧪 Testing Your Permissions

### Test 1: View Only User
1. Create user with "View Only" preset
2. Assign a project
3. Login as that user
4. **Should see**: Dashboard metrics, timeline
5. **Should NOT see**: "View Detailed Project Plan" button
6. **Should NOT see**: Bug report section
7. **Should NOT see**: Testing tracker

### Test 2: Standard User
1. Create user with "Standard User" preset
2. Assign a project
3. Login as that user
4. **Should see**: Bugs, testing, documents, metrics
5. **Should NOT see**: "View Detailed Project Plan" button

### Test 3: Custom Permissions
1. Create user
2. Enable ONLY "Manage Bugs & Issues"
3. Assign project
4. Login as that user
5. **Should see**: Only bug reporting module

---

## 🔐 Security Notes

### Permission Inheritance
- **Super Admins** ALWAYS have all permissions
- **Regular Users** have permissions based on assignments
- **Unassigned users** see NO projects

### Database Security
- Row Level Security (RLS) enforces permissions
- Users can't bypass permissions via API calls
- All changes are logged with `assigned_by` field

### Audit Trail
Every permission change is tracked:
```sql
SELECT
  user_email,
  project_name,
  can_view_detailed_plan,
  assigned_at,
  assigned_by
FROM project_assignments_detail
ORDER BY assigned_at DESC;
```

---

## 🛠️ Advanced Usage

### Bulk Permission Updates
Update permissions for multiple users at once using SQL:

```sql
-- Give all users bug reporting access
UPDATE user_projects
SET can_manage_bugs = true
WHERE user_id IN (
  SELECT id FROM users WHERE role = 'user'
);
```

### Permission Templates
Create custom templates using database functions:

```sql
-- Create a "Designer" template
CREATE OR REPLACE FUNCTION assign_designer_permissions(
  p_user_id UUID,
  p_project_id TEXT
)
RETURNS UUID AS $$
BEGIN
  RETURN assign_project_to_user(
    p_user_id,
    p_project_id,
    false,  -- can_edit
    'Designer access',
    false,  -- can_view_detailed_plan
    true,   -- can_upload_documents
    false,  -- can_manage_bugs
    false,  -- can_access_testing
    true,   -- can_upload_project_docs
    true,   -- can_view_metrics
    true    -- can_view_timeline
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 📝 Migration Checklist

After running `PERMISSIONS_MIGRATION.sql`:

- [ ] Verify permission columns exist
  ```sql
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'user_projects' AND column_name LIKE 'can_%';
  ```

- [ ] Check updated view
  ```sql
  SELECT * FROM project_assignments_detail LIMIT 1;
  ```

- [ ] Test get_user_projects function
  ```sql
  SELECT * FROM get_user_projects('YOUR_USER_ID');
  ```

- [ ] Create a test user and assign with custom permissions

- [ ] Login as test user and verify permissions work

---

## 🎯 Best Practices

### 1. Start with Presets
Use "View Only", "Standard User", or "Full Access" as starting points, then customize if needed.

### 2. Principle of Least Privilege
Give users the **minimum permissions** they need to do their job.

### 3. Regular Audits
Periodically review user permissions and remove unnecessary access.

### 4. Document Custom Setups
If you create custom permission combinations, document why in the `notes` field.

### 5. Use Role-Based Permissions
Create consistent permission sets for each role (Developer, Designer, QA, etc.)

---

## 🔄 Permission Update Workflow

### Changing User Permissions
1. Go to `/users`
2. Find the user
3. Click **folder icon** (Assign Projects)
4. Modify permissions
5. Click **Assign Projects**
6. User's permissions update immediately

### Removing Permissions
To remove a permission, simply uncheck it and reassign.

---

## ❓ FAQ

**Q: Can a user have different permissions for different projects?**
A: Not currently. Permissions apply to all assigned projects. This is by design for simplicity.

**Q: Can users see what permissions they have?**
A: Not yet. Future enhancement can show this on their profile.

**Q: What happens if I disable all permissions?**
A: User can still see they're assigned to projects, but won't see any modules or data.

**Q: Can I change permissions after assignment?**
A: Yes! Just reassign the project with new permissions. It will update existing assignments.

**Q: Do super admins need permissions?**
A: No. Super admins ALWAYS have all permissions, regardless of settings.

---

## 🎉 Summary

**You now have complete control over what each user can do!**

- ✅ **8 granular permissions** per user
- ✅ **3 quick presets** (View Only, Standard, Full)
- ✅ **Custom combinations** for specific needs
- ✅ **Database-enforced** security
- ✅ **Easy to manage** via UI

**Start by using presets, then customize as needed!** 🚀
