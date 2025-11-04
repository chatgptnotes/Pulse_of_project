#!/usr/bin/env node

/**
 * Setup script for Project Tracking Database
 * This script creates all necessary tables for project tracking with deliverables
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = process.env.VITE_BUGTRACKING_SUPABASE_URL || 'https://winhdjtlwhgdoinfrxch.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.VITE_BUGTRACKING_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmhkanRsd2hnZG9pbmZyeGNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM1OTA1NCwiZXhwIjoyMDc2OTM1MDU0fQ.YRWXaHhsrAww6oNik72fDoxYa_SjQDPsoCE7si-1u9Q';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  console.log('🚀 Setting up Project Tracking Database...');
  console.log('📍 Supabase URL:', SUPABASE_URL);

  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create-project-tracking-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📄 Executing SQL migration...');

    // Execute SQL using Supabase's SQL function
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(() => {
      // If exec_sql doesn't exist, we'll need to execute it differently
      return { data: null, error: { message: 'exec_sql function not available' } };
    });

    if (error && error.message === 'exec_sql function not available') {
      console.log('⚠️  Direct SQL execution not available.');
      console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
      console.log('   Dashboard → SQL Editor → New Query → Paste the content from:');
      console.log(`   ${sqlFile}`);
      console.log('');
      console.log('Or use the Supabase CLI:');
      console.log(`   supabase db push --db-url "${SUPABASE_URL}"`);
      return;
    }

    if (error) {
      console.error('❌ Error executing SQL:', error);
      throw error;
    }

    console.log('✅ Database schema created successfully!');
    console.log('');
    console.log('📊 Tables created:');
    console.log('   - projects');
    console.log('   - project_milestones (with deliverables JSONB)');
    console.log('   - milestone_kpis');
    console.log('   - project_tasks');
    console.log('   - project_team_members');
    console.log('   - project_risks');
    console.log('   - project_comments');
    console.log('   - project_updates');
    console.log('');
    console.log('🎉 Project Tracking Database is ready to use!');

  } catch (error) {
    console.error('💥 Failed to setup database:', error.message);
    console.log('');
    console.log('📋 Manual Setup Instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the content from: create-project-tracking-tables.sql');
    console.log('5. Run the query');
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
