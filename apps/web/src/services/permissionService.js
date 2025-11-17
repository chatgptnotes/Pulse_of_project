// =====================================================
// PERMISSION SERVICE
// =====================================================
// Service for managing user permissions and access control

import supabaseService from './supabaseService';
import { PERMISSIONS, PERMISSION_PRESETS } from '../constants/permissions';

class PermissionService {
  constructor() {
    this.supabase = supabaseService.supabase;
    this.permissionCache = new Map(); // Cache permissions for performance
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get user's permissions for a specific project
   * @param {string} userId - User ID
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} - Permission object
   */
  async getUserProjectPermissions(userId, projectId) {
    try {
      const cacheKey = `${userId}-${projectId}`;
      const cached = this.permissionCache.get(cacheKey);

      // Return cached permissions if valid
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log('📦 Returning cached permissions for', projectId);
        return cached.permissions;
      }

      console.log('🔍 Fetching permissions for user:', userId, 'project:', projectId);

      // Check if user is super admin
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user role:', userError);
        return this.getNoPermissions();
      }

      // Super admins have all permissions
      if (user?.role === 'super_admin') {
        console.log('👑 Super admin detected - granting all permissions');
        const allPermissions = this.getAllPermissions();
        this.cachePermissions(cacheKey, allPermissions);
        return allPermissions;
      }

      // Get specific project permissions
      const { data: projectPermissions, error: permError } = await this.supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .single();

      // If koi explicit row nahi mila, ya error "no rows", to VIEW_ONLY preset de do
      if (permError || !projectPermissions) {
        if (permError && permError.code !== 'PGRST116') {
          console.error('Error fetching project permissions:', permError);
        } else {
          console.log('ℹ️ No explicit permissions row for this user/project, falling back to VIEW_ONLY preset');
        }

        const viewOnly = PERMISSION_PRESETS.VIEW_ONLY.permissions;
        const permissions = {
          [PERMISSIONS.CAN_EDIT]: viewOnly[PERMISSIONS.CAN_EDIT],
          [PERMISSIONS.VIEW_DETAILED_PLAN]: viewOnly[PERMISSIONS.VIEW_DETAILED_PLAN],
          [PERMISSIONS.UPLOAD_DOCUMENTS]: viewOnly[PERMISSIONS.UPLOAD_DOCUMENTS],
          [PERMISSIONS.MANAGE_BUGS]: viewOnly[PERMISSIONS.MANAGE_BUGS],
          [PERMISSIONS.ACCESS_TESTING]: viewOnly[PERMISSIONS.ACCESS_TESTING],
          [PERMISSIONS.UPLOAD_PROJECT_DOCS]: viewOnly[PERMISSIONS.UPLOAD_PROJECT_DOCS],
          [PERMISSIONS.VIEW_METRICS]: viewOnly[PERMISSIONS.VIEW_METRICS],
          [PERMISSIONS.VIEW_TIMELINE]: viewOnly[PERMISSIONS.VIEW_TIMELINE],
        };

        this.cachePermissions(cacheKey, permissions);
        return permissions;
      }

      const permissions = {
        [PERMISSIONS.CAN_EDIT]: projectPermissions.can_edit || false,
        [PERMISSIONS.VIEW_DETAILED_PLAN]: projectPermissions.can_view_detailed_plan || false,
        [PERMISSIONS.UPLOAD_DOCUMENTS]: projectPermissions.can_upload_documents || false,
        [PERMISSIONS.MANAGE_BUGS]: projectPermissions.can_manage_bugs || false,
        [PERMISSIONS.ACCESS_TESTING]: projectPermissions.can_access_testing || false,
        [PERMISSIONS.UPLOAD_PROJECT_DOCS]: projectPermissions.can_upload_project_docs || false,
        [PERMISSIONS.VIEW_METRICS]: projectPermissions.can_view_metrics || false,
        [PERMISSIONS.VIEW_TIMELINE]: projectPermissions.can_view_timeline || false,
      };

      // Cache the permissions
      this.cachePermissions(cacheKey, permissions);

      console.log('✅ Permissions fetched successfully:', permissions);
      return permissions;
    } catch (error) {
      console.error('Error in getUserProjectPermissions:', error);
      return this.getNoPermissions();
    }
  }

  /**
   * Check if user has a specific permission for a project
   * @param {string} userId - User ID
   * @param {string} projectId - Project ID
   * @param {string} permission - Permission key from PERMISSIONS constant
   * @returns {Promise<boolean>}
   */
  async hasPermission(userId, projectId, permission) {
    try {
      const permissions = await this.getUserProjectPermissions(userId, projectId);
      return permissions[permission] === true;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user has multiple permissions
   * @param {string} userId - User ID
   * @param {string} projectId - Project ID
   * @param {Array<string>} requiredPermissions - Array of permission keys
   * @param {boolean} requireAll - If true, requires all permissions. If false, requires at least one
   * @returns {Promise<boolean>}
   */
  async hasPermissions(userId, projectId, requiredPermissions, requireAll = true) {
    try {
      const permissions = await this.getUserProjectPermissions(userId, projectId);

      if (requireAll) {
        // User must have ALL permissions
        return requiredPermissions.every(perm => permissions[perm] === true);
      } else {
        // User must have AT LEAST ONE permission
        return requiredPermissions.some(perm => permissions[perm] === true);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  /**
   * Check if user is super admin
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async isSuperAdmin(userId) {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking super admin status:', error);
        return false;
      }

      return user?.role === 'super_admin';
    } catch (error) {
      console.error('Error in isSuperAdmin:', error);
      return false;
    }
  }

  /**
   * Get all projects a user has access to
   * @param {string} userId - User ID
   * @returns {Promise<Array>}
   */
  async getUserAccessibleProjects(userId) {
    try {
      // Check if super admin
      const isSuperAdmin = await this.isSuperAdmin(userId);

      if (isSuperAdmin) {
        // Return all projects
        const { data: projects, error } = await this.supabase
          .from('admin_projects')
          .select('*')
          .order('priority', { ascending: false })
          .order('progress', { ascending: false });

        if (error) throw error;

        return projects.map(project => ({
          ...project,
          permissions: this.getAllPermissions(),
        }));
      }

      // Get user's assigned projects with permissions
      const { data: assignments, error } = await this.supabase
        .from('user_projects')
        .select(`
          *,
          admin_projects (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return assignments.map(assignment => ({
        ...assignment.admin_projects,
        permissions: {
          [PERMISSIONS.CAN_EDIT]: assignment.can_edit,
          [PERMISSIONS.VIEW_DETAILED_PLAN]: assignment.can_view_detailed_plan,
          [PERMISSIONS.UPLOAD_DOCUMENTS]: assignment.can_upload_documents,
          [PERMISSIONS.MANAGE_BUGS]: assignment.can_manage_bugs,
          [PERMISSIONS.ACCESS_TESTING]: assignment.can_access_testing,
          [PERMISSIONS.UPLOAD_PROJECT_DOCS]: assignment.can_upload_project_docs,
          [PERMISSIONS.VIEW_METRICS]: assignment.can_view_metrics,
          [PERMISSIONS.VIEW_TIMELINE]: assignment.can_view_timeline,
        },
      }));
    } catch (error) {
      console.error('Error fetching accessible projects:', error);
      return [];
    }
  }

  /**
   * Update user permissions for a project
   * @param {string} userId - User ID
   * @param {string} projectId - Project ID
   * @param {Object} permissions - Permissions object
   * @returns {Promise<boolean>}
   */
  async updateUserPermissions(userId, projectId, permissions) {
    try {
      const { error } = await this.supabase
        .from('user_projects')
        .update({
          can_edit: permissions[PERMISSIONS.CAN_EDIT],
          can_view_detailed_plan: permissions[PERMISSIONS.VIEW_DETAILED_PLAN],
          can_upload_documents: permissions[PERMISSIONS.UPLOAD_DOCUMENTS],
          can_manage_bugs: permissions[PERMISSIONS.MANAGE_BUGS],
          can_access_testing: permissions[PERMISSIONS.ACCESS_TESTING],
          can_upload_project_docs: permissions[PERMISSIONS.UPLOAD_PROJECT_DOCS],
          can_view_metrics: permissions[PERMISSIONS.VIEW_METRICS],
          can_view_timeline: permissions[PERMISSIONS.VIEW_TIMELINE],
        })
        .eq('user_id', userId)
        .eq('project_id', projectId);

      if (error) throw error;

      // Clear cache for this user-project combination
      this.clearCache(`${userId}-${projectId}`);

      console.log('✅ Permissions updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating permissions:', error);
      return false;
    }
  }

  /**
   * Apply a permission preset to a user-project
   * @param {string} userId - User ID
   * @param {string} projectId - Project ID
   * @param {string} preset - Preset name ('VIEW_ONLY', 'STANDARD_USER', 'FULL_ACCESS')
   * @returns {Promise<boolean>}
   */
  async applyPermissionPreset(userId, projectId, preset) {
    const presetConfig = PERMISSION_PRESETS[preset];
    if (!presetConfig) {
      console.error('Invalid preset:', preset);
      return false;
    }

    return this.updateUserPermissions(userId, projectId, presetConfig.permissions);
  }

  // Helper methods
  getAllPermissions() {
    return {
      [PERMISSIONS.CAN_EDIT]: true,
      [PERMISSIONS.VIEW_DETAILED_PLAN]: true,
      [PERMISSIONS.UPLOAD_DOCUMENTS]: true,
      [PERMISSIONS.MANAGE_BUGS]: true,
      [PERMISSIONS.ACCESS_TESTING]: true,
      [PERMISSIONS.UPLOAD_PROJECT_DOCS]: true,
      [PERMISSIONS.VIEW_METRICS]: true,
      [PERMISSIONS.VIEW_TIMELINE]: true,
    };
  }

  getNoPermissions() {
    return {
      [PERMISSIONS.CAN_EDIT]: false,
      [PERMISSIONS.VIEW_DETAILED_PLAN]: false,
      [PERMISSIONS.UPLOAD_DOCUMENTS]: false,
      [PERMISSIONS.MANAGE_BUGS]: false,
      [PERMISSIONS.ACCESS_TESTING]: false,
      [PERMISSIONS.UPLOAD_PROJECT_DOCS]: false,
      [PERMISSIONS.VIEW_METRICS]: false,
      [PERMISSIONS.VIEW_TIMELINE]: false,
    };
  }

  cachePermissions(key, permissions) {
    this.permissionCache.set(key, {
      permissions,
      timestamp: Date.now(),
    });
  }

  clearCache(key = null) {
    if (key) {
      this.permissionCache.delete(key);
    } else {
      this.permissionCache.clear();
    }
    console.log('🗑️ Permission cache cleared');
  }
}

// Export singleton instance
const permissionService = new PermissionService();
export default permissionService;
