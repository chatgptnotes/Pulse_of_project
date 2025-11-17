// Comprehensive diagnosis of the bug save issue
import { createClient } from '@supabase/supabase-js';

const bugTrackingUrl = 'https://winhdjtlwhgdoinfrxch.supabase.co';
const bugTrackingAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmhkanRsd2hnZG9pbmZyeGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkwNTQsImV4cCI6MjA3NjkzNTA1NH0.IKxXiHRZiJI4UXfbAiYThXcsvdx04vqx0ejQs8LhkGU';

const supabase = createClient(bugTrackingUrl, bugTrackingAnonKey);

async function diagnose() {
  console.log('🔍 COMPREHENSIVE BUG SAVE DIAGNOSIS\n');
  console.log('=' .repeat(60) + '\n');

  // Test 1: Check if SQL fix was applied
  console.log('TEST 1: Checking if reported_by and assigned_to are nullable...');
  try {
    const { data, error } = await supabase
      .from('bug_reports')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Cannot connect to bug_reports table:', error.message);
      return;
    }

    // Try to get schema info (this won't work directly, so we'll test by inserting)
    console.log('✅ Connection to bug_reports table OK\n');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    return;
  }

  // Test 2: Test exact flow from bugTrackingService.createBugReport
  console.log('TEST 2: Simulating exact frontend bug creation flow...');
  const projectName = 'neurosense-360'; // Use actual project name

  try {
    // Step 2a: Get next SNO
    console.log('  Step 2a: Getting next SNO for project:', projectName);
    const { data: nextSno, error: snoError } = await supabase
      .rpc('get_next_bug_sno', { project_name: projectName });

    if (snoError) {
      console.error('  ❌ SNO generation failed:', snoError.message);
      console.error('     Code:', snoError.code);
      console.error('     This means the database function is missing or broken!');
      console.error('\n  FIX: Run this SQL in Supabase:');
      console.log(`
CREATE OR REPLACE FUNCTION get_next_bug_sno(project_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  next_sno INTEGER;
BEGIN
  SELECT COALESCE(MAX(sno), 0) + 1
  INTO next_sno
  FROM bug_reports
  WHERE bug_reports.project_name = get_next_bug_sno.project_name;
  RETURN next_sno;
END;
$$;
      `);
      return;
    }

    console.log('  ✅ Got SNO:', nextSno);

    // Step 2b: Create bug exactly like frontend does
    console.log('\n  Step 2b: Creating bug with exact frontend data structure...');
    const bugData = {
      project_name: projectName,
      project_version: 'v1.0.0',
      sno: nextSno,
      date: new Date().toISOString().split('T')[0],
      type: 'bug',
      module: 'Test Module',
      screen: 'Test Screen',
      snag: 'Test bug - can be deleted',
      severity: 'P3',
      comments: 'Testing from diagnostic script',
      status: 'Open',
      testing_status: 'Pending',
      created_at: new Date().toISOString()
      // NOT including reported_by and assigned_to
    };

    console.log('  Bug data:', JSON.stringify(bugData, null, 2));

    const { data: createdBug, error: createError } = await supabase
      .from('bug_reports')
      .insert(bugData)
      .select()
      .single();

    if (createError) {
      console.error('\n  ❌ BUG CREATION FAILED!');
      console.error('     Error:', createError.message);
      console.error('     Code:', createError.code);
      console.error('     Details:', JSON.stringify(createError, null, 2));

      if (createError.code === '23502') {
        console.log('\n  🔧 DIAGNOSIS: NOT NULL constraint violation');
        console.log('     This means the SQL fix was NOT applied or not applied correctly.');
        console.log('\n  ✅ SOLUTION: Run this SQL in Supabase SQL Editor:');
        console.log('     https://supabase.com/dashboard/project/winhdjtlwhgdoinfrxch/sql\n');
        console.log('     ALTER TABLE bug_reports ALTER COLUMN reported_by DROP NOT NULL;');
        console.log('     ALTER TABLE bug_reports ALTER COLUMN assigned_to DROP NOT NULL;\n');
      } else if (createError.code === '42501') {
        console.log('\n  🔧 DIAGNOSIS: Permission/Policy error');
        console.log('     Row Level Security (RLS) is blocking the insert.');
        console.log('\n  ✅ SOLUTION: Disable RLS or add proper policies:');
        console.log('     ALTER TABLE bug_reports DISABLE ROW LEVEL SECURITY;\n');
      } else {
        console.log('\n  🔧 DIAGNOSIS: Unknown error');
        console.log('     Check Supabase dashboard for more details.');
      }
      return;
    }

    console.log('\n  🎉 SUCCESS! Bug created with ID:', createdBug.id);
    console.log('     SNO:', createdBug.sno);
    console.log('     The bug save is working!\n');

    // Clean up
    console.log('  Cleaning up test bug...');
    await supabase.from('bug_reports').delete().eq('id', createdBug.id);
    console.log('  ✅ Cleanup complete\n');

  } catch (err) {
    console.error('❌ Test failed with exception:', err.message);
    console.error('   Stack:', err.stack);
  }

  // Test 3: Check browser console instructions
  console.log('=' .repeat(60));
  console.log('TEST 3: Frontend troubleshooting...\n');
  console.log('If the backend test passed but the frontend still fails:');
  console.log('1. Open browser console (F12 or Right-click > Inspect > Console)');
  console.log('2. Try adding a bug in the UI');
  console.log('3. Look for red error messages in the console');
  console.log('4. Copy the exact error message and share it with me\n');
  console.log('Common issues:');
  console.log('  - CORS errors: Backend is fine, but browser is blocking');
  console.log('  - Network errors: Check internet connection');
  console.log('  - Auth errors: Token might be expired\n');

  console.log('🏁 DIAGNOSIS COMPLETE\n');
}

diagnose();
