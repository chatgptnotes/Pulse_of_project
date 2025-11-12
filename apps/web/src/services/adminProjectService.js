import supabaseService from './supabaseService';

/**
 * Admin Project Service
 * Handles all CRUD operations for admin_projects table in Supabase
 */
class AdminProjectService {
  constructor() {
    this.tableName = 'admin_projects';
    console.log('📁 AdminProjectService initialized');
  }

  /**
   * Get all projects from database
   * @returns {Promise<Array>} List of all projects
   */
  async getAllProjects() {
    try {
      console.log('📊 Fetching all projects from database...');

      const { data, error } = await supabaseService.supabase
        .from(this.tableName)
        .select('*')
        .order('priority', { ascending: true })
        .order('progress', { ascending: false });

      if (error) {
        console.error('❌ Error fetching projects:', error);
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} projects from database`);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getAllProjects:', error);
      return [];
    }
  }

  /**
   * Get a single project by ID
   * @param {string} projectId - Project ID
   * @returns {Promise<Object|null>} Project data or null
   */
  async getProjectById(projectId) {
    try {
      const { data, error } = await supabaseService.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('❌ Error fetching project:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Error in getProjectById:', error);
      return null;
    }
  }

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @returns {Promise<Object|null>} Created project or null
   */
  async createProject(projectData) {
    try {
      console.log('➕ Creating new project:', projectData.name);

      // Generate share token if not provided
      if (!projectData.share_token) {
        projectData.share_token = this.generateShareToken();
      }

      // Ensure is_custom is set
      projectData.is_custom = projectData.is_custom !== undefined ? projectData.is_custom : true;

      const { data, error } = await supabaseService.supabase
        .from(this.tableName)
        .insert([projectData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating project:', error);
        throw error;
      }

      console.log('✅ Project created successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Error in createProject:', error);
      throw error;
    }
  }

  /**
   * Update an existing project
   * @param {string} projectId - Project ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated project or null
   */
  async updateProject(projectId, updates) {
    try {
      console.log('📝 Updating project:', projectId);

      // Remove id from updates to prevent primary key modification
      const { id, ...updateData } = updates;

      const { data, error } = await supabaseService.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating project:', error);
        throw error;
      }

      console.log('✅ Project updated successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Error in updateProject:', error);
      throw error;
    }
  }

  /**
   * Delete a project
   * @param {string} projectId - Project ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteProject(projectId) {
    try {
      console.log('🗑️ Deleting project:', projectId);

      const { error } = await supabaseService.supabase
        .from(this.tableName)
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('❌ Error deleting project:', error);
        throw error;
      }

      console.log('✅ Project deleted successfully:', projectId);
      return true;
    } catch (error) {
      console.error('❌ Error in deleteProject:', error);
      return false;
    }
  }

  /**
   * Toggle project starred status
   * @param {string} projectId - Project ID
   * @param {boolean} starred - New starred status
   * @returns {Promise<Object|null>} Updated project or null
   */
  async toggleStarred(projectId, starred) {
    try {
      return await this.updateProject(projectId, { starred });
    } catch (error) {
      console.error('❌ Error toggling starred status:', error);
      return null;
    }
  }

  /**
   * Update project progress
   * @param {string} projectId - Project ID
   * @param {number} progress - Progress percentage (0-100)
   * @returns {Promise<Object|null>} Updated project or null
   */
  async updateProgress(projectId, progress) {
    try {
      if (progress < 0 || progress > 100) {
        throw new Error('Progress must be between 0 and 100');
      }
      return await this.updateProject(projectId, { progress });
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      return null;
    }
  }

  /**
   * Get projects by status
   * @param {string} status - Project status (active, planning, completed, on-hold)
   * @returns {Promise<Array>} List of projects with given status
   */
  async getProjectsByStatus(status) {
    try {
      const { data, error } = await supabaseService.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', status)
        .order('priority', { ascending: true })
        .order('progress', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching projects by status:', error);
      return [];
    }
  }

  /**
   * Get projects by priority
   * @param {number} priority - Priority level (1-4)
   * @returns {Promise<Array>} List of projects with given priority
   */
  async getProjectsByPriority(priority) {
    try {
      const { data, error } = await supabaseService.supabase
        .from(this.tableName)
        .select('*')
        .eq('priority', priority)
        .order('progress', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching projects by priority:', error);
      return [];
    }
  }

  /**
   * Get starred projects
   * @returns {Promise<Array>} List of starred projects
   */
  async getStarredProjects() {
    try {
      const { data, error } = await supabaseService.supabase
        .from(this.tableName)
        .select('*')
        .eq('starred', true)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching starred projects:', error);
      return [];
    }
  }

  /**
   * Search projects
   * @param {string} query - Search query
   * @returns {Promise<Array>} List of matching projects
   */
  async searchProjects(query) {
    try {
      if (!query || query.trim() === '') {
        return await this.getAllProjects();
      }

      const searchTerm = `%${query}%`;

      const { data, error } = await supabaseService.supabase
        .from(this.tableName)
        .select('*')
        .or(`name.ilike.${searchTerm},client.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error searching projects:', error);
      return [];
    }
  }

  /**
   * Generate unique share token
   * @returns {string} Unique share token
   */
  generateShareToken() {
    return 'share-' + Math.random().toString(36).substr(2, 11);
  }

  /**
   * Get project statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    try {
      const allProjects = await this.getAllProjects();

      const stats = {
        total: allProjects.length,
        active: allProjects.filter(p => p.status === 'active').length,
        planning: allProjects.filter(p => p.status === 'planning').length,
        completed: allProjects.filter(p => p.status === 'completed').length,
        onHold: allProjects.filter(p => p.status === 'on-hold').length,
        starred: allProjects.filter(p => p.starred).length,
        byPriority: {
          1: allProjects.filter(p => p.priority === 1).length,
          2: allProjects.filter(p => p.priority === 2).length,
          3: allProjects.filter(p => p.priority === 3).length,
          4: allProjects.filter(p => p.priority === 4).length,
        },
        averageProgress: allProjects.length > 0
          ? Math.round(allProjects.reduce((sum, p) => sum + p.progress, 0) / allProjects.length)
          : 0
      };

      return stats;
    } catch (error) {
      console.error('❌ Error getting statistics:', error);
      return {
        total: 0,
        active: 0,
        planning: 0,
        completed: 0,
        onHold: 0,
        starred: 0,
        byPriority: { 1: 0, 2: 0, 3: 0, 4: 0 },
        averageProgress: 0
      };
    }
  }
}

// Export singleton instance
export default new AdminProjectService();
