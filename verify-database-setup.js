// Database Setup Verification Script
// Run this to check if all required tables exist in your Supabase database

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.VITE_BUGTRACKING_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_BUGTRACKING_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const REQUIRED_TABLES = [
  'projects',
  'project_milestones',
  'project_tasks',
  'milestone_kpis',
  'project_team_members',
  'project_risks',
  'project_comments',
  'project_updates'
];

async function checkTable(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return { exists: false, error: 'Table does not exist' };
      }
      return { exists: false, error: error.message };
    }

    return { exists: true, rowCount: data?.length || 0 };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function verifyDatabaseSetup() {
  console.log('🔍 Verifying Supabase Database Setup...\n');
  console.log(`📊 Database URL: ${supabaseUrl}\n`);

  let allTablesExist = true;
  const results = [];

  for (const tableName of REQUIRED_TABLES) {
    const result = await checkTable(tableName);
    results.push({ tableName, ...result });

    if (result.exists) {
      console.log(`✅ ${tableName.padEnd(25)} - EXISTS (${result.rowCount} rows)`);
    } else {
      console.log(`❌ ${tableName.padEnd(25)} - MISSING (${result.error})`);
      allTablesExist = false;
    }
  }

  console.log('\n' + '='.repeat(60));

  if (allTablesExist) {
    console.log('✅ SUCCESS! All required tables exist in the database.');
    console.log('\n📝 Your database is properly set up and ready to use!');
    console.log('You can now run your application and test the deliverable checkboxes.');
  } else {
    console.log('❌ SETUP INCOMPLETE! Some tables are missing.');
    console.log('\n📝 To fix this issue:');
    console.log('1. Open Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Run the SQL script from: create-project-tracking-tables.sql');
    console.log('5. Run this verification script again');
  }

  console.log('\n' + '='.repeat(60));
}

// Run verification
verifyDatabaseSetup().catch(error => {
  console.error('❌ Error during verification:', error);
  process.exit(1);
});
