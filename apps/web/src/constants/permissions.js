// =====================================================
// PERMISSION CONSTANTS
// =====================================================
// Centralized permission definitions for the application

export const PERMISSIONS = {
  // Project editing permission
  CAN_EDIT: 'can_edit',

  // Module permissions
  VIEW_DETAILED_PLAN: 'can_view_detailed_plan',
  UPLOAD_DOCUMENTS: 'can_upload_documents',
  MANAGE_BUGS: 'can_manage_bugs',
  ACCESS_TESTING: 'can_access_testing',
  UPLOAD_PROJECT_DOCS: 'can_upload_project_docs',
  VIEW_METRICS: 'can_view_metrics',
  VIEW_TIMELINE: 'can_view_timeline',
};

// Permission labels for UI display
export const PERMISSION_LABELS = {
  [PERMISSIONS.CAN_EDIT]: 'Edit Project Data',
  [PERMISSIONS.VIEW_DETAILED_PLAN]: 'View Detailed Project Plan',
  [PERMISSIONS.UPLOAD_DOCUMENTS]: 'Upload Documents',
  [PERMISSIONS.MANAGE_BUGS]: 'Manage Bugs & Issues',
  [PERMISSIONS.ACCESS_TESTING]: 'Access Testing Tracker',
  [PERMISSIONS.UPLOAD_PROJECT_DOCS]: 'Upload Project Documents',
  [PERMISSIONS.VIEW_METRICS]: 'View Metrics',
  [PERMISSIONS.VIEW_TIMELINE]: 'View Timeline',
};

// Permission descriptions
export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.CAN_EDIT]: 'Allows editing of project data, milestones, and tasks',
  [PERMISSIONS.VIEW_DETAILED_PLAN]: 'Shows the "View Detailed Project Plan" button to edit milestones and tasks',
  [PERMISSIONS.UPLOAD_DOCUMENTS]: 'Allows uploading documents to the project',
  [PERMISSIONS.MANAGE_BUGS]: 'Allows creating, editing, and managing bugs and issues',
  [PERMISSIONS.ACCESS_TESTING]: 'Allows access to the testing tracker module',
  [PERMISSIONS.UPLOAD_PROJECT_DOCS]: 'Allows uploading project documentation files',
  [PERMISSIONS.VIEW_METRICS]: 'Allows viewing project metrics and analytics',
  [PERMISSIONS.VIEW_TIMELINE]: 'Allows viewing project timeline and history',
};

// Permission presets
export const PERMISSION_PRESETS = {
  VIEW_ONLY: {
    name: 'View Only',
    description: 'Can only view metrics and timeline',
    permissions: {
      [PERMISSIONS.CAN_EDIT]: false,
      [PERMISSIONS.VIEW_DETAILED_PLAN]: false,
      [PERMISSIONS.UPLOAD_DOCUMENTS]: false,
      [PERMISSIONS.MANAGE_BUGS]: false,
      [PERMISSIONS.ACCESS_TESTING]: false,
      [PERMISSIONS.UPLOAD_PROJECT_DOCS]: false,
      [PERMISSIONS.VIEW_METRICS]: true,
      [PERMISSIONS.VIEW_TIMELINE]: true,
    },
  },
  STANDARD_USER: {
    name: 'Standard User',
    description: 'Can upload documents, manage bugs, and access testing',
    permissions: {
      [PERMISSIONS.CAN_EDIT]: false,
      [PERMISSIONS.VIEW_DETAILED_PLAN]: false,
      [PERMISSIONS.UPLOAD_DOCUMENTS]: true,
      [PERMISSIONS.MANAGE_BUGS]: true,
      [PERMISSIONS.ACCESS_TESTING]: true,
      [PERMISSIONS.UPLOAD_PROJECT_DOCS]: true,
      [PERMISSIONS.VIEW_METRICS]: true,
      [PERMISSIONS.VIEW_TIMELINE]: true,
    },
  },
  FULL_ACCESS: {
    name: 'Full Access',
    description: 'Has access to all project features',
    permissions: {
      [PERMISSIONS.CAN_EDIT]: true,
      [PERMISSIONS.VIEW_DETAILED_PLAN]: true,
      [PERMISSIONS.UPLOAD_DOCUMENTS]: true,
      [PERMISSIONS.MANAGE_BUGS]: true,
      [PERMISSIONS.ACCESS_TESTING]: true,
      [PERMISSIONS.UPLOAD_PROJECT_DOCS]: true,
      [PERMISSIONS.VIEW_METRICS]: true,
      [PERMISSIONS.VIEW_TIMELINE]: true,
    },
  },
};

// All permission keys as an array
export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

// Default permissions for new users
export const DEFAULT_PERMISSIONS = PERMISSION_PRESETS.STANDARD_USER.permissions;
