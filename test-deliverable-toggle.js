// Test Deliverable Toggle - Debug Script
// Simulates clicking a checkbox and saving to database

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.VITE_BUGTRACKING_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_BUGTRACKING_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testToggle() {
  console.log('🧪 Testing Deliverable Toggle\n');
  console.log('Database:', supabaseUrl);
  console.log('Testing: milestone-1, deliverable del-1-1 (Signed LOC)\n');

  try {
    // Step 1: Fetch current milestone
    console.log('Step 1: Fetching current data...');
    const { data: before, error: fetchError } = await supabase
      .from('project_milestones')
      .select('deliverables')
      .eq('id', 'milestone-1')
      .single();

    if (fetchError) {
      console.error('❌ Fetch Error:', fetchError);
      return;
    }

    console.log('✅ Current deliverables:', JSON.stringify(before.deliverables, null, 2));

    const currentStatus = before.deliverables[0].completed;
    console.log(`\n📊 Current Status of "Signed LOC": ${currentStatus ? 'CHECKED ✅' : 'UNCHECKED ☐'}`);

    // Step 2: Toggle the deliverable
    console.log('\nStep 2: Toggling deliverable...');
    const updatedDeliverables = before.deliverables.map(d =>
      d.id === 'del-1-1'
        ? { ...d, completed: !d.completed }
        : d
    );

    console.log('🔄 New Status:', !currentStatus ? 'CHECKED ✅' : 'UNCHECKED ☐');

    // Step 3: Update database
    console.log('\nStep 3: Saving to database...');
    const { data: updated, error: updateError } = await supabase
      .from('project_milestones')
      .update({ deliverables: updatedDeliverables })
      .eq('id', 'milestone-1')
      .select();

    if (updateError) {
      console.error('❌ Update Error:', updateError);
      return;
    }

    console.log('✅ Database updated successfully!');

    // Step 4: Verify the change
    console.log('\nStep 4: Verifying the change...');
    const { data: after, error: verifyError } = await supabase
      .from('project_milestones')
      .select('deliverables')
      .eq('id', 'milestone-1')
      .single();

    if (verifyError) {
      console.error('❌ Verify Error:', verifyError);
      return;
    }

    const newStatus = after.deliverables[0].completed;
    console.log(`📊 New Status of "Signed LOC": ${newStatus ? 'CHECKED ✅' : 'UNCHECKED ☐'}`);

    // Step 5: Result
    console.log('\n' + '='.repeat(60));
    if (newStatus === !currentStatus) {
      console.log('✅ SUCCESS! Toggle worked correctly!');
      console.log(`   Changed from: ${currentStatus ? 'CHECKED' : 'UNCHECKED'}`);
      console.log(`   Changed to:   ${newStatus ? 'CHECKED' : 'UNCHECKED'}`);
    } else {
      console.log('❌ FAILED! Toggle did not work!');
      console.log(`   Expected: ${!currentStatus}`);
      console.log(`   Got: ${newStatus}`);
    }
    console.log('='.repeat(60));

    console.log('\n💡 Run this script again to toggle back!');

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  }
}

testToggle();
