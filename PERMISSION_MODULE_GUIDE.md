# 🔐 Permission Module - Complete Guide

## Overview

The Permission Module provides a comprehensive, granular permission system for managing user access to different features and modules across the application. It includes:

- **Permission Service** - Backend logic for fetching and managing permissions
- **React Hook (usePermissions)** - Easy access to permissions in React components
- **Permission Guard Component** - Conditional rendering based on permissions
- **Permission Constants** - Centralized permission definitions

---

## 📁 File Structure

```
apps/web/src/
├── constants/
│   └── permissions.js          # Permission constants and presets
├── services/
│   └── permissionService.js    # Permission service logic
├── hooks/
│   └── usePermissions.jsx      # React hook for permissions
└── components/
    └── PermissionGuard.jsx     # Permission guard component
```

---

## 🎯 Available Permissions

### 1. **CAN_EDIT** (`can_edit`)
Allows editing of project data, milestones, and tasks

### 2. **VIEW_DETAILED_PLAN** (`can_view_detailed_plan`)
Shows the "View Detailed Project Plan" button to edit milestones and tasks

### 3. **UPLOAD_DOCUMENTS** (`can_upload_documents`)
Allows uploading documents to the project

### 4. **MANAGE_BUGS** (`can_manage_bugs`)
Allows creating, editing, and managing bugs and issues

### 5. **ACCESS_TESTING** (`can_access_testing`)
Allows access to the testing tracker module

### 6. **UPLOAD_PROJECT_DOCS** (`can_upload_project_docs`)
Allows uploading project documentation files

### 7. **VIEW_METRICS** (`can_view_metrics`)
Allows viewing project metrics and analytics

### 8. **VIEW_TIMELINE** (`can_view_timeline`)
Allows viewing project timeline and history

---

## 📊 Permission Presets

### View Only
Perfect for **clients** who should only monitor progress
```javascript
{
  can_edit: false,
  can_view_detailed_plan: false,
  can_upload_documents: false,
  can_manage_bugs: false,
  can_access_testing: false,
  can_upload_project_docs: false,
  can_view_metrics: true,      ✅
  can_view_timeline: true,      ✅
}
```

### Standard User
Perfect for **team members** who need to work on the project
```javascript
{
  can_edit: false,
  can_view_detailed_plan: false,
  can_upload_documents: true,     ✅
  can_manage_bugs: true,           ✅
  can_access_testing: true,        ✅
  can_upload_project_docs: true,   ✅
  can_view_metrics: true,          ✅
  can_view_timeline: true,         ✅
}
```

### Full Access
Perfect for **project managers** who need complete control
```javascript
{
  can_edit: true,                   ✅
  can_view_detailed_plan: true,     ✅
  can_upload_documents: true,       ✅
  can_manage_bugs: true,            ✅
  can_access_testing: true,         ✅
  can_upload_project_docs: true,    ✅
  can_view_metrics: true,           ✅
  can_view_timeline: true,          ✅
}
```

---

## 🚀 Usage Examples

### 1. Using Permission Constants

```javascript
import { PERMISSIONS } from '../constants/permissions';

// Check a specific permission
if (user.permissions[PERMISSIONS.CAN_EDIT]) {
  // Show edit button
}
```

### 2. Using the Permission Service

```javascript
import permissionService from '../services/permissionService';

// Get all permissions for a user-project
const permissions = await permissionService.getUserProjectPermissions(userId, projectId);

// Check a specific permission
const canEdit = await permissionService.hasPermission(userId, projectId, PERMISSIONS.CAN_EDIT);

// Check multiple permissions (requires ALL)
const hasAccess = await permissionService.hasPermissions(
  userId,
  projectId,
  [PERMISSIONS.UPLOAD_DOCUMENTS, PERMISSIONS.MANAGE_BUGS],
  true  // requireAll = true
);

// Check if user is super admin
const isSuperAdmin = await permissionService.isSuperAdmin(userId);

// Get all accessible projects
const projects = await permissionService.getUserAccessibleProjects(userId);

// Update permissions
await permissionService.updateUserPermissions(userId, projectId, {
  can_edit: true,
  can_view_detailed_plan: true,
  // ... other permissions
});

// Apply a preset
await permissionService.applyPermissionPreset(userId, projectId, 'STANDARD_USER');
```

### 3. Using the Permission Hook

```javascript
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../constants/permissions';

function MyComponent({ projectId }) {
  const {
    permissions,        // Full permissions object
    loading,            // Loading state
    error,              // Error state
    hasPermission,      // Function to check permission
    hasPermissions,     // Function to check multiple permissions
    isSuperAdmin,       // Function to check super admin

    // Convenience properties
    canEdit,
    canViewDetailedPlan,
    canUploadDocuments,
    canManageBugs,
    canAccessTesting,
    canUploadProjectDocs,
    canViewMetrics,
    canViewTimeline,

    refreshPermissions  // Function to refresh
  } = usePermissions(projectId);

  if (loading) return <div>Loading permissions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {canEdit && <EditButton />}
      {canViewDetailedPlan && <DetailedPlanButton />}

      {hasPermission(PERMISSIONS.MANAGE_BUGS) && <BugTracker />}

      {hasPermissions([PERMISSIONS.UPLOAD_DOCUMENTS, PERMISSIONS.UPLOAD_PROJECT_DOCS], false) && (
        <UploadSection />
      )}
    </div>
  );
}
```

### 4. Using Permission Guard Component

#### Basic Usage - Single Permission
```javascript
import PermissionGuard from '../components/PermissionGuard';
import { PERMISSIONS } from '../constants/permissions';

<PermissionGuard projectId={projectId} permission={PERMISSIONS.CAN_EDIT}>
  <EditButton />
</PermissionGuard>
```

#### Multiple Permissions - Require ALL
```javascript
<PermissionGuard
  projectId={projectId}
  permissions={[PERMISSIONS.UPLOAD_DOCUMENTS, PERMISSIONS.MANAGE_BUGS]}
  requireAll={true}
>
  <AdvancedEditor />
</PermissionGuard>
```

#### Multiple Permissions - Require AT LEAST ONE
```javascript
<PermissionGuard
  projectId={projectId}
  permissions={[PERMISSIONS.VIEW_METRICS, PERMISSIONS.VIEW_TIMELINE]}
  requireAll={false}
>
  <DashboardView />
</PermissionGuard>
```

#### With Fallback Content
```javascript
<PermissionGuard
  projectId={projectId}
  permission={PERMISSIONS.CAN_EDIT}
  fallback={<p className="text-gray-500">You don't have permission to edit</p>}
>
  <EditForm />
</PermissionGuard>
```

#### With Custom Loading State
```javascript
<PermissionGuard
  projectId={projectId}
  permission={PERMISSIONS.CAN_EDIT}
  loading={<Spinner />}
>
  <EditButton />
</PermissionGuard>
```

#### Super Admin Only
```javascript
<PermissionGuard requireSuperAdmin={true}>
  <AdminPanel />
</PermissionGuard>
```

### 5. Using SuperAdminGuard

```javascript
import { SuperAdminGuard } from '../components/PermissionGuard';

<SuperAdminGuard fallback={<AccessDenied />}>
  <UserManagement />
</SuperAdminGuard>
```

### 6. Using Higher-Order Component (HOC)

```javascript
import { withPermission } from '../components/PermissionGuard';
import { PERMISSIONS } from '../constants/permissions';

// Wrap a component with permission check
const ProtectedEditButton = withPermission(EditButton, {
  permission: PERMISSIONS.CAN_EDIT,
  fallback: <DisabledButton />
});

// Usage
<ProtectedEditButton projectId={projectId} />
```

---

## 🔄 How Permissions Work

### 1. Super Admins
- **Role**: `super_admin`
- **Access**: ALL permissions automatically granted
- **Bypass**: Skip all permission checks

### 2. Regular Users
- **Role**: `user`
- **Access**: Only assigned projects
- **Permissions**: Specific per-project permissions

### 3. Permission Hierarchy
```
Super Admin (role = 'super_admin')
    ↓
  ALL PERMISSIONS GRANTED AUTOMATICALLY

Regular User (role = 'user')
    ↓
  Check user_projects table
    ↓
  Return specific permissions for that project
```

---

## 🗄️ Database Schema

### `users` table
```sql
- id (UUID)
- email (TEXT)
- full_name (TEXT)
- role (TEXT) -- 'super_admin' or 'user'
- is_active (BOOLEAN)
```

### `user_projects` table
```sql
- id (UUID)
- user_id (UUID)
- project_id (TEXT)
- can_edit (BOOLEAN)
- can_view_detailed_plan (BOOLEAN)
- can_upload_documents (BOOLEAN)
- can_manage_bugs (BOOLEAN)
- can_access_testing (BOOLEAN)
- can_upload_project_docs (BOOLEAN)
- can_view_metrics (BOOLEAN)
- can_view_timeline (BOOLEAN)
```

---

## 🎨 Real-World Example

### Protecting the "View Detailed Project Plan" Button

**apps/web/src/modules/pulseofproject/PulseOfProject.tsx**

```javascript
import PermissionGuard from '../../components/PermissionGuard';
import { PERMISSIONS } from '../../constants/permissions';

// In your component
<PermissionGuard
  projectId={selectedProject}
  permission={PERMISSIONS.VIEW_DETAILED_PLAN}
>
  <button onClick={goToDetailedView}>
    View Detailed Project Plan
  </button>
</PermissionGuard>
```

**Result**:
- ✅ Super admins → Button visible
- ✅ Users with `can_view_detailed_plan = true` → Button visible
- ❌ Users with `can_view_detailed_plan = false` → Button hidden
- ❌ Users not assigned to project → Button hidden

---

## 🧪 Testing Permissions

### Test Case 1: View Only User
```javascript
// 1. Create user with View Only preset
await permissionService.applyPermissionPreset(userId, projectId, 'VIEW_ONLY');

// 2. Login as that user
// 3. Expected behavior:
//    - Can see metrics ✅
//    - Can see timeline ✅
//    - Cannot see "View Detailed Project Plan" button ❌
//    - Cannot upload documents ❌
//    - Cannot manage bugs ❌
```

### Test Case 2: Standard User
```javascript
// 1. Create user with Standard User preset
await permissionService.applyPermissionPreset(userId, projectId, 'STANDARD_USER');

// 2. Login as that user
// 3. Expected behavior:
//    - Can upload documents ✅
//    - Can manage bugs ✅
//    - Can access testing ✅
//    - Cannot see "View Detailed Project Plan" button ❌
```

### Test Case 3: Full Access User
```javascript
// 1. Create user with Full Access preset
await permissionService.applyPermissionPreset(userId, projectId, 'FULL_ACCESS');

// 2. Login as that user
// 3. Expected behavior:
//    - Can see "View Detailed Project Plan" button ✅
//    - Can edit project ✅
//    - Has access to all features ✅
```

---

## ⚡ Performance Optimization

### Caching
The permission service automatically caches permissions for **5 minutes** to reduce database calls.

```javascript
// Manual cache management
permissionService.clearCache();  // Clear all cache
permissionService.clearCache(`${userId}-${projectId}`);  // Clear specific cache
```

### Batch Operations
When displaying multiple projects, use `getUserAccessibleProjects()` instead of fetching permissions for each project individually:

```javascript
// ❌ Bad - Multiple queries
for (const project of projects) {
  const perms = await getUserProjectPermissions(userId, project.id);
}

// ✅ Good - Single query
const accessibleProjects = await getUserAccessibleProjects(userId);
```

---

## 🔧 Troubleshooting

### Permission Not Working?

1. **Check User Role**
   ```javascript
   const isSuperAdmin = await permissionService.isSuperAdmin(userId);
   console.log('Is super admin?', isSuperAdmin);
   ```

2. **Check Permissions**
   ```javascript
   const perms = await permissionService.getUserProjectPermissions(userId, projectId);
   console.log('Permissions:', perms);
   ```

3. **Clear Cache**
   ```javascript
   permissionService.clearCache();
   ```

4. **Check Database**
   ```sql
   -- Check if user exists
   SELECT * FROM public.users WHERE id = 'user-id';

   -- Check project assignment
   SELECT * FROM public.user_projects
   WHERE user_id = 'user-id' AND project_id = 'project-id';
   ```

---

## 📚 Next Steps

1. **Assign Users to Projects**: Use the `/users` page
2. **Set Permissions**: Choose a preset or customize
3. **Test Access**: Login as different users to verify
4. **Add More Guards**: Protect sensitive UI elements
5. **Monitor Access**: Check logs for permission denials

---

## 🎯 Best Practices

1. ✅ Always use `PERMISSIONS` constants instead of hardcoded strings
2. ✅ Use `PermissionGuard` for UI elements that should be hidden
3. ✅ Use `usePermissions` hook for complex permission logic
4. ✅ Test with different user roles (super_admin, user with different presets)
5. ✅ Clear cache after updating permissions
6. ✅ Log permission checks for debugging
7. ❌ Don't hardcode permission checks in multiple places
8. ❌ Don't bypass permission checks in production

---

## 📖 Related Documentation

- **User Management Guide**: `USER_MANAGEMENT_SETUP_GUIDE.md`
- **Permissions Quick Start**: `PERMISSIONS_QUICK_START.md`
- **Database Migration**: `COMPLETE_USER_PERMISSIONS_MIGRATION.sql`
- **Granular Permissions**: `GRANULAR_PERMISSIONS_GUIDE.md`

---

## ✅ Summary

The Permission Module provides:

- ✅ **Granular Control** - 8 different module-level permissions
- ✅ **Easy Integration** - Simple hooks and components
- ✅ **Performance** - Built-in caching for fast access
- ✅ **Flexibility** - Presets + custom permissions
- ✅ **Security** - RLS policies enforce database security
- ✅ **Developer-Friendly** - Clear constants and types

**You're all set! 🎉**
