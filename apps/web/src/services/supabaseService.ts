import { createClient } from '@supabase/supabase-js';

// Project Tracking Supabase instance
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ||
                     import.meta.env.VITE_BUGTRACKING_SUPABASE_URL ||
                     'https://winhdjtlwhgdoinfrxch.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ||
                         import.meta.env.VITE_BUGTRACKING_SUPABASE_ANON_KEY ||
                         'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmhkanRsd2hnZG9pbmZyeGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkwNTQsImV4cCI6MjA3NjkzNTA1NH0.IKxXiHRZiJI4UXfbAiYThXcsvdx04vqx0ejQs8LhkGU';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'project-tracking-auth',
  },
  global: {
    headers: {
      'x-application-name': 'project-tracking-system',
    },
  },
  db: {
    schema: 'public',
  },
});

class SupabaseService {
  constructor() {
    this.supabase = supabase;
    this.isAvailable = true;
    console.log('📊 Project Tracking Service initialized with database');
    console.log('🔗 Project Tracking URL:', supabaseUrl);
  }

  get supabaseService() {
    return this;
  }

  async testConnection() {
    try {
      console.log('🔌 Testing Project Tracking database connection...');

      const { data, error } = await this.supabase
        .from('project_milestones')
        .select('id')
        .limit(1);

      if (error && error.code === 'PGRST106') {
        console.log('⚠️ Project tracking tables not yet created - will create on first use');
        return false;
      } else if (error) {
        console.error('❌ Project tracking connection error:', error);
        return false;
      }

      console.log('✅ Project Tracking database connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Error testing connection:', error);
      return false;
    }
  }
}

const supabaseService = new SupabaseService();

export default supabaseService;
export { supabase };
