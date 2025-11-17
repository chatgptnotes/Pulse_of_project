import { createClient } from '@supabase/supabase-js';

// Dedicated Supabase instance for Bug Tracking System
// This is separate from the main Neuro360 medical database
// MUST be configured via environment variables
const bugTrackingUrl = import.meta.env.VITE_BUGTRACKING_SUPABASE_URL ||
                        import.meta.env.VITE_SUPABASE_URL;
const bugTrackingAnonKey = import.meta.env.VITE_BUGTRACKING_SUPABASE_ANON_KEY ||
                           import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that credentials are provided
if (!bugTrackingUrl || !bugTrackingAnonKey) {
  console.error('❌ BUG TRACKING SUPABASE CREDENTIALS MISSING!');
  console.error('Please set the following environment variables in your .env file:');
  console.error('  - VITE_BUGTRACKING_SUPABASE_URL (or VITE_SUPABASE_URL)');
  console.error('  - VITE_BUGTRACKING_SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY)');
  throw new Error('Bug tracking Supabase credentials not found in environment variables. Please check your .env file.');
}

// Initialize dedicated bug tracking Supabase client
const bugTrackingSupabase = createClient(bugTrackingUrl, bugTrackingAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'bug-tracking-auth',
  },
  global: {
    headers: {
      'x-application-name': 'bug-tracking-system',
      'Authorization': `Bearer ${bugTrackingAnonKey}`,
    },
  },
  db: {
    schema: 'public',
  },
});

class BugTrackingService {
  constructor() {
    this.supabase = bugTrackingSupabase;
    this.isAvailable = true;
    console.log('🐛 Bug Tracking Service initialized with dedicated database');
    this.testConnection();
  }

  async testConnection() {
    try {
      console.log('🔌 Testing Bug Tracking database connection...');

      // Test basic connection
      const { data, error } = await this.supabase
        .from('bug_reports')
        .select('id')
        .limit(1);

      if (error && error.code === 'PGRST106') {
        console.log('⚠️ Bug tracking tables not yet created - migration needed');
        return false;
      } else if (error) {
        console.error('❌ Bug tracking connection error:', error);
        return false;
      }

      console.log('✅ Bug tracking database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Bug tracking connection test failed:', error);
      return false;
    }
  }

  // ===== GENERIC CRUD OPERATIONS =====

  async get(table) {
    try {
      console.log(`📊 Fetching data from bug tracking table: ${table}`);
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`❌ Error fetching from ${table}:`, error);
        return [];
      }

      console.log(`✅ Fetched ${data?.length || 0} items from ${table}`);
      return data || [];
    } catch (error) {
      console.error(`❌ Error in get operation for ${table}:`, error);
      return [];
    }
  }

  async add(table, item) {
    try {
      console.log(`➕ Adding item to bug tracking table: ${table}`, item);

      // Remove any undefined fields
      const cleanedItem = Object.fromEntries(
        Object.entries(item).filter(([_, v]) => v !== undefined)
      );

      const { data, error } = await this.supabase
        .from(table)
        .insert(cleanedItem)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error adding to ${table}:`, error);
        throw error;
      }

      console.log(`✅ Successfully added to ${table}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Error in add operation for ${table}:`, error);
      throw error;
    }
  }

  async update(table, id, updates) {
    try {
      console.log(`📝 Updating item in bug tracking table: ${table}`, { id, updates });

      // Remove any undefined fields
      const cleanedUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );

      const { data, error } = await this.supabase
        .from(table)
        .update({
          ...cleanedUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error updating ${table}:`, error);
        throw error;
      }

      console.log(`✅ Successfully updated ${table}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Error in update operation for ${table}:`, error);
      throw error;
    }
  }

  async delete(table, id) {
    try {
      console.log(`🗑️ Deleting item from bug tracking table: ${table}`, { id });

      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`❌ Error deleting from ${table}:`, error);
        throw error;
      }

      console.log(`✅ Successfully deleted from ${table}`);
      return true;
    } catch (error) {
      console.error(`❌ Error in delete operation for ${table}:`, error);
      throw error;
    }
  }

  async findById(table, id) {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`❌ Error finding by ID in ${table}:`, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`❌ Error in findById for ${table}:`, error);
      return null;
    }
  }

  // ===== BUG REPORTS METHODS =====

  async createBugReport(bugData) {
    try {
      console.log('🚀 DATABASE MODE ENABLED - Creating bug report for project:', bugData.project_name);

      // Get next serial number using database function
      const { data: nextSnoData, error: snoError } = await this.supabase
        .rpc('get_next_bug_sno', { project_name: bugData.project_name });

      if (snoError) {
        console.warn('⚠️ Database function error, using fallback:', snoError.message);

        // Fallback: Get max SNO manually and add 1
        const { data: existingBugs, error: fallbackError } = await this.supabase
          .from('bug_reports')
          .select('sno')
          .eq('project_name', bugData.project_name)
          .order('sno', { ascending: false })
          .limit(1);

        if (fallbackError) {
          console.error('❌ Fallback query failed:', fallbackError);
          throw fallbackError;
        }

        const nextSno = existingBugs && existingBugs.length > 0 ? existingBugs[0].sno + 1 : 1;
        console.log('✅ Generated SNO using fallback method:', nextSno);

        const bugReport = {
          ...bugData,
          sno: nextSno,
          type: bugData.type || 'bug', // bug, suggestion, enhancement, announcement, feature_request
          date: bugData.date || new Date().toISOString().split('T')[0],
          status: bugData.status || 'Open',
          testing_status: bugData.testing_status || 'Pending',
          reported_by: bugData.reported_by || null,
          assigned_to: bugData.assigned_to || null,
          created_at: new Date().toISOString()
        };

        return await this.add('bug_reports', bugReport);
      } else {
        const nextSno = nextSnoData || 1;
        console.log('✅ Generated SNO using database function:', nextSno);

        const bugReport = {
          ...bugData,
          sno: nextSno,
          type: bugData.type || 'bug', // bug, suggestion, enhancement, announcement, feature_request
          date: bugData.date || new Date().toISOString().split('T')[0],
          status: bugData.status || 'Open',
          testing_status: bugData.testing_status || 'Pending',
          reported_by: bugData.reported_by || null,
          assigned_to: bugData.assigned_to || null,
          created_at: new Date().toISOString()
        };

        return await this.add('bug_reports', bugReport);
      }
    } catch (error) {
      console.error('❌ Error creating bug report:', error);
      throw error;
    }
  }

  async getBugReports(projectName = null) {
    try {
      console.log('🚀 DATABASE MODE - Getting bug reports for project:', projectName);

      let query = this.supabase
        .from('bug_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectName) {
        query = query.eq('project_name', projectName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching bug reports:', error);
        return [];
      }

      console.log(`✅ Found ${data?.length || 0} bug reports in database`);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getBugReports:', error);
      return [];
    }
  }

  async getBugReportById(id) {
    return await this.findById('bug_reports', id);
  }

  async updateBugReport(id, updates) {
    return await this.update('bug_reports', id, updates);
  }

  async deleteBugReport(id) {
    return await this.delete('bug_reports', id);
  }

  async getBugReportsByStatus(status, projectName = null) {
    try {
      let query = this.supabase
        .from('bug_reports')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (projectName) {
        query = query.eq('project_name', projectName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching bug reports by status:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getBugReportsByStatus:', error);
      return [];
    }
  }

  // Get issues by type (bug, suggestion, enhancement, announcement, feature_request)
  async getIssuesByType(type, projectName = null) {
    try {
      let query = this.supabase
        .from('bug_reports')
        .select(`
          *,
          reporter:team_members!bug_reports_reported_by_fkey(id, name, email, role, team_type),
          assignee:team_members!bug_reports_assigned_to_fkey(id, name, email, role, team_type)
        `)
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (projectName) {
        query = query.eq('project_name', projectName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching issues by type:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getIssuesByType:', error);
      return [];
    }
  }

  // Get issues with team member information
  async getIssuesWithTeamMembers(projectName = null) {
    try {
      let query = this.supabase
        .from('bug_reports')
        .select(`
          *,
          reporter:team_members!bug_reports_reported_by_fkey(id, name, email, role, team_type),
          assignee:team_members!bug_reports_assigned_to_fkey(id, name, email, role, team_type)
        `)
        .order('created_at', { ascending: false });

      if (projectName) {
        query = query.eq('project_name', projectName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching issues with team members:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getIssuesWithTeamMembers:', error);
      return [];
    }
  }

  async getBugReportsBySeverity(severity, projectName = null) {
    try {
      let query = this.supabase
        .from('bug_reports')
        .select('*')
        .eq('severity', severity)
        .order('created_at', { ascending: false });

      if (projectName) {
        query = query.eq('project_name', projectName);
      }

      const { data, error} = await query;

      if (error) {
        console.error('❌ Error fetching bug reports by severity:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getBugReportsBySeverity:', error);
      return [];
    }
  }

  // ===== TESTING TRACKER METHODS =====

  async createTestRecord(testData) {
    // Clean up the test data - remove empty strings and undefined values
    const cleanedData = { ...testData };

    // If bug_report_id is empty string or undefined, remove it (allow NULL in DB)
    if (!cleanedData.bug_report_id || cleanedData.bug_report_id === '') {
      delete cleanedData.bug_report_id;
    }

    const testRecord = {
      ...cleanedData,
      test_date: cleanedData.test_date || new Date().toISOString().split('T')[0],
      test_status: cleanedData.test_status || 'Pending',
      created_at: new Date().toISOString()
    };

    return await this.add('testing_tracker', testRecord);
  }

  async getTestRecords(bugReportId = null, projectName = null) {
    try {
      let query = this.supabase
        .from('testing_tracker')
        .select('*')
        .order('created_at', { ascending: false });

      if (bugReportId) {
        query = query.eq('bug_report_id', bugReportId);
      }

      if (projectName) {
        query = query.eq('project_name', projectName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching test records:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getTestRecords:', error);
      return [];
    }
  }

  async updateTestRecord(id, updates) {
    return await this.update('testing_tracker', id, updates);
  }

  async deleteTestRecord(id) {
    return await this.delete('testing_tracker', id);
  }

  async getTestingSummary(bugReportId) {
    try {
      const { data, error } = await this.supabase
        .rpc('get_testing_summary', { bug_id: bugReportId });

      if (error) {
        console.error('❌ Error fetching testing summary:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('❌ Error in getTestingSummary:', error);
      return null;
    }
  }

  // ===== PROJECT IMAGES METHODS =====

  async uploadBugImage(bugReportId, projectName, file, uploadedBy) {
    try {
      // Generate file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${projectName.toLowerCase()}/${bugReportId}/${new Date().getFullYear()}/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('bug-report-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Error uploading file:', uploadError);
        throw uploadError;
      }

      // Create database record
      const { data: imageData, error: imageError } = await this.supabase
        .rpc('handle_bug_image_upload', {
          p_bug_report_id: bugReportId,
          p_project_name: projectName,
          p_file_name: fileName,
          p_file_size: file.size,
          p_content_type: file.type,
          p_uploaded_by: uploadedBy
        });

      if (imageError) {
        console.error('❌ Error creating image record:', imageError);
        throw imageError;
      }

      return imageData;
    } catch (error) {
      console.error('❌ Error in uploadBugImage:', error);
      throw error;
    }
  }

  async getBugImages(bugReportId) {
    try {
      const { data, error } = await this.supabase
        .rpc('get_bug_images', { bug_id: bugReportId });

      if (error) {
        console.error('❌ Error fetching bug images:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getBugImages:', error);
      return [];
    }
  }

  async deleteImage(imageId) {
    try {
      // Get image details first
      const image = await this.findById('project_images', imageId);
      if (!image) {
        console.error('❌ Image not found');
        return false;
      }

      // Delete from storage
      const { error: storageError } = await this.supabase.storage
        .from('bug-report-images')
        .remove([image.file_path]);

      if (storageError) {
        console.error('❌ Error deleting from storage:', storageError);
      }

      // Delete from database
      return await this.delete('project_images', imageId);
    } catch (error) {
      console.error('❌ Error in deleteImage:', error);
      return false;
    }
  }

  // ===== NFC PROJECTS METHODS =====

  async createNFCProject(projectData) {
    try {
      const nfcProject = {
        ...projectData,
        project_status: projectData.project_status || 'Draft',
        project_priority: projectData.project_priority || 'Medium',
        tag_quantity: projectData.tag_quantity || 1,
        nfc_payload: projectData.nfc_payload || {},
        created_at: new Date().toISOString()
      };

      console.log('➕ Creating NFC project:', nfcProject);
      return await this.add('linklist_nfc_projects', nfcProject);
    } catch (error) {
      console.error('❌ Error creating NFC project:', error);
      throw error;
    }
  }

  async getNFCProjects(filters = {}) {
    try {
      let query = this.supabase
        .from('linklist_nfc_projects')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('project_status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('project_priority', filters.priority);
      }
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters.client_name) {
        query = query.eq('client_name', filters.client_name);
      }
      if (filters.created_by) {
        query = query.eq('created_by', filters.created_by);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching NFC projects:', error);
        return [];
      }

      console.log(`✅ Fetched ${data?.length || 0} NFC projects`);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getNFCProjects:', error);
      return [];
    }
  }

  async getNFCProjectById(id) {
    return await this.findById('linklist_nfc_projects', id);
  }

  async updateNFCProject(id, updates) {
    return await this.update('linklist_nfc_projects', id, updates);
  }

  async deleteNFCProject(id) {
    return await this.delete('linklist_nfc_projects', id);
  }

  // ===== ANALYTICS AND STATISTICS METHODS =====

  async getBugStatistics(projectName = null) {
    try {
      let query = this.supabase.from('bug_reports').select('status, severity');

      if (projectName) {
        query = query.eq('project_name', projectName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching bug statistics:', error);
        return null;
      }

      const stats = {
        totalBugs: data.length,
        openBugs: data.filter(b => b.status === 'Open').length,
        inProgressBugs: data.filter(b => b.status === 'In Progress').length,
        closedBugs: data.filter(b => b.status === 'Closed').length,
        severityBreakdown: {
          P1: data.filter(b => b.severity === 'P1').length,
          P2: data.filter(b => b.severity === 'P2').length,
          P3: data.filter(b => b.severity === 'P3').length
        },
        statusBreakdown: data.reduce((acc, bug) => {
          acc[bug.status] = (acc[bug.status] || 0) + 1;
          return acc;
        }, {})
      };

      return stats;
    } catch (error) {
      console.error('❌ Error in getBugStatistics:', error);
      return null;
    }
  }

  async getStorageStatistics() {
    try {
      const { data, error } = await this.supabase
        .rpc('get_storage_stats');

      if (error) {
        console.error('❌ Error fetching storage statistics:', error);
        return null;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getStorageStatistics:', error);
      return null;
    }
  }

  async getNFCProjectStatistics() {
    try {
      const { data, error } = await this.supabase
        .rpc('get_nfc_project_stats');

      if (error) {
        console.error('❌ Error fetching NFC project statistics:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('❌ Error in getNFCProjectStatistics:', error);
      return null;
    }
  }
}

export default new BugTrackingService();