# 🔐 Permission Integration Examples

Ready-to-use code snippets for integrating permissions into your components.

---

## 📝 Example 1: Protecting Bug Report Module

**File**: `apps/web/src/modules/pulseofproject/components/BugReport.jsx`

### Option A: Using PermissionGuard (Recommended)

```javascript
import PermissionGuard from '../../../components/PermissionGuard';
import { PERMISSIONS } from '../../../constants/permissions';

// In your component return statement
<PermissionGuard
  projectId={projectName}
  permission={PERMISSIONS.MANAGE_BUGS}
  fallback={
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        Bug Tracking
      </h3>
      <p className="text-gray-500">
        You don't have permission to manage bugs for this project.
        Contact your administrator if you need access.
      </p>
    </div>
  }
>
  {/* Your existing BugReport component content */}
  <div className="bug-report-container">
    {/* ... existing code ... */}
  </div>
</PermissionGuard>
```

### Option B: Using the Hook

```javascript
import { usePermissions } from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';

function BugReport({ projectName }) {
  const { canManageBugs, loading } = usePermissions(projectName);

  if (loading) {
    return <div>Loading permissions...</div>;
  }

  if (!canManageBugs) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Bug Tracking
        </h3>
        <p className="text-gray-500">
          You don't have permission to manage bugs.
        </p>
      </div>
    );
  }

  return (
    <div className="bug-report-container">
      {/* Your existing BugReport component content */}
    </div>
  );
}
```

---

## 📝 Example 2: Protecting Testing Tracker

**File**: `apps/web/src/modules/pulseofproject/components/TestingTracker.jsx`

```javascript
import PermissionGuard from '../../../components/PermissionGuard';
import { PERMISSIONS } from '../../../constants/permissions';

function TestingTracker({ projectName, bugs }) {
  return (
    <PermissionGuard
      projectId={projectName}
      permission={PERMISSIONS.ACCESS_TESTING}
      fallback={
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Testing Tracker
          </h3>
          <p className="text-gray-500">
            You don't have permission to access the testing tracker.
          </p>
        </div>
      }
    >
      {/* Your existing TestingTracker content */}
      <div className="testing-tracker-container">
        {/* ... existing code ... */}
      </div>
    </PermissionGuard>
  );
}
```

---

## 📝 Example 3: Protecting Project Documents Upload

**File**: `apps/web/src/modules/project-tracking/components/ProjectDocuments.jsx`

```javascript
import PermissionGuard from '../../../components/PermissionGuard';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';

function ProjectDocuments({ projectId, isEditMode }) {
  const { canUploadProjectDocs, canViewMetrics } = usePermissions(projectId);

  return (
    <div className="project-documents">
      {/* Upload button - only show if user has permission */}
      <PermissionGuard
        projectId={projectId}
        permission={PERMISSIONS.UPLOAD_PROJECT_DOCS}
      >
        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Upload Document
        </button>
      </PermissionGuard>

      {/* Document list - show to everyone */}
      <div className="document-list">
        {documents.map(doc => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>

      {/* Delete button - only for users who can upload */}
      {canUploadProjectDocs && (
        <button onClick={handleDelete} className="text-red-600">
          Delete
        </button>
      )}
    </div>
  );
}
```

---

## 📝 Example 4: Protecting Dashboard Metrics

**File**: `apps/web/src/modules/pulseofproject/components/DashboardMetrics.jsx`

```javascript
import PermissionGuard from '../../../components/PermissionGuard';
import { PERMISSIONS } from '../../../constants/permissions';

function DashboardMetrics({ projectData }) {
  return (
    <PermissionGuard
      projectId={projectData?.id}
      permission={PERMISSIONS.VIEW_METRICS}
      fallback={
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Project Metrics
          </h3>
          <p className="text-gray-500">
            You don't have permission to view metrics.
          </p>
        </div>
      }
    >
      {/* Your existing metrics dashboard */}
      <div className="metrics-dashboard">
        <MetricCard title="Progress" value={projectData.progress} />
        <MetricCard title="Tasks" value={projectData.tasks.length} />
        {/* ... more metrics ... */}
      </div>
    </PermissionGuard>
  );
}
```

---

## 📝 Example 5: Conditional Edit Button

**File**: Any component with edit functionality

```javascript
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../constants/permissions';

function ProjectCard({ project }) {
  const { canEdit, isSuperAdmin } = usePermissions(project.id);

  return (
    <div className="project-card">
      <h3>{project.name}</h3>
      <p>{project.description}</p>

      {/* Show edit button only if user can edit */}
      {canEdit && (
        <button
          onClick={() => handleEdit(project)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Edit Project
        </button>
      )}

      {/* Show admin badge if super admin */}
      {isSuperAdmin() && (
        <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
          Admin
        </span>
      )}
    </div>
  );
}
```

---

## 📝 Example 6: Multiple Permissions (Require ALL)

**File**: Advanced editor that needs multiple permissions

```javascript
import PermissionGuard from '../components/PermissionGuard';
import { PERMISSIONS } from '../constants/permissions';

function AdvancedProjectEditor({ projectId }) {
  return (
    <PermissionGuard
      projectId={projectId}
      permissions={[
        PERMISSIONS.CAN_EDIT,
        PERMISSIONS.UPLOAD_DOCUMENTS,
        PERMISSIONS.MANAGE_BUGS
      ]}
      requireAll={true}  // User must have ALL three permissions
      fallback={
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold mb-2">
            Advanced Editor Access Denied
          </h3>
          <p className="text-gray-600">
            You need edit, upload, and bug management permissions to access
            the advanced editor.
          </p>
        </div>
      }
    >
      <div className="advanced-editor">
        {/* Advanced editing features */}
      </div>
    </PermissionGuard>
  );
}
```

---

## 📝 Example 7: Multiple Permissions (Require ANY)

**File**: Dashboard that shows if user has ANY metric permission

```javascript
import PermissionGuard from '../components/PermissionGuard';
import { PERMISSIONS } from '../constants/permissions';

function ProjectDashboard({ projectId }) {
  return (
    <PermissionGuard
      projectId={projectId}
      permissions={[
        PERMISSIONS.VIEW_METRICS,
        PERMISSIONS.VIEW_TIMELINE
      ]}
      requireAll={false}  // User needs at least ONE permission
      fallback={<p>You don't have permission to view project data.</p>}
    >
      <div className="project-dashboard">
        {/* Dashboard content */}
      </div>
    </PermissionGuard>
  );
}
```

---

## 📝 Example 8: Super Admin Only Section

**File**: User management or admin settings

```javascript
import { SuperAdminGuard } from '../components/PermissionGuard';

function SettingsPage() {
  return (
    <div className="settings-page">
      {/* Regular settings - everyone can see */}
      <section className="user-settings">
        <h2>Your Settings</h2>
        {/* ... user settings ... */}
      </section>

      {/* Admin settings - only super admins */}
      <SuperAdminGuard
        fallback={
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <p className="text-gray-600">
              Additional settings are available to administrators.
            </p>
          </div>
        }
      >
        <section className="admin-settings mt-6">
          <h2>Administrator Settings</h2>
          {/* ... admin settings ... */}
        </section>
      </SuperAdminGuard>
    </div>
  );
}
```

---

## 📝 Example 9: Using with Form Submission

**File**: Form that should only submit if user has permission

```javascript
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../constants/permissions';

function BugSubmitForm({ projectId }) {
  const { canManageBugs, loading } = usePermissions(projectId);
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Double-check permission before submitting
    if (!canManageBugs) {
      toast.error('You don\'t have permission to submit bugs');
      return;
    }

    // Submit the form
    await submitBug(formData);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        disabled={!canManageBugs}
      />

      <button
        type="submit"
        disabled={!canManageBugs}
        className={`px-4 py-2 rounded ${
          canManageBugs
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {canManageBugs ? 'Submit Bug' : 'No Permission'}
      </button>
    </form>
  );
}
```

---

## 📝 Example 10: Higher-Order Component Pattern

**File**: Wrapping multiple components with same permission

```javascript
import { withPermission } from '../components/PermissionGuard';
import { PERMISSIONS } from '../constants/permissions';

// Original components
function EditButton({ onClick }) {
  return <button onClick={onClick}>Edit</button>;
}

function DeleteButton({ onClick }) {
  return <button onClick={onClick}>Delete</button>;
}

// Wrap with permissions
const ProtectedEditButton = withPermission(EditButton, {
  permission: PERMISSIONS.CAN_EDIT,
  fallback: null
});

const ProtectedDeleteButton = withPermission(DeleteButton, {
  permission: PERMISSIONS.CAN_EDIT,
  fallback: null
});

// Usage
function ProjectActions({ projectId, onEdit, onDelete }) {
  return (
    <div className="project-actions">
      <ProtectedEditButton projectId={projectId} onClick={onEdit} />
      <ProtectedDeleteButton projectId={projectId} onClick={onDelete} />
    </div>
  );
}
```

---

## 🎯 Quick Copy-Paste Templates

### Template 1: Wrap Entire Component
```javascript
import PermissionGuard from '../components/PermissionGuard';
import { PERMISSIONS } from '../constants/permissions';

<PermissionGuard
  projectId={projectId}
  permission={PERMISSIONS.YOUR_PERMISSION}
  fallback={<div>No access</div>}
>
  {/* Your component */}
</PermissionGuard>
```

### Template 2: Conditional Render
```javascript
import { usePermissions } from '../hooks/usePermissions';

const { canEdit } = usePermissions(projectId);

{canEdit && <YourComponent />}
```

### Template 3: Disable Button
```javascript
import { usePermissions } from '../hooks/usePermissions';

const { canEdit } = usePermissions(projectId);

<button disabled={!canEdit} onClick={handleClick}>
  {canEdit ? 'Edit' : 'View Only'}
</button>
```

---

## ✅ Integration Checklist

For each component you want to protect:

1. [ ] Import `PermissionGuard` or `usePermissions`
2. [ ] Import `PERMISSIONS` constants
3. [ ] Wrap sensitive UI or add conditional logic
4. [ ] Add appropriate fallback content
5. [ ] Test with different user roles
6. [ ] Update component documentation

---

## 🎉 You're Ready!

Use these examples as templates for integrating permissions throughout your application. The patterns are consistent and easy to follow.

**Happy coding! 🚀**
