/**
 * Test script for Supabase bug tracking setup
 * This script tests the basic CRUD operations for the bug tracking system
 * Run with: node test-supabase-setup.js
 */

import { config } from 'dotenv';
import supabaseService from './apps/web/src/services/supabaseService.js';

// Load environment variables
config();

console.log('🧪 Testing Supabase Bug Tracking Setup');
console.log('=====================================');

async function testBugTrackingSystem() {
  try {
    // Test 1: Check if Supabase is available
    console.log('\n📋 Test 1: Checking Supabase connection...');
    if (!supabaseService.isAvailable()) {
      console.log('❌ Supabase is not available. Check your environment variables.');
      return;
    }
    console.log('✅ Supabase connection is available');

    // Test 2: Initialize tables
    console.log('\n📋 Test 2: Initializing tables...');
    await supabaseService.initializeTables();

    // Test 3: Create a test bug report
    console.log('\n📋 Test 3: Creating test bug report...');
    const testBugData = {
      project_name: 'Neuro360',
      project_version: '1.0.0',
      module: 'Authentication',
      screen: 'Login Page',
      snag: 'Test bug: User cannot login with valid credentials during automated testing',
      severity: 'P2',
      reported_by: 'test-system@neuro360.com',
      assigned_to: 'developer@neuro360.com',
      comments: 'This is a test bug report created during system verification'
    };

    const createdBug = await supabaseService.createBugReport(testBugData);
    console.log('✅ Bug report created:', createdBug.id);

    // Test 4: Fetch bug reports
    console.log('\n📋 Test 4: Fetching bug reports...');
    const bugReports = await supabaseService.getBugReports('Neuro360');
    console.log(`✅ Retrieved ${bugReports.length} bug reports for Neuro360`);

    // Test 5: Create a test record in testing tracker
    console.log('\n📋 Test 5: Creating test tracking record...');
    const testTrackingData = {
      bug_report_id: createdBug.id,
      project_name: 'Neuro360',
      test_case_name: 'Login Functionality Test',
      test_description: 'Verify user can login with valid credentials',
      expected_result: 'User should be redirected to dashboard',
      actual_result: 'Login form remains visible with no error message',
      test_status: 'Fail',
      tester_name: 'qa-tester@neuro360.com',
      notes: 'Tested on Chrome browser version 118'
    };

    const createdTest = await supabaseService.createTestRecord(testTrackingData);
    console.log('✅ Test record created:', createdTest.id);

    // Test 6: Get testing summary
    console.log('\n📋 Test 6: Getting testing summary...');
    const testingSummary = await supabaseService.getTestingSummary(createdBug.id);
    console.log('✅ Testing summary:', testingSummary);

    // Test 7: Update bug status
    console.log('\n📋 Test 7: Updating bug status...');
    const updatedBug = await supabaseService.updateBugReport(createdBug.id, {
      status: 'In Progress',
      comments: 'Bug assigned to development team for investigation'
    });
    console.log('✅ Bug status updated to:', updatedBug.status);

    // Test 8: Get bug statistics
    console.log('\n📋 Test 8: Getting bug statistics...');
    const stats = await supabaseService.getBugStatistics('Neuro360');
    console.log('✅ Bug statistics:', stats);

    // Test 9: Clean up test data
    console.log('\n📋 Test 9: Cleaning up test data...');
    await supabaseService.deleteTestRecord(createdTest.id);
    await supabaseService.deleteBugReport(createdBug.id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Run the deploy-migrations.sql script in your Supabase SQL Editor');
    console.log('2. Configure the storage bucket policies in Supabase Dashboard');
    console.log('3. Update your BugReport component to use these new methods');
    console.log('4. Test image upload functionality manually');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Error details:', error.message);

    if (error.code) {
      console.error('Error code:', error.code);
    }

    if (error.details) {
      console.error('Error details:', error.details);
    }

    if (error.hint) {
      console.error('Error hint:', error.hint);
    }
  }
}

// Run the tests
testBugTrackingSystem().then(() => {
  console.log('\n✨ Test execution completed');
}).catch((error) => {
  console.error('\n💥 Test execution failed:', error);
});