// =====================================================
// USE PERMISSIONS HOOK
// =====================================================
// React hook for accessing and checking user permissions

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import permissionService from '../services/permissionService';
import { PERMISSIONS } from '../constants/permissions';

/**
 * Custom hook to manage user permissions for a project
 * @param {string} projectId - The project ID to check permissions for
 * @returns {Object} - Permissions object and utility functions
 */
export const usePermissions = (projectId) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch permissions when user or project changes
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user?.id || !projectId) {
        setPermissions(permissionService.getNoPermissions());
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const perms = await permissionService.getUserProjectPermissions(user.id, projectId);
        setPermissions(perms);
      } catch (err) {
        console.error('Error fetching permissions:', err);
        setError(err.message);
        setPermissions(permissionService.getNoPermissions());
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user?.id, projectId]);

  /**
   * Check if user has a specific permission
   * @param {string} permission - Permission key from PERMISSIONS constant
   * @returns {boolean}
   */
  const hasPermission = useCallback(
    (permission) => {
      if (!permissions) return false;
      return permissions[permission] === true;
    },
    [permissions]
  );

  /**
   * Check if user has multiple permissions
   * @param {Array<string>} requiredPermissions - Array of permission keys
   * @param {boolean} requireAll - If true, requires all permissions. If false, requires at least one
   * @returns {boolean}
   */
  const hasPermissions = useCallback(
    (requiredPermissions, requireAll = true) => {
      if (!permissions) return false;

      if (requireAll) {
        return requiredPermissions.every(perm => permissions[perm] === true);
      } else {
        return requiredPermissions.some(perm => permissions[perm] === true);
      }
    },
    [permissions]
  );

  /**
   * Check if user is super admin
   * @returns {boolean}
   */
  const isSuperAdmin = useCallback(() => {
    return user?.role === 'super_admin';
  }, [user?.role]);

  /**
   * Refresh permissions from the server
   */
  const refreshPermissions = useCallback(async () => {
    if (!user?.id || !projectId) return;

    try {
      setLoading(true);
      // Clear cache to force fresh fetch
      permissionService.clearCache(`${user.id}-${projectId}`);
      const perms = await permissionService.getUserProjectPermissions(user.id, projectId);
      setPermissions(perms);
    } catch (err) {
      console.error('Error refreshing permissions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, projectId]);

  return {
    // Permission state
    permissions,
    loading,
    error,

    // Permission checks
    hasPermission,
    hasPermissions,
    isSuperAdmin,

    // Individual permission checks (for convenience)
    canEdit: hasPermission(PERMISSIONS.CAN_EDIT),
    canViewDetailedPlan: hasPermission(PERMISSIONS.VIEW_DETAILED_PLAN),
    canUploadDocuments: hasPermission(PERMISSIONS.UPLOAD_DOCUMENTS),
    canManageBugs: hasPermission(PERMISSIONS.MANAGE_BUGS),
    canAccessTesting: hasPermission(PERMISSIONS.ACCESS_TESTING),
    canUploadProjectDocs: hasPermission(PERMISSIONS.UPLOAD_PROJECT_DOCS),
    canViewMetrics: hasPermission(PERMISSIONS.VIEW_METRICS),
    canViewTimeline: hasPermission(PERMISSIONS.VIEW_TIMELINE),

    // Utility functions
    refreshPermissions,
  };
};

/**
 * Hook to get all projects accessible to the current user
 * @returns {Object} - Accessible projects and loading state
 */
export const useAccessibleProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.id) {
        setProjects([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const accessibleProjects = await permissionService.getUserAccessibleProjects(user.id);
        setProjects(accessibleProjects);
      } catch (err) {
        console.error('Error fetching accessible projects:', err);
        setError(err.message);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user?.id]);

  const refreshProjects = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const accessibleProjects = await permissionService.getUserAccessibleProjects(user.id);
      setProjects(accessibleProjects);
    } catch (err) {
      console.error('Error refreshing projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return {
    projects,
    loading,
    error,
    refreshProjects,
  };
};

export default usePermissions;
