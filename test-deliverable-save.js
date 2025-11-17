// Comprehensive test for deliverable checkbox save functionality
import { createClient } from '@supabase/supabase-js';

const projectTrackingUrl = 'https://winhdjtlwhgdoinfrxch.supabase.co';
const projectTrackingAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmhkanRsd2hnZG9pbmZyeGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkwNTQsImV4cCI6MjA3NjkzNTA1NH0.IKxXiHRZiJI4UXfbAiYThXcsvdx04vqx0ejQs8LhkGU';

const supabase = createClient(projectTrackingUrl, projectTrackingAnonKey);

async function testDeliverableSave() {
  console.log('🧪 TESTING DELIVERABLE CHECKBOX SAVE\n');
  console.log('='.repeat(70) + '\n');

  // Test 1: Check if project_milestones table exists
  console.log('TEST 1: Checking project_milestones table...');
  try {
    const { data, error } = await supabase
      .from('project_milestones')
      .select('id, name, deliverables')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing project_milestones:', error.message);
      console.error('   This means the table might not exist!');
      console.log('\n   ⚠️  SOLUTION: Run the database migration script');
      console.log('   File: apps/web/database-migrations/01-create-project-tracking-tables.sql\n');
      return;
    }

    console.log('✅ project_milestones table exists');
    console.log('   Found', data.length, 'milestone(s)\n');

    if (data.length > 0) {
      console.log('   Sample milestone:', {
        id: data[0].id,
        name: data[0].name,
        deliverables: data[0].deliverables?.length || 0
      });
    }
  } catch (err) {
    console.error('❌ Test 1 failed:', err.message);
    return;
  }

  // Test 2: Check if we have any milestones with deliverables
  console.log('\nTEST 2: Finding milestones with deliverables...');
  try {
    const { data: milestones, error } = await supabase
      .from('project_milestones')
      .select('*')
      .limit(10);

    if (error) throw error;

    console.log('✅ Found', milestones.length, 'total milestones');

    const milestonesWithDeliverables = milestones.filter(m => m.deliverables && m.deliverables.length > 0);
    console.log('   Milestones with deliverables:', milestonesWithDeliverables.length);

    if (milestonesWithDeliverables.length === 0) {
      console.log('\n   ⚠️  NO MILESTONES WITH DELIVERABLES FOUND!');
      console.log('   This means there is no data to test checkbox saving.');
      console.log('   Solution: Load project data from the UI first, then test again.\n');
      return;
    }

    // Pick first milestone with deliverables for testing
    const testMilestone = milestonesWithDeliverables[0];
    console.log('\n   Using milestone for test:', testMilestone.name);
    console.log('   Deliverables:', testMilestone.deliverables.map(d => ({
      id: d.id,
      name: d.name,
      completed: d.completed
    })));

    // Test 3: Try to toggle a deliverable
    console.log('\nTEST 3: Testing deliverable toggle...');
    const testDeliverable = testMilestone.deliverables[0];
    console.log('   Toggling deliverable:', testDeliverable.name);
    console.log('   Current status:', testDeliverable.completed ? 'completed' : 'not completed');

    // Toggle it
    const updatedDeliverables = testMilestone.deliverables.map(d =>
      d.id === testDeliverable.id ? { ...d, completed: !d.completed } : d
    );

    const { data: updateResult, error: updateError } = await supabase
      .from('project_milestones')
      .update({ deliverables: updatedDeliverables })
      .eq('id', testMilestone.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
      console.error('   Error code:', updateError.code);
      console.error('   Details:', JSON.stringify(updateError, null, 2));
      return;
    }

    console.log('✅ Deliverable toggle saved successfully!');
    console.log('   New status:', !testDeliverable.completed ? 'completed' : 'not completed');

    // Verify it was saved
    console.log('\nTEST 4: Verifying save...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('project_milestones')
      .select('deliverables')
      .eq('id', testMilestone.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
      return;
    }

    const verifiedDeliverable = verifyData.deliverables.find(d => d.id === testDeliverable.id);
    console.log('✅ Verified in database!');
    console.log('   Status in DB:', verifiedDeliverable.completed ? 'completed' : 'not completed');

    if (verifiedDeliverable.completed !== testDeliverable.completed) {
      console.log('   ✅ Status CHANGED as expected!');
    } else {
      console.log('   ❌ Status DID NOT CHANGE - something is wrong!');
    }

    // Toggle back to original state
    console.log('\nCleaning up - toggling back to original state...');
    await supabase
      .from('project_milestones')
      .update({ deliverables: testMilestone.deliverables })
      .eq('id', testMilestone.id);
    console.log('✅ Restored original state\n');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }

  console.log('='.repeat(70));
  console.log('\n📋 SUMMARY:');
  console.log('If all tests passed, the backend save functionality is working.');
  console.log('If checkboxes still don\'t save in the UI, the issue is in the frontend code.\n');
  console.log('Next steps:');
  console.log('1. Check browser console for errors when clicking checkboxes');
  console.log('2. Verify handleDeliverableToggle is being called');
  console.log('3. Check if toast messages appear when toggling\n');
}

testDeliverableSave();
