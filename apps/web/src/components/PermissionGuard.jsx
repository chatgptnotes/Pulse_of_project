// =====================================================
// PERMISSION GUARD COMPONENT
// =====================================================
// Component to conditionally render UI based on user permissions

import React from 'react';
import PropTypes from 'prop-types';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../contexts/AuthContext';

/**
 * PermissionGuard Component
 * Conditionally renders children based on user permissions
 *
 * @example
 * // Render only if user has specific permission
 * <PermissionGuard projectId="project-123" permission="can_edit">
 *   <EditButton />
 * </PermissionGuard>
 *
 * @example
 * // Render only if user has all required permissions
 * <PermissionGuard
 *   projectId="project-123"
 *   permissions={['can_edit', 'can_upload_documents']}
 *   requireAll={true}
 * >
 *   <AdvancedEditor />
 * </PermissionGuard>
 *
 * @example
 * // Render only if user has at least one permission
 * <PermissionGuard
 *   projectId="project-123"
 *   permissions={['can_edit', 'can_view_detailed_plan']}
 *   requireAll={false}
 * >
 *   <ViewButton />
 * </PermissionGuard>
 *
 * @example
 * // Show fallback when permission is denied
 * <PermissionGuard
 *   projectId="project-123"
 *   permission="can_edit"
 *   fallback={<p>You don't have permission to edit</p>}
 * >
 *   <EditForm />
 * </PermissionGuard>
 */
export const PermissionGuard = ({
  projectId,
  permission,
  permissions,
  requireAll = true,
  requireSuperAdmin = false,
  children,
  fallback = null,
  loading: customLoading = null,
}) => {
  const { user } = useAuth();
  const {
    hasPermission,
    hasPermissions,
    isSuperAdmin,
    loading,
  } = usePermissions(projectId);

  // Show loading state
  if (loading) {
    return customLoading;
  }

  // If no user, don't render
  if (!user) {
    return fallback;
  }

  // Check super admin requirement
  if (requireSuperAdmin && !isSuperAdmin()) {
    return fallback;
  }

  // Super admins bypass all permission checks
  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  // Check single permission
  if (permission && !permissions) {
    const hasAccess = hasPermission(permission);
    return hasAccess ? <>{children}</> : fallback;
  }

  // Check multiple permissions
  if (permissions && Array.isArray(permissions)) {
    const hasAccess = hasPermissions(permissions, requireAll);
    return hasAccess ? <>{children}</> : fallback;
  }

  // If no permission specified, render children
  return <>{children}</>;
};

PermissionGuard.propTypes = {
  projectId: PropTypes.string,
  permission: PropTypes.string,
  permissions: PropTypes.arrayOf(PropTypes.string),
  requireAll: PropTypes.bool,
  requireSuperAdmin: PropTypes.bool,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  loading: PropTypes.node,
};

/**
 * SuperAdminGuard Component
 * Only renders children if user is a super admin
 *
 * @example
 * <SuperAdminGuard>
 *   <AdminPanel />
 * </SuperAdminGuard>
 */
export const SuperAdminGuard = ({ children, fallback = null }) => {
  const { user } = useAuth();

  if (!user || user.role !== 'super_admin') {
    return fallback;
  }

  return <>{children}</>;
};

SuperAdminGuard.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
};

/**
 * Higher-order component for permission-based rendering
 * Wraps a component with permission checks
 *
 * @example
 * const ProtectedEditButton = withPermission(EditButton, {
 *   permission: 'can_edit'
 * });
 *
 * // Usage
 * <ProtectedEditButton projectId="project-123" />
 */
export const withPermission = (Component, config = {}) => {
  const {
    permission,
    permissions,
    requireAll = true,
    requireSuperAdmin = false,
    fallback = null,
  } = config;

  return function PermissionWrappedComponent(props) {
    return (
      <PermissionGuard
        projectId={props.projectId}
        permission={permission}
        permissions={permissions}
        requireAll={requireAll}
        requireSuperAdmin={requireSuperAdmin}
        fallback={fallback}
      >
        <Component {...props} />
      </PermissionGuard>
    );
  };
};

export default PermissionGuard;
