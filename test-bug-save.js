// Quick test script to diagnose bug tracking save issues
import { createClient } from '@supabase/supabase-js';

const bugTrackingUrl = 'https://winhdjtlwhgdoinfrxch.supabase.co';
const bugTrackingAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmhkanRsd2hnZG9pbmZyeGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkwNTQsImV4cCI6MjA3NjkzNTA1NH0.IKxXiHRZiJI4UXfbAiYThXcsvdx04vqx0ejQs8LhkGU';

const supabase = createClient(bugTrackingUrl, bugTrackingAnonKey);

async function testBugTracking() {
  console.log('🔍 Testing Bug Tracking Database...\n');

  // Test 1: Connection
  console.log('Test 1: Testing connection...');
  try {
    const { data, error } = await supabase
      .from('bug_reports')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Connection error:', error.message);
      console.error('   Details:', JSON.stringify(error, null, 2));
      return;
    }
    console.log('✅ Connection successful\n');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    return;
  }

  // Test 2: Check existing bugs
  console.log('Test 2: Checking existing bugs...');
  try {
    const { data, error } = await supabase
      .from('bug_reports')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Query error:', error.message);
    } else {
      console.log(`✅ Found ${data.length} existing bugs`);
      if (data.length > 0) {
        console.log('   Sample bug:', {
          id: data[0].id,
          sno: data[0].sno,
          project_name: data[0].project_name,
          snag: data[0].snag?.substring(0, 50) + '...'
        });
      }
    }
    console.log('');
  } catch (err) {
    console.error('❌ Query failed:', err.message);
  }

  // Test 3: Try to insert a test bug
  console.log('Test 3: Attempting to insert test bug...');
  try {
    const testBug = {
      project_name: 'test-project',
      project_version: 'v1.0.0',
      date: new Date().toISOString().split('T')[0],
      type: 'bug',
      module: 'Test Module',
      screen: 'Test Screen',
      snag: 'Test issue - please delete',
      severity: 'P3',
      comments: 'Test insertion',
      status: 'Open',
      testing_status: 'Pending',
      created_at: new Date().toISOString()
    };

    console.log('   Inserting:', testBug);

    const { data, error } = await supabase
      .from('bug_reports')
      .insert(testBug)
      .select()
      .single();

    if (error) {
      console.error('❌ Insert failed:', error.message);
      console.error('   Error code:', error.code);
      console.error('   Details:', JSON.stringify(error, null, 2));

      // Check if it's an RLS policy error
      if (error.code === '42501' || error.message.includes('policy')) {
        console.log('\n⚠️  This looks like an RLS (Row Level Security) policy issue!');
        console.log('   Solution: You need to either:');
        console.log('   1. Disable RLS on the bug_reports table, OR');
        console.log('   2. Add policies to allow INSERT operations');
        console.log('\n   Run this SQL in Supabase:');
        console.log('   ALTER TABLE bug_reports DISABLE ROW LEVEL SECURITY;');
      }
    } else {
      console.log('✅ Insert successful!');
      console.log('   Created bug with ID:', data.id);
      console.log('   SNO:', data.sno);

      // Clean up
      console.log('\n   Cleaning up test bug...');
      await supabase.from('bug_reports').delete().eq('id', data.id);
      console.log('   ✅ Test bug deleted');
    }
  } catch (err) {
    console.error('❌ Insert test failed:', err.message);
  }

  // Test 4: Check team_members table
  console.log('\nTest 4: Checking team_members table...');
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('id, name, team_type')
      .limit(3);

    if (error) {
      console.error('❌ Team members query error:', error.message);
    } else {
      console.log(`✅ Found ${data.length} team members`);
      data.forEach(m => console.log(`   - ${m.name} (${m.team_type})`));
    }
  } catch (err) {
    console.error('❌ Team members check failed:', err.message);
  }

  console.log('\n🏁 Test complete!');
}

testBugTracking();
