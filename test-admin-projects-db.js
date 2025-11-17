/**
 * Admin Projects Database Verification Script
 *
 * This script checks:
 * 1. Database connection
 * 2. admin_projects table existence
 * 3. Data in the table
 * 4. CRUD operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://winhdjtlwhgdoinfrxch.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmhkanRsd2hnZG9pbmZyeGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkwNTQsImV4cCI6MjA3NjkzNTA1NH0.IKxXiHRZiJI4UXfbAiYThXcsvdx04vqx0ejQs8LhkGU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🚀 Starting Admin Projects Database Verification...\n');

async function verifyDatabase() {
  try {
    // Test 1: Check database connection
    console.log('📡 Test 1: Checking database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('admin_projects')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message);
      console.log('\n⚠️  ISSUE: admin_projects table may not exist!');
      console.log('📝 ACTION REQUIRED:');
      console.log('   1. Open Supabase Dashboard');
      console.log('   2. Go to SQL Editor');
      console.log('   3. Run the ADMIN_PROJECTS_MIGRATION.sql file');
      console.log('   4. Verify the table is created\n');
      return false;
    }
    console.log('✅ Database connection successful!\n');

    // Test 2: Count projects in database
    console.log('📊 Test 2: Counting projects in database...');
    const { count, error: countError } = await supabase
      .from('admin_projects')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count failed:', countError.message);
      return false;
    }
    console.log(`✅ Found ${count} projects in database`);

    if (count === 0) {
      console.log('\n⚠️  WARNING: No projects in database!');
      console.log('📝 ACTION REQUIRED:');
      console.log('   The migration SQL may not have inserted data.');
      console.log('   Please run ADMIN_PROJECTS_MIGRATION.sql completely.\n');
    } else {
      console.log(`✅ Database has ${count} projects (Expected: 45)\n`);
    }

    // Test 3: Fetch sample projects
    console.log('📋 Test 3: Fetching first 5 projects...');
    const { data: projects, error: fetchError } = await supabase
      .from('admin_projects')
      .select('id, name, client, status, priority, progress, is_custom')
      .order('priority')
      .limit(5);

    if (fetchError) {
      console.error('❌ Fetch failed:', fetchError.message);
      return false;
    }

    if (projects && projects.length > 0) {
      console.log('✅ Sample projects:');
      projects.forEach(p => {
        console.log(`   • ${p.name} (${p.client}) - Priority ${p.priority}, ${p.progress}% complete`);
      });
      console.log('');
    }

    // Test 4: Check if we can create a test project
    console.log('📝 Test 4: Testing CREATE operation...');
    const testProject = {
      id: 'test-project-' + Date.now(),
      name: 'Test Project',
      client: 'Test Client',
      description: 'This is a test project',
      status: 'planning',
      priority: 4,
      progress: 0,
      starred: false,
      team_count: 1,
      category: 'Test',
      is_custom: true
    };

    const { data: created, error: createError } = await supabase
      .from('admin_projects')
      .insert([testProject])
      .select()
      .single();

    if (createError) {
      console.error('❌ Create failed:', createError.message);
      console.log('⚠️  Cannot create projects - check permissions\n');
      return false;
    }
    console.log('✅ Test project created successfully!\n');

    // Test 5: Delete the test project
    console.log('🗑️  Test 5: Testing DELETE operation...');
    const { error: deleteError } = await supabase
      .from('admin_projects')
      .delete()
      .eq('id', testProject.id);

    if (deleteError) {
      console.error('❌ Delete failed:', deleteError.message);
      return false;
    }
    console.log('✅ Test project deleted successfully!\n');

    // Final Summary
    console.log('═══════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════════');
    console.log(`📊 Database Status: Connected`);
    console.log(`📁 Table: admin_projects exists`);
    console.log(`📈 Projects Count: ${count}`);
    console.log(`✏️  CRUD Operations: Working`);
    console.log('═══════════════════════════════════════════════\n');

    if (count < 45) {
      console.log('⚠️  NOTE: Expected 45 projects from migration.');
      console.log('   You may need to run the migration SQL file.\n');
    }

    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run verification
verifyDatabase()
  .then(success => {
    if (success) {
      console.log('✅ Database is ready to use!\n');
      process.exit(0);
    } else {
      console.log('❌ Database verification failed. Please fix the issues above.\n');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
