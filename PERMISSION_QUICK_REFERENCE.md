# 🔐 Permission Module - Quick Reference

## 📦 Imports

```javascript
// Constants
import { PERMISSIONS } from '../constants/permissions';

// Service
import permissionService from '../services/permissionService';

// Hook
import { usePermissions } from '../hooks/usePermissions';

// Components
import PermissionGuard, { SuperAdminGuard, withPermission } from '../components/PermissionGuard';
```

---

## 🎯 Permission Keys

| Permission | Constant | Default for User |
|------------|----------|------------------|
| Edit Project | `PERMISSIONS.CAN_EDIT` | ❌ false |
| View Detailed Plan | `PERMISSIONS.VIEW_DETAILED_PLAN` | ❌ false |
| Upload Documents | `PERMISSIONS.UPLOAD_DOCUMENTS` | ✅ true |
| Manage Bugs | `PERMISSIONS.MANAGE_BUGS` | ✅ true |
| Access Testing | `PERMISSIONS.ACCESS_TESTING` | ✅ true |
| Upload Project Docs | `PERMISSIONS.UPLOAD_PROJECT_DOCS` | ✅ true |
| View Metrics | `PERMISSIONS.VIEW_METRICS` | ✅ true |
| View Timeline | `PERMISSIONS.VIEW_TIMELINE` | ✅ true |

---

## ⚡ Quick Usage

### 1. Hide Button Based on Permission

```javascript
<PermissionGuard projectId={projectId} permission={PERMISSIONS.CAN_EDIT}>
  <EditButton />
</PermissionGuard>
```

### 2. Check Permission in Logic

```javascript
const { canEdit, canManageBugs } = usePermissions(projectId);

if (canEdit) {
  // Enable edit mode
}
```

### 3. Super Admin Only Content

```javascript
<SuperAdminGuard>
  <AdminPanel />
</SuperAdminGuard>
```

### 4. Check Permission Programmatically

```javascript
const hasAccess = await permissionService.hasPermission(
  userId,
  projectId,
  PERMISSIONS.CAN_EDIT
);
```

---

## 📊 Presets

```javascript
// View Only (Clients)
permissionService.applyPermissionPreset(userId, projectId, 'VIEW_ONLY');

// Standard User (Team)
permissionService.applyPermissionPreset(userId, projectId, 'STANDARD_USER');

// Full Access (Managers)
permissionService.applyPermissionPreset(userId, projectId, 'FULL_ACCESS');
```

---

## 🔍 Debugging

```javascript
// Check current permissions
const permissions = await permissionService.getUserProjectPermissions(userId, projectId);
console.log(permissions);

// Clear cache
permissionService.clearCache();

// Check if super admin
const isSuperAdmin = await permissionService.isSuperAdmin(userId);
```

---

## 🎨 Common Patterns

### Pattern 1: Conditional Rendering
```javascript
{canEdit && <EditButton />}
{canViewDetailedPlan && <DetailedPlanButton />}
{canManageBugs && <BugTracker />}
```

### Pattern 2: Permission Guard with Fallback
```javascript
<PermissionGuard
  projectId={projectId}
  permission={PERMISSIONS.UPLOAD_DOCUMENTS}
  fallback={<p>Upload permission required</p>}
>
  <UploadForm />
</PermissionGuard>
```

### Pattern 3: Multiple Permissions (ANY)
```javascript
<PermissionGuard
  projectId={projectId}
  permissions={[PERMISSIONS.VIEW_METRICS, PERMISSIONS.VIEW_TIMELINE]}
  requireAll={false}  // User needs at least ONE
>
  <Dashboard />
</PermissionGuard>
```

### Pattern 4: Multiple Permissions (ALL)
```javascript
<PermissionGuard
  projectId={projectId}
  permissions={[PERMISSIONS.UPLOAD_DOCUMENTS, PERMISSIONS.MANAGE_BUGS]}
  requireAll={true}  // User needs ALL permissions
>
  <AdvancedEditor />
</PermissionGuard>
```

---

## ✅ Checklist

- [ ] Import PERMISSIONS constants (never hardcode strings)
- [ ] Wrap sensitive UI with PermissionGuard
- [ ] Use usePermissions hook for conditional logic
- [ ] Test with different user roles
- [ ] Clear cache after permission updates
- [ ] Add fallback content for better UX
- [ ] Log permission checks for debugging

---

## 📖 Full Documentation

See `PERMISSION_MODULE_GUIDE.md` for complete documentation.
