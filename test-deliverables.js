#!/usr/bin/env node

/**
 * Test script for deliverables functionality
 * Tests Supabase connection and deliverable operations
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://winhdjtlwhgdoinfrxch.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmhkanRsd2hnZG9pbmZyeGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkwNTQsImV4cCI6MjA3NjkzNTA1NH0.IKxXiHRZiJI4UXfbAiYThXcsvdx04vqx0ejQs8LhkGU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabaseConnection() {
  console.log('🔌 Testing Supabase Connection...\n');

  try {
    // Test 1: Check if project_milestones table exists
    console.log('📊 Test 1: Checking project_milestones table...');
    const { data: tables, error: tableError } = await supabase
      .from('project_milestones')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ Table check failed:', tableError.message);
      return false;
    }
    console.log('✅ project_milestones table exists\n');

    // Test 2: Create a test project first
    console.log('📊 Test 2: Creating test project...');
    const testProjectId = 'test-project-' + Date.now();
    const testProject = {
      id: testProjectId,
      name: 'Test Project',
      description: 'Testing deliverables',
      client: 'Test Client',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      overall_progress: 0
    };

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert(testProject)
      .select()
      .single();

    if (projectError) {
      console.error('❌ Project creation failed:', projectError.message);
      return false;
    }
    console.log('✅ Test project created:', projectData.id, '\n');

    // Test 3: Insert a test milestone with deliverables
    console.log('📊 Test 3: Creating test milestone with deliverables...');
    const testMilestone = {
      id: 'test-milestone-' + Date.now(),
      project_id: testProjectId,
      name: 'Test Milestone',
      description: 'Testing deliverables functionality',
      status: 'pending',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 0,
      deliverables: [
        { id: 'del-1', text: 'Test Deliverable 1', completed: false },
        { id: 'del-2', text: 'Test Deliverable 2', completed: false },
        { id: 'del-3', text: 'Signed LOC', completed: false },
        { id: 'del-4', text: 'Receipt of advance payment', completed: false }
      ],
      assigned_to: ['Test Team'],
      dependencies: [],
      order: 1
    };

    const { data: insertData, error: insertError } = await supabase
      .from('project_milestones')
      .insert(testMilestone)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      return false;
    }
    console.log('✅ Test milestone created:', insertData.id);
    console.log('   Deliverables:', insertData.deliverables.length, 'items\n');

    // Test 4: Toggle a deliverable
    console.log('📊 Test 4: Toggling deliverable completion...');
    const updatedDeliverables = insertData.deliverables.map((d, i) =>
      i === 0 ? { ...d, completed: true } : d
    );

    const { data: updateData, error: updateError } = await supabase
      .from('project_milestones')
      .update({ deliverables: updatedDeliverables })
      .eq('id', insertData.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
      return false;
    }

    const completedCount = updateData.deliverables.filter(d => d.completed).length;
    console.log('✅ Deliverable toggled successfully');
    console.log(`   Completed: ${completedCount}/${updateData.deliverables.length}\n`);

    // Test 5: Read back the data
    console.log('📊 Test 5: Reading milestone data...');
    const { data: readData, error: readError } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('id', insertData.id)
      .single();

    if (readError) {
      console.error('❌ Read failed:', readError.message);
      return false;
    }
    console.log('✅ Data read successfully');
    console.log('   Milestone:', readData.name);
    console.log('   Deliverables:');
    readData.deliverables.forEach((d, i) => {
      const status = d.completed ? '✓' : '☐';
      console.log(`   ${status} ${d.text}`);
    });
    console.log('');

    // Test 6: Cleanup - Delete test data
    console.log('📊 Test 6: Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('project_milestones')
      .delete()
      .eq('id', insertData.id);

    if (deleteError) {
      console.error('⚠️  Milestone cleanup failed:', deleteError.message);
    } else {
      console.log('✅ Test milestone deleted');
    }

    // Delete test project
    const { error: projectDeleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', testProjectId);

    if (projectDeleteError) {
      console.error('⚠️  Project cleanup failed:', projectDeleteError.message);
    } else {
      console.log('✅ Test project deleted\n');
    }

    console.log('🎉 All tests passed! Deliverables functionality is working correctly.\n');
    console.log('📋 Summary:');
    console.log('   ✓ Database connection successful');
    console.log('   ✓ Table schema correct');
    console.log('   ✓ Insert deliverables working');
    console.log('   ✓ Update deliverables working');
    console.log('   ✓ Read deliverables working');
    console.log('   ✓ JSONB storage working correctly');
    console.log('');
    console.log('You can now use the checkboxes in the UI!');
    console.log('Open http://localhost:3000/ and navigate to the Gantt chart.');

    return true;

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    return false;
  }
}

// Run tests
console.log('🧪 Testing Deliverables Functionality');
console.log('=====================================\n');
testSupabaseConnection();
