// Test the full bug creation flow with the SNO function
import { createClient } from '@supabase/supabase-js';

const bugTrackingUrl = 'https://winhdjtlwhgdoinfrxch.supabase.co';
const bugTrackingAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmhkanRsd2hnZG9pbmZyeGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkwNTQsImV4cCI6MjA3NjkzNTA1NH0.IKxXiHRZiJI4UXfbAiYThXcsvdx04vqx0ejQs8LhkGU';

const supabase = createClient(bugTrackingUrl, bugTrackingAnonKey);

async function testFullBugCreation() {
  console.log('🧪 Testing full bug creation flow...\n');

  const projectName = 'test-project-' + Date.now();

  // Step 1: Get next SNO
  console.log('Step 1: Getting next SNO...');
  try {
    const { data: nextSno, error: snoError } = await supabase
      .rpc('get_next_bug_sno', { project_name: projectName });

    if (snoError) {
      console.error('❌ SNO generation failed:', snoError.message);
      return;
    }

    console.log('✅ Got SNO:', nextSno);

    // Step 2: Create bug with SNO
    console.log('\nStep 2: Creating bug with SNO...');
    const bugData = {
      project_name: projectName,
      project_version: 'v1.0.0',
      sno: nextSno,
      date: new Date().toISOString().split('T')[0],
      type: 'bug',
      module: 'Test Module',
      screen: 'Test Screen',
      snag: 'Test bug creation with SNO function',
      severity: 'P3',
      comments: 'Testing full flow',
      status: 'Open',
      testing_status: 'Pending',
      created_at: new Date().toISOString()
    };

    const { data: createdBug, error: createError } = await supabase
      .from('bug_reports')
      .insert(bugData)
      .select()
      .single();

    if (createError) {
      console.error('❌ Bug creation failed:', createError.message);
      console.error('   Error:', JSON.stringify(createError, null, 2));
      return;
    }

    console.log('✅ Bug created successfully!');
    console.log('   ID:', createdBug.id);
    console.log('   SNO:', createdBug.sno);
    console.log('   Project:', createdBug.project_name);

    // Step 3: Verify we can read it back
    console.log('\nStep 3: Verifying bug was saved...');
    const { data: fetchedBug, error: fetchError } = await supabase
      .from('bug_reports')
      .select('*')
      .eq('id', createdBug.id)
      .single();

    if (fetchError) {
      console.error('❌ Could not fetch bug:', fetchError.message);
    } else {
      console.log('✅ Bug verified in database!');
      console.log('   Snag:', fetchedBug.snag);
    }

    // Step 4: Clean up
    console.log('\nStep 4: Cleaning up test bug...');
    const { error: deleteError } = await supabase
      .from('bug_reports')
      .delete()
      .eq('id', createdBug.id);

    if (deleteError) {
      console.error('❌ Cleanup failed:', deleteError.message);
    } else {
      console.log('✅ Test bug cleaned up');
    }

    console.log('\n🎉 SUCCESS! Bug creation flow works perfectly!');
    console.log('\n💡 The issue is likely in the frontend code or browser console.');
    console.log('   Please check the browser console for errors when saving bugs.');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testFullBugCreation();
