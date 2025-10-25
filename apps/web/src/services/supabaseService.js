import { createClient } from '@supabase/supabase-js';

// Get Supabase environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Check if we have valid Supabase configuration
const hasValidSupabaseConfig = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' &&
                               supabaseAnonKey && supabaseAnonKey !== 'placeholder-anon-key';

// Initialize Supabase client only if we have valid config
let supabase = null;

if (hasValidSupabaseConfig) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'neuro360-auth',
    },
    global: {
      headers: {
        'x-application-name': 'neuro360-web',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    },
    db: {
      schema: 'public',
    },
  });
}

class SupabaseService {
  constructor() {
    this.supabase = supabase;
    this.hasValidConfig = hasValidSupabaseConfig;

    if (!this.hasValidConfig) {
      console.warn('⚠️ Supabase is not configured. Running in demo mode.');
      console.warn('To enable Supabase, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    } else {
      this.testConnection();
      this.initializeTables();
    }
  }

  // Check if Supabase is available
  isAvailable() {
    return this.hasValidConfig && this.supabase !== null;
  }

  async testConnection() {
    if (!this.isAvailable()) return;

    try {
      console.log('🔌 Testing Supabase connection...');
      console.log('🔗 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔑 Anon Key (first 20 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

      // Test basic connection
      const { data, error } = await this.supabase
        .from('_supabase_metadata')
        .select('*')
        .limit(1);

      if (error) {
        console.log('⚠️ Metadata table test failed (expected):', error.message);
      } else {
        console.log('✅ Supabase connection test successful');
      }
    } catch (error) {
      console.error('❌ Supabase connection test failed:', error);
    }
  }

  async ensureTableExists(tableName) {
    if (!this.isAvailable()) return false;

    try {
      // Quick check if table exists
      const { error } = await this.supabase.from(tableName).select('id').limit(0);
      if (!error) {
        return true; // Table exists
      }

      if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
        console.log(`🔧 Table ${tableName} doesn't exist, creating...`);
        await this.createTable(tableName);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`❌ Error checking table ${tableName}:`, error);
      return false;
    }
  }

  async createTable(tableName) {
    const schemas = {
      clinics: `
        CREATE TABLE clinics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(20),
          address TEXT,
          logo_url TEXT,
          is_active BOOLEAN DEFAULT true,
          reports_used INTEGER DEFAULT 0,
          reports_allowed INTEGER DEFAULT 10,
          subscription_status VARCHAR(50) DEFAULT 'trial',
          subscription_tier VARCHAR(50) DEFAULT 'free',
          trial_start_date TIMESTAMPTZ DEFAULT NOW(),
          trial_end_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all" ON clinics FOR ALL USING (true);
      `,
      patients: `
        CREATE TABLE patients (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clinic_id UUID,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(20),
          date_of_birth DATE,
          gender VARCHAR(20),
          medical_history JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all" ON patients FOR ALL USING (true);
      `,
      reports: `
        CREATE TABLE reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clinic_id UUID,
          patient_id UUID,
          file_name VARCHAR(255),
          file_path TEXT,
          report_data JSONB DEFAULT '{}',
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all" ON reports FOR ALL USING (true);
      `,
      bug_reports: `
        CREATE TABLE bug_reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_name VARCHAR(100) NOT NULL CHECK (project_name IN ('LinkList', 'Neuro360')),
          project_version VARCHAR(50),
          sno INTEGER NOT NULL,
          date DATE NOT NULL DEFAULT CURRENT_DATE,
          module VARCHAR(255) NOT NULL,
          screen VARCHAR(255) NOT NULL,
          snag TEXT NOT NULL,
          severity VARCHAR(10) NOT NULL CHECK (severity IN ('P1', 'P2', 'P3')),
          image_url TEXT,
          comments TEXT,
          status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Testing', 'Verified', 'Closed', 'Reopened')),
          testing_status VARCHAR(20) DEFAULT 'Pending' CHECK (testing_status IN ('Pending', 'Pass', 'Fail', 'Blocked')),
          assigned_to VARCHAR(255),
          reported_by VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT unique_project_sno UNIQUE (project_name, sno)
        );
        ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all" ON bug_reports FOR ALL USING (true);
      `,
      testing_tracker: `
        CREATE TABLE testing_tracker (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          bug_report_id UUID NOT NULL REFERENCES bug_reports(id) ON DELETE CASCADE,
          project_name VARCHAR(100) NOT NULL CHECK (project_name IN ('LinkList', 'Neuro360')),
          test_case_name VARCHAR(255) NOT NULL,
          test_description TEXT,
          expected_result TEXT,
          actual_result TEXT,
          test_status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (test_status IN ('Pass', 'Fail', 'Blocked', 'Pending')),
          tester_name VARCHAR(255) NOT NULL,
          test_date DATE NOT NULL DEFAULT CURRENT_DATE,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE testing_tracker ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all" ON testing_tracker FOR ALL USING (true);
      `,
      project_images: `
        CREATE TABLE project_images (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          bug_report_id UUID NOT NULL REFERENCES bug_reports(id) ON DELETE CASCADE,
          project_name VARCHAR(100) NOT NULL CHECK (project_name IN ('LinkList', 'Neuro360')),
          file_name VARCHAR(255) NOT NULL,
          file_path TEXT NOT NULL,
          file_size INTEGER,
          content_type VARCHAR(100),
          uploaded_by VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT unique_file_path UNIQUE (file_path)
        );
        ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all" ON project_images FOR ALL USING (true);
      `,
      linklist_nfc_projects: `
        CREATE TABLE linklist_nfc_projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_name VARCHAR(255) NOT NULL,
          project_description TEXT,
          nfc_tag_type VARCHAR(50) CHECK (nfc_tag_type IN ('NTAG213', 'NTAG215', 'NTAG216', 'NTAG424', 'Mifare Classic', 'Other')),
          nfc_data_format VARCHAR(50) CHECK (nfc_data_format IN ('URL', 'vCard', 'Text', 'WiFi', 'Email', 'SMS', 'Phone', 'Application', 'Custom')),
          nfc_payload JSONB DEFAULT '{}',
          project_status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (project_status IN ('Draft', 'Active', 'Inactive', 'Deployed', 'Completed', 'Cancelled')),
          project_priority VARCHAR(10) DEFAULT 'Medium' CHECK (project_priority IN ('Low', 'Medium', 'High', 'Critical')),
          created_by VARCHAR(255) NOT NULL,
          assigned_to VARCHAR(255),
          client_name VARCHAR(255),
          deployment_location VARCHAR(255),
          tag_quantity INTEGER DEFAULT 1 CHECK (tag_quantity > 0),
          estimated_completion_date DATE,
          actual_completion_date DATE,
          project_budget DECIMAL(10,2),
          project_cost DECIMAL(10,2),
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX idx_linklist_nfc_projects_status ON linklist_nfc_projects(project_status);
        CREATE INDEX idx_linklist_nfc_projects_priority ON linklist_nfc_projects(project_priority);
        CREATE INDEX idx_linklist_nfc_projects_created_by ON linklist_nfc_projects(created_by);
        CREATE INDEX idx_linklist_nfc_projects_assigned_to ON linklist_nfc_projects(assigned_to);
        CREATE INDEX idx_linklist_nfc_projects_client ON linklist_nfc_projects(client_name);
        CREATE INDEX idx_linklist_nfc_projects_created_at ON linklist_nfc_projects(created_at);

        ALTER TABLE linklist_nfc_projects ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all" ON linklist_nfc_projects FOR ALL USING (true);

        CREATE OR REPLACE FUNCTION update_linklist_nfc_projects_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER trigger_update_linklist_nfc_projects_updated_at
            BEFORE UPDATE ON linklist_nfc_projects
            FOR EACH ROW
            EXECUTE FUNCTION update_linklist_nfc_projects_updated_at();
      `
    };

    const schema = schemas[tableName];
    if (!schema) {
      console.log(`⚠️ No schema defined for table: ${tableName}`);
      return;
    }

    try {
      console.log(`🔧 Creating table: ${tableName}`);
      // Note: This won't work with standard Supabase client, but we'll log the schema
      console.log(`📝 SQL Schema for ${tableName}:`, schema);
      console.log(`⚠️ Please run this SQL in Supabase Dashboard > SQL Editor`);
    } catch (error) {
      console.error(`❌ Failed to create table ${tableName}:`, error);
    }
  }

  async initializeTables() {
    if (!this.isAvailable()) return;

    try {
      console.log('🚀 Initializing Supabase tables...');

      // Check existing tables from our schema, including new bug tracking tables and NFC projects
      const existingTables = [
        'clinics', 'patients', 'profiles', 'organizations', 'org_memberships',
        'eeg_reports', 'subscriptions', 'bug_reports', 'testing_tracker', 'project_images',
        'linklist_nfc_projects'
      ];

      for (const table of existingTables) {
        try {
          const { data, error } = await this.supabase.from(table).select('id').limit(1);
          if (error) {
            console.log(`⚠️ Table ${table} error:`, error.code, error.message);
          } else {
            console.log(`✅ Table ${table} is accessible - found ${data?.length || 0} records`);
          }
        } catch (tableError) {
          console.log(`⚠️ Table ${table} check failed:`, tableError.message);
        }
      }
    } catch (error) {
      console.error('❌ Error initializing Supabase tables:', error);
    }
  }

  // Generic CRUD operations with demo fallback
  async get(table) {
    if (!this.isAvailable()) return [];

    try {
      console.log(`📊 Fetching data from Supabase table: ${table}`);
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
    if (!this.isAvailable()) {
      console.warn('⚠️ Supabase not available, returning demo data');
      return { ...item, id: 'demo-' + Date.now() };
    }

    try {
      console.log(`➕ Adding item to Supabase table: ${table}`, item);

      // Remove any undefined fields
      const cleanedItem = Object.fromEntries(
        Object.entries(item).filter(([_, v]) => v !== undefined)
      );

      console.log(`🔧 Cleaned item for ${table}:`, cleanedItem);

      // First try to create table if it doesn't exist
      await this.ensureTableExists(table);

      const { data, error } = await this.supabase
        .from(table)
        .insert(cleanedItem)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error adding to ${table}:`, error);
        console.error(`❌ Error code:`, error.code);
        console.error(`❌ Error message:`, error.message);
        console.error(`❌ Error details:`, error.details);
        console.error(`❌ Error hint:`, error.hint);

        // If table doesn't exist, try to create it
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          console.log(`🔧 Attempting to create table: ${table}`);
          await this.createTable(table);
          // Retry the insert
          const { data: retryData, error: retryError } = await this.supabase
            .from(table)
            .insert(cleanedItem)
            .select()
            .single();

          if (retryError) {
            throw retryError;
          }

          console.log(`✅ Successfully added to ${table} after creating table:`, retryData);
          return retryData;
        }

        throw error;
      }

      console.log(`✅ Successfully added to ${table}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Error in add operation for ${table}:`, error);
      console.error(`❌ Full error object:`, JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async update(table, id, updates) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Supabase not available, returning demo data');
      return { id, ...updates };
    }

    try {
      console.log(`📝 Updating item in Supabase table: ${table}`, { id, updates });

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
    if (!this.isAvailable()) {
      console.warn('⚠️ Supabase not available, simulating delete');
      return true;
    }

    try {
      console.log(`🗑️ Deleting item from Supabase table: ${table}`, { id });

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
    if (!this.isAvailable()) return null;

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

  async findBy(table, field, value) {
    if (!this.isAvailable()) return [];

    try {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .eq(field, value);

      if (error) {
        console.error(`❌ Error finding by ${field} in ${table}:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error(`❌ Error in findBy for ${table}:`, error);
      return [];
    }
  }

  async findOne(table, field, value) {
    if (!this.isAvailable()) return null;

    try {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .eq(field, value)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error(`❌ Error finding one by ${field} in ${table}:`, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`❌ Error in findOne for ${table}:`, error);
      return null;
    }
  }

  // Clinic specific methods
  async createClinic(clinicData) {
    const clinic = {
      ...clinicData,
      is_active: true,
      reports_used: 0,
      reports_allowed: 10, // Default trial: 10 reports
      subscription_status: 'trial',
      trial_start_date: new Date().toISOString(),
      trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
      created_at: new Date().toISOString()
    };

    return await this.add('clinics', clinic);
  }

  async getClinicUsage(clinicId) {
    if (!this.isAvailable()) {
      return {
        totalReports: 0,
        reportsThisMonth: 0,
        usage: []
      };
    }

    const usage = await this.findBy('usage', 'clinic_id', clinicId);
    const reports = await this.findBy('reports', 'clinic_id', clinicId);

    return {
      totalReports: reports.length,
      reportsThisMonth: reports.filter(r => {
        const reportDate = new Date(r.created_at);
        const now = new Date();
        return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
      }).length,
      usage: usage
    };
  }

  // Patient specific methods
  async getPatientsByClinic(clinicId) {
    return await this.findBy('patients', 'clinic_id', clinicId);
  }

  // Reports specific methods
  async getReportsByClinic(clinicId) {
    return await this.findBy('reports', 'clinic_id', clinicId);
  }

  async getReportsByPatient(patientId) {
    return await this.findBy('reports', 'patient_id', patientId);
  }

  async addReport(reportData) {
    const report = await this.add('reports', {
      ...reportData,
      created_at: new Date().toISOString()
    });

    // Update clinic usage
    const clinic = await this.findById('clinics', reportData.clinic_id);
    if (clinic) {
      await this.update('clinics', clinic.id, {
        reports_used: (clinic.reports_used || 0) + 1
      });
    }

    // Track usage
    await this.add('usage', {
      clinic_id: reportData.clinic_id,
      patient_id: reportData.patient_id,
      report_id: report.id,
      action: 'report_created',
      timestamp: new Date().toISOString()
    });

    return report;
  }

  // Subscription methods
  async updateSubscription(clinicId, subscriptionData) {
    if (!this.isAvailable()) {
      return { ...subscriptionData, clinic_id: clinicId, id: 'demo-sub-' + Date.now() };
    }

    let subscription = await this.findOne('subscriptions', 'clinic_id', clinicId);

    if (subscription) {
      subscription = await this.update('subscriptions', subscription.id, subscriptionData);
    } else {
      subscription = await this.add('subscriptions', {
        ...subscriptionData,
        clinic_id: clinicId,
        created_at: new Date().toISOString()
      });
    }

    // Update clinic's report allowance
    if (subscriptionData.reports_allowed) {
      const clinic = await this.findById('clinics', clinicId);
      if (clinic) {
        await this.update('clinics', clinicId, {
          reports_allowed: clinic.reports_allowed + subscriptionData.reports_allowed,
          subscription_status: 'active'
        });
      }
    }

    return subscription;
  }

  async getSubscription(clinicId) {
    return await this.findOne('subscriptions', 'clinic_id', clinicId);
  }

  // Analytics methods
  async getAnalytics() {
    if (!this.isAvailable()) {
      return {
        activeClinics: 5,
        totalReports: 150,
        totalPatients: 50,
        monthlyRevenue: 25000,
        recentActivity: []
      };
    }

    const clinics = await this.get('clinics');
    const reports = await this.get('reports');
    const patients = await this.get('patients');

    const activeClinicCount = clinics.filter(c => c.is_active).length;
    const totalReportsCount = reports.length;
    const totalPatientsCount = patients.length;

    const revenueData = await Promise.all(clinics.map(async (clinic) => {
      const subscription = await this.findOne('subscriptions', 'clinic_id', clinic.id);
      return subscription && subscription.amount ? subscription.amount : 0;
    }));

    const totalRevenue = revenueData.reduce((acc, amount) => acc + amount, 0);
    const usage = await this.get('usage');

    return {
      activeClinics: activeClinicCount,
      totalReports: totalReportsCount,
      totalPatients: totalPatientsCount,
      monthlyRevenue: totalRevenue,
      recentActivity: usage.slice(0, 10)
    };
  }

  // Auth methods
  async signUp(email, password, userData = {}) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Supabase not available, returning demo user');
      return { user: { email, ...userData }, session: null };
    }

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error signing up:', error);
      throw error;
    }
  }

  async signIn(email, password) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Supabase not available, returning demo session');
      return { user: { email }, session: null };
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error signing in:', error);
      throw error;
    }
  }

  async signOut() {
    if (!this.isAvailable()) return;

    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('❌ Error signing out:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    if (!this.isAvailable()) return null;

    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }

  // Session management
  onAuthStateChange(callback) {
    if (!this.isAvailable()) {
      // Return a dummy unsubscribe function
      return { data: null, error: null, unsubscribe: () => {} };
    }

    return this.supabase.auth.onAuthStateChange(callback);
  }

  // ===== BUG TRACKING METHODS =====

  // Bug Reports Methods
  async createBugReport(bugData) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Supabase not available, returning demo bug report');
      return { ...bugData, id: 'demo-bug-' + Date.now() };
    }

    try {
      // Get next serial number for the project
      const { data: nextSnoData, error: snoError } = await this.supabase
        .rpc('get_next_bug_sno', { project_name: bugData.project_name });

      if (snoError) {
        console.error('❌ Error getting next SNO:', snoError);
        throw snoError;
      }

      const nextSno = nextSnoData || 1;

      const bugReport = {
        ...bugData,
        sno: nextSno,
        date: bugData.date || new Date().toISOString().split('T')[0],
        status: bugData.status || 'Open',
        testing_status: bugData.testing_status || 'Pending',
        created_at: new Date().toISOString()
      };

      return await this.add('bug_reports', bugReport);
    } catch (error) {
      console.error('❌ Error creating bug report:', error);
      throw error;
    }
  }

  async getBugReports(projectName = null) {
    if (!this.isAvailable()) return [];

    try {
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
    if (!this.isAvailable()) return [];

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

  async getBugReportsBySeverity(severity, projectName = null) {
    if (!this.isAvailable()) return [];

    try {
      let query = this.supabase
        .from('bug_reports')
        .select('*')
        .eq('severity', severity)
        .order('created_at', { ascending: false });

      if (projectName) {
        query = query.eq('project_name', projectName);
      }

      const { data, error } = await query;

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

  // Testing Tracker Methods
  async createTestRecord(testData) {
    const testRecord = {
      ...testData,
      test_date: testData.test_date || new Date().toISOString().split('T')[0],
      test_status: testData.test_status || 'Pending',
      created_at: new Date().toISOString()
    };

    return await this.add('testing_tracker', testRecord);
  }

  async getTestRecords(bugReportId = null, projectName = null) {
    if (!this.isAvailable()) return [];

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
    if (!this.isAvailable()) return null;

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

  // Project Images Methods
  async uploadBugImage(bugReportId, projectName, file, uploadedBy) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Supabase not available, returning demo image data');
      return { id: 'demo-image-' + Date.now(), file_name: file.name };
    }

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
    if (!this.isAvailable()) return [];

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
    if (!this.isAvailable()) return false;

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

  // Analytics and Statistics Methods
  async getBugStatistics(projectName = null) {
    if (!this.isAvailable()) {
      return {
        totalBugs: 0,
        openBugs: 0,
        inProgressBugs: 0,
        closedBugs: 0,
        severityBreakdown: { P1: 0, P2: 0, P3: 0 },
        statusBreakdown: {}
      };
    }

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
    if (!this.isAvailable()) return null;

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

  // ===== NFC PROJECTS METHODS =====

  // Create a new NFC project
  async createNFCProject(projectData) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Supabase not available, returning demo NFC project');
      return { ...projectData, id: 'demo-nfc-' + Date.now() };
    }

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

  // Get all NFC projects with optional filtering
  async getNFCProjects(filters = {}) {
    if (!this.isAvailable()) return [];

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

  // Get a single NFC project by ID
  async getNFCProjectById(id) {
    return await this.findById('linklist_nfc_projects', id);
  }

  // Update an NFC project
  async updateNFCProject(id, updates) {
    return await this.update('linklist_nfc_projects', id, updates);
  }

  // Delete an NFC project
  async deleteNFCProject(id) {
    return await this.delete('linklist_nfc_projects', id);
  }

  // Get NFC projects by status
  async getNFCProjectsByStatus(status) {
    if (!this.isAvailable()) return [];

    try {
      const { data, error } = await this.supabase
        .from('linklist_nfc_projects')
        .select('*')
        .eq('project_status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching NFC projects by status:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getNFCProjectsByStatus:', error);
      return [];
    }
  }

  // Get NFC projects by priority
  async getNFCProjectsByPriority(priority) {
    if (!this.isAvailable()) return [];

    try {
      const { data, error } = await this.supabase
        .from('linklist_nfc_projects')
        .select('*')
        .eq('project_priority', priority)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching NFC projects by priority:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getNFCProjectsByPriority:', error);
      return [];
    }
  }

  // Get NFC projects assigned to a specific user
  async getNFCProjectsByAssignee(assignedTo) {
    if (!this.isAvailable()) return [];

    try {
      const { data, error } = await this.supabase
        .from('linklist_nfc_projects')
        .select('*')
        .eq('assigned_to', assignedTo)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching NFC projects by assignee:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getNFCProjectsByAssignee:', error);
      return [];
    }
  }

  // Get NFC projects for a specific client
  async getNFCProjectsByClient(clientName) {
    if (!this.isAvailable()) return [];

    try {
      const { data, error } = await this.supabase
        .from('linklist_nfc_projects')
        .select('*')
        .eq('client_name', clientName)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching NFC projects by client:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getNFCProjectsByClient:', error);
      return [];
    }
  }

  // Search NFC projects
  async searchNFCProjects(searchTerm) {
    if (!this.isAvailable()) return [];

    try {
      const { data, error } = await this.supabase
        .rpc('search_nfc_projects', { search_term: searchTerm });

      if (error) {
        console.error('❌ Error searching NFC projects:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in searchNFCProjects:', error);
      return [];
    }
  }

  // Get NFC project statistics
  async getNFCProjectStatistics() {
    if (!this.isAvailable()) {
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        draftProjects: 0,
        totalTags: 0,
        avgProjectDuration: 0
      };
    }

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

  // Get projects with upcoming deadlines
  async getNFCProjectsWithUpcomingDeadlines(daysAhead = 7) {
    if (!this.isAvailable()) return [];

    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const { data, error } = await this.supabase
        .from('linklist_nfc_projects')
        .select('*')
        .lte('estimated_completion_date', futureDate.toISOString().split('T')[0])
        .in('project_status', ['Active', 'Draft'])
        .order('estimated_completion_date', { ascending: true });

      if (error) {
        console.error('❌ Error fetching projects with upcoming deadlines:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getNFCProjectsWithUpcomingDeadlines:', error);
      return [];
    }
  }

  // Get overdue projects
  async getOverdueNFCProjects() {
    if (!this.isAvailable()) return [];

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await this.supabase
        .from('linklist_nfc_projects')
        .select('*')
        .lt('estimated_completion_date', today)
        .in('project_status', ['Active', 'Draft'])
        .order('estimated_completion_date', { ascending: true });

      if (error) {
        console.error('❌ Error fetching overdue projects:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getOverdueNFCProjects:', error);
      return [];
    }
  }

  // Update project status with automatic completion date
  async updateNFCProjectStatus(id, status) {
    if (!this.isAvailable()) return null;

    try {
      const updates = { project_status: status };

      // If marking as completed, set actual completion date
      if (status === 'Completed') {
        updates.actual_completion_date = new Date().toISOString().split('T')[0];
      }

      return await this.update('linklist_nfc_projects', id, updates);
    } catch (error) {
      console.error('❌ Error updating NFC project status:', error);
      throw error;
    }
  }

  // Get project cost analysis
  async getNFCProjectCostAnalysis(projectId = null) {
    if (!this.isAvailable()) return null;

    try {
      let query = this.supabase
        .from('linklist_nfc_projects')
        .select('project_budget, project_cost, tag_quantity, project_status');

      if (projectId) {
        query = query.eq('id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching project cost analysis:', error);
        return null;
      }

      if (projectId) {
        const project = data?.[0];
        return project ? {
          budgetVariance: (project.project_cost || 0) - (project.project_budget || 0),
          costPerTag: project.tag_quantity > 0 ? (project.project_cost || 0) / project.tag_quantity : 0,
          budgetUtilization: project.project_budget > 0 ? ((project.project_cost || 0) / project.project_budget) * 100 : 0
        } : null;
      }

      // Aggregate analysis for all projects
      const totalBudget = data.reduce((sum, p) => sum + (p.project_budget || 0), 0);
      const totalCost = data.reduce((sum, p) => sum + (p.project_cost || 0), 0);
      const totalTags = data.reduce((sum, p) => sum + (p.tag_quantity || 0), 0);

      return {
        totalBudget,
        totalCost,
        totalVariance: totalCost - totalBudget,
        avgCostPerTag: totalTags > 0 ? totalCost / totalTags : 0,
        overBudgetProjects: data.filter(p => (p.project_cost || 0) > (p.project_budget || 0)).length
      };
    } catch (error) {
      console.error('❌ Error in getNFCProjectCostAnalysis:', error);
      return null;
    }
  }

  // Link bug report to NFC project
  async linkBugReportToNFCProject(bugReportId, nfcProjectId) {
    if (!this.isAvailable()) return false;

    try {
      const { error } = await this.supabase
        .from('bug_reports')
        .update({ nfc_project_id: nfcProjectId })
        .eq('id', bugReportId);

      if (error) {
        console.error('❌ Error linking bug report to NFC project:', error);
        return false;
      }

      console.log('✅ Successfully linked bug report to NFC project');
      return true;
    } catch (error) {
      console.error('❌ Error in linkBugReportToNFCProject:', error);
      return false;
    }
  }

  // Get bug reports for an NFC project
  async getBugReportsForNFCProject(nfcProjectId) {
    if (!this.isAvailable()) return [];

    try {
      const { data, error } = await this.supabase
        .from('bug_reports')
        .select('*')
        .eq('nfc_project_id', nfcProjectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching bug reports for NFC project:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getBugReportsForNFCProject:', error);
      return [];
    }
  }
}

export default new SupabaseService();