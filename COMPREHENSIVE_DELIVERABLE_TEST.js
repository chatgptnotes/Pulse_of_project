/**
 * COMPREHENSIVE DELIVERABLE CHECKBOX PERSISTENCE TEST
 *
 * This script performs an exhaustive test of the entire deliverable save/load flow
 * to identify exactly where the persistence is failing.
 *
 * Test Flow:
 * 1. Database Connection Verification
 * 2. Project Structure Verification
 * 3. Milestone Structure Verification
 * 4. Deliverable Save Test (Direct Database)
 * 5. Deliverable Load Test (Direct Database)
 * 6. Persistence Verification (Save -> Load -> Verify)
 * 7. Project Load Simulation (What frontend does)
 * 8. Complete End-to-End Flow Test
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://winhdjtlwhgdoinfrxch.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmhkanRsd2hnZG9pbmZyeGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkwNTQsImV4cCI6MjA3NjkzNTA1NH0.IKxXiHRZiJI4UXfbAiYThXcsvdx04vqx0ejQs8LhkGU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test configuration
const TEST_PROJECT_ID = 'neurosense-360';
const TEST_MILESTONE_ID = 'ns360-milestone-1';
const TEST_DELIVERABLE_ID = 'ns360-del-1-1';

let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: []
};

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  console.log(`  ${title}`);
  console.log('='.repeat(80) + '\n');
}

function logTest(name, passed, details) {
  if (passed) {
    console.log(`✅ PASS: ${name}`);
    if (details) console.log(`   ${details}`);
    testResults.passed++;
  } else {
    console.log(`❌ FAIL: ${name}`);
    if (details) console.log(`   ${details}`);
    testResults.failed++;
    testResults.errors.push({ test: name, details });
  }
}

function logWarning(message) {
  console.log(`⚠️  WARNING: ${message}`);
  testResults.warnings++;
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

async function test1_DatabaseConnection() {
  logSection('TEST 1: DATABASE CONNECTION');

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    if (error) {
      logTest('Database Connection', false, `Error: ${error.message}`);
      return false;
    }

    logTest('Database Connection', true, 'Successfully connected to Supabase');
    return true;
  } catch (err) {
    logTest('Database Connection', false, `Exception: ${err.message}`);
    return false;
  }
}

async function test2_ProjectExists() {
  logSection('TEST 2: PROJECT EXISTENCE');

  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', TEST_PROJECT_ID)
      .single();

    if (error && error.code === 'PGRST116') {
      logTest('Project Exists', false, `Project '${TEST_PROJECT_ID}' not found in database`);
      logInfo('This is the ROOT CAUSE! The project must exist before milestones can be saved.');
      logInfo('Solution: Run the database initialization script to create the project.');
      return { exists: false, project: null };
    }

    if (error) {
      logTest('Project Exists', false, `Error: ${error.message}`);
      return { exists: false, project: null };
    }

    logTest('Project Exists', true, `Project '${TEST_PROJECT_ID}' found in database`);
    logInfo(`   Name: ${project.name}`);
    logInfo(`   Status: ${project.status}`);
    logInfo(`   Progress: ${project.overall_progress}%`);

    return { exists: true, project };
  } catch (err) {
    logTest('Project Exists', false, `Exception: ${err.message}`);
    return { exists: false, project: null };
  }
}

async function test3_MilestoneStructure() {
  logSection('TEST 3: MILESTONE STRUCTURE');

  try {
    const { data: milestones, error } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('project_id', TEST_PROJECT_ID)
      .order('order', { ascending: true });

    if (error) {
      logTest('Fetch Milestones', false, `Error: ${error.message}`);
      return { milestones: [] };
    }

    if (!milestones || milestones.length === 0) {
      logTest('Milestone Count', false, `No milestones found for project '${TEST_PROJECT_ID}'`);
      logInfo('This is a ROOT CAUSE! Milestones must exist before deliverables can be saved.');
      logInfo('Solution: Run the database initialization script to create milestones.');
      return { milestones: [] };
    }

    logTest('Milestone Count', true, `Found ${milestones.length} milestones`);

    // Check each milestone structure
    let allValid = true;
    milestones.forEach((m, idx) => {
      logInfo(`\n   Milestone ${idx + 1}: ${m.name} (${m.id})`);
      logInfo(`      Status: ${m.status}`);
      logInfo(`      Progress: ${m.progress}%`);
      logInfo(`      Deliverables: ${m.deliverables ? m.deliverables.length : 0}`);

      if (!m.deliverables) {
        logWarning(`Milestone '${m.id}' has no deliverables array`);
        allValid = false;
      } else if (m.deliverables.length === 0) {
        logWarning(`Milestone '${m.id}' has empty deliverables array`);
      } else {
        // Show first deliverable structure
        const firstDel = m.deliverables[0];
        logInfo(`      Sample deliverable: { id: ${firstDel.id}, completed: ${firstDel.completed}, text: "${firstDel.text}" }`);
      }
    });

    logTest('Milestone Structure', allValid, allValid ? 'All milestones have valid structure' : 'Some milestones missing deliverables');

    return { milestones };
  } catch (err) {
    logTest('Milestone Structure', false, `Exception: ${err.message}`);
    return { milestones: [] };
  }
}

async function test4_DeliverableSaveOperation() {
  logSection('TEST 4: DELIVERABLE SAVE OPERATION');

  try {
    // First, get the current milestone
    const { data: milestone, error: fetchError } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('id', TEST_MILESTONE_ID)
      .single();

    if (fetchError) {
      logTest('Fetch Milestone for Save', false, `Error: ${fetchError.message}`);
      return { success: false };
    }

    logTest('Fetch Milestone for Save', true, `Retrieved milestone '${TEST_MILESTONE_ID}'`);

    if (!milestone.deliverables || milestone.deliverables.length === 0) {
      logTest('Deliverable Array Check', false, 'Milestone has no deliverables to toggle');
      return { success: false };
    }

    logTest('Deliverable Array Check', true, `Found ${milestone.deliverables.length} deliverables`);

    // Find the test deliverable
    const testDeliverable = milestone.deliverables.find(d => d.id === TEST_DELIVERABLE_ID);
    if (!testDeliverable) {
      logTest('Find Test Deliverable', false, `Deliverable '${TEST_DELIVERABLE_ID}' not found`);
      logInfo(`Available IDs: ${milestone.deliverables.map(d => d.id).join(', ')}`);
      return { success: false };
    }

    logTest('Find Test Deliverable', true, `Found deliverable '${TEST_DELIVERABLE_ID}'`);
    logInfo(`   Current state: completed = ${testDeliverable.completed}`);

    // Toggle the deliverable
    const newState = !testDeliverable.completed;
    const updatedDeliverables = milestone.deliverables.map(d =>
      d.id === TEST_DELIVERABLE_ID ? { ...d, completed: newState } : d
    );

    logInfo(`   Toggling to: completed = ${newState}`);

    // Save to database
    const { data: updated, error: updateError } = await supabase
      .from('project_milestones')
      .update({ deliverables: updatedDeliverables })
      .eq('id', TEST_MILESTONE_ID)
      .select()
      .single();

    if (updateError) {
      logTest('Save Deliverable Update', false, `Error: ${updateError.message}`);
      return { success: false };
    }

    logTest('Save Deliverable Update', true, 'Successfully saved to database');

    // Verify the save immediately
    const savedDeliverable = updated.deliverables.find(d => d.id === TEST_DELIVERABLE_ID);
    if (savedDeliverable.completed === newState) {
      logTest('Verify Immediate Save', true, `Confirmed: deliverable is now ${newState ? 'completed' : 'not completed'}`);
      return { success: true, newState };
    } else {
      logTest('Verify Immediate Save', false, `State mismatch: expected ${newState}, got ${savedDeliverable.completed}`);
      return { success: false };
    }

  } catch (err) {
    logTest('Deliverable Save Operation', false, `Exception: ${err.message}`);
    return { success: false };
  }
}

async function test5_DeliverableLoadOperation() {
  logSection('TEST 5: DELIVERABLE LOAD OPERATION (Simulating Page Refresh)');

  try {
    // Simulate what happens when page refreshes - load from database
    const { data: milestone, error } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('id', TEST_MILESTONE_ID)
      .single();

    if (error) {
      logTest('Load Milestone', false, `Error: ${error.message}`);
      return { loaded: false };
    }

    logTest('Load Milestone', true, `Loaded milestone from database`);

    const deliverable = milestone.deliverables.find(d => d.id === TEST_DELIVERABLE_ID);
    if (!deliverable) {
      logTest('Find Deliverable in Loaded Data', false, `Deliverable '${TEST_DELIVERABLE_ID}' not found`);
      return { loaded: false };
    }

    logTest('Find Deliverable in Loaded Data', true, `Found deliverable`);
    logInfo(`   Loaded state: completed = ${deliverable.completed}`);

    return { loaded: true, state: deliverable.completed };
  } catch (err) {
    logTest('Deliverable Load Operation', false, `Exception: ${err.message}`);
    return { loaded: false };
  }
}

async function test6_PersistenceVerification() {
  logSection('TEST 6: PERSISTENCE VERIFICATION (Full Cycle)');

  try {
    // Step 1: Get current state
    logInfo('Step 1: Getting current state...');
    const { data: before, error: beforeError } = await supabase
      .from('project_milestones')
      .select('deliverables')
      .eq('id', TEST_MILESTONE_ID)
      .single();

    if (beforeError) {
      logTest('Get Initial State', false, `Error: ${beforeError.message}`);
      return { persists: false };
    }

    const initialDeliverable = before.deliverables.find(d => d.id === TEST_DELIVERABLE_ID);
    const initialState = initialDeliverable.completed;
    logTest('Get Initial State', true, `Current state: ${initialState}`);

    // Step 2: Toggle it
    logInfo('\nStep 2: Toggling deliverable...');
    const toggledDeliverables = before.deliverables.map(d =>
      d.id === TEST_DELIVERABLE_ID ? { ...d, completed: !initialState } : d
    );

    const { error: toggleError } = await supabase
      .from('project_milestones')
      .update({ deliverables: toggledDeliverables })
      .eq('id', TEST_MILESTONE_ID);

    if (toggleError) {
      logTest('Toggle Deliverable', false, `Error: ${toggleError.message}`);
      return { persists: false };
    }

    logTest('Toggle Deliverable', true, `Toggled to: ${!initialState}`);

    // Step 3: Wait a moment (simulate network delay)
    logInfo('\nStep 3: Waiting 1 second (simulating network delay)...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Load fresh from database
    logInfo('\nStep 4: Loading fresh from database (simulating page refresh)...');
    const { data: after, error: afterError } = await supabase
      .from('project_milestones')
      .select('deliverables')
      .eq('id', TEST_MILESTONE_ID)
      .single();

    if (afterError) {
      logTest('Load After Toggle', false, `Error: ${afterError.message}`);
      return { persists: false };
    }

    const afterDeliverable = after.deliverables.find(d => d.id === TEST_DELIVERABLE_ID);
    const afterState = afterDeliverable.completed;
    logTest('Load After Toggle', true, `Loaded state: ${afterState}`);

    // Step 5: Verify persistence
    logInfo('\nStep 5: Verifying persistence...');
    if (afterState === !initialState) {
      logTest('PERSISTENCE CHECK', true, `✅ State persisted correctly! (${initialState} → ${afterState})`);

      // Toggle back to original state
      const restoredDeliverables = after.deliverables.map(d =>
        d.id === TEST_DELIVERABLE_ID ? { ...d, completed: initialState } : d
      );
      await supabase
        .from('project_milestones')
        .update({ deliverables: restoredDeliverables })
        .eq('id', TEST_MILESTONE_ID);
      logInfo('   Restored original state for clean test');

      return { persists: true };
    } else {
      logTest('PERSISTENCE CHECK', false, `❌ State did NOT persist! Expected ${!initialState}, got ${afterState}`);
      return { persists: false };
    }

  } catch (err) {
    logTest('Persistence Verification', false, `Exception: ${err.message}`);
    return { persists: false };
  }
}

async function test7_ProjectLoadFlow() {
  logSection('TEST 7: PROJECT LOAD FLOW (What Frontend Does)');

  try {
    // This simulates what PulseOfProject.tsx does
    logInfo('Simulating: ProjectTrackingService.getProject()...');

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        milestones:project_milestones(*),
        tasks:project_tasks(*),
        team:project_team_members(*),
        risks:project_risks(*)
      `)
      .eq('id', TEST_PROJECT_ID)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logTest('Load Project with Relations', false, `Project '${TEST_PROJECT_ID}' not found`);
        logInfo('❗ ROOT CAUSE IDENTIFIED:');
        logInfo('   The project does not exist in the projects table!');
        logInfo('   When page refreshes, it tries to load the project but gets nothing.');
        logInfo('   So it falls back to default project data (with all checkboxes unchecked).');
        logInfo('\n   SOLUTION: Create the project in the projects table first.');
        return { projectExists: false };
      }

      logTest('Load Project with Relations', false, `Error: ${error.message}`);
      return { projectExists: false };
    }

    logTest('Load Project with Relations', true, 'Successfully loaded project');
    logInfo(`   Project: ${project.name}`);
    logInfo(`   Milestones: ${project.milestones?.length || 0}`);
    logInfo(`   Tasks: ${project.tasks?.length || 0}`);

    if (project.milestones && project.milestones.length > 0) {
      const testMilestone = project.milestones.find(m => m.id === TEST_MILESTONE_ID);
      if (testMilestone) {
        const testDeliverable = testMilestone.deliverables?.find(d => d.id === TEST_DELIVERABLE_ID);
        if (testDeliverable) {
          logTest('Deliverable in Project Load', true, `Found deliverable in loaded project`);
          logInfo(`   State: completed = ${testDeliverable.completed}`);
          return { projectExists: true, deliverableState: testDeliverable.completed };
        } else {
          logTest('Deliverable in Project Load', false, `Deliverable not found in milestone`);
        }
      } else {
        logTest('Milestone in Project Load', false, `Test milestone not found in project`);
      }
    } else {
      logTest('Milestones in Project', false, `No milestones loaded with project`);
    }

    return { projectExists: true };
  } catch (err) {
    logTest('Project Load Flow', false, `Exception: ${err.message}`);
    return { projectExists: false };
  }
}

async function test8_EndToEndFlow() {
  logSection('TEST 8: END-TO-END FLOW (Complete User Journey)');

  try {
    logInfo('Simulating complete user flow:');
    logInfo('1. Page loads → 2. User clicks checkbox → 3. Page refreshes → 4. Verify checkbox state\n');

    // Step 1: Page Load
    logInfo('STEP 1: Page loads (user opens browser)...');
    const { data: initialProject } = await supabase
      .from('projects')
      .select('*, milestones:project_milestones(*)')
      .eq('id', TEST_PROJECT_ID)
      .single();

    if (!initialProject) {
      logTest('Initial Page Load', false, 'Project not found - page would show default data');
      return { success: false, reason: 'PROJECT_NOT_FOUND' };
    }

    const initialMilestone = initialProject.milestones.find(m => m.id === TEST_MILESTONE_ID);
    if (!initialMilestone) {
      logTest('Initial Page Load', false, 'Milestone not found');
      return { success: false, reason: 'MILESTONE_NOT_FOUND' };
    }

    const initialDeliverable = initialMilestone.deliverables?.find(d => d.id === TEST_DELIVERABLE_ID);
    if (!initialDeliverable) {
      logTest('Initial Page Load', false, 'Deliverable not found');
      return { success: false, reason: 'DELIVERABLE_NOT_FOUND' };
    }

    const initialState = initialDeliverable.completed;
    logTest('Initial Page Load', true, `Page loaded, deliverable state: ${initialState}`);

    // Step 2: User clicks checkbox
    logInfo('\nSTEP 2: User clicks checkbox (toggle action)...');
    const newState = !initialState;
    const updatedDeliverables = initialMilestone.deliverables.map(d =>
      d.id === TEST_DELIVERABLE_ID ? { ...d, completed: newState } : d
    );

    const { error: saveError } = await supabase
      .from('project_milestones')
      .update({ deliverables: updatedDeliverables })
      .eq('id', TEST_MILESTONE_ID);

    if (saveError) {
      logTest('Checkbox Click & Save', false, `Save failed: ${saveError.message}`);
      return { success: false, reason: 'SAVE_FAILED' };
    }

    logTest('Checkbox Click & Save', true, `Checkbox toggled and saved: ${initialState} → ${newState}`);

    // Step 3: Page refresh (simulate)
    logInfo('\nSTEP 3: User refreshes page (F5)...');
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const { data: refreshedProject } = await supabase
      .from('projects')
      .select('*, milestones:project_milestones(*)')
      .eq('id', TEST_PROJECT_ID)
      .single();

    if (!refreshedProject) {
      logTest('Page Refresh Load', false, 'Project not found after refresh!');
      return { success: false, reason: 'PROJECT_DISAPPEARED' };
    }

    const refreshedMilestone = refreshedProject.milestones.find(m => m.id === TEST_MILESTONE_ID);
    const refreshedDeliverable = refreshedMilestone?.deliverables?.find(d => d.id === TEST_DELIVERABLE_ID);
    const refreshedState = refreshedDeliverable?.completed;

    logTest('Page Refresh Load', true, `Page reloaded, deliverable state: ${refreshedState}`);

    // Step 4: Verify persistence
    logInfo('\nSTEP 4: Verifying checkbox state after refresh...');
    if (refreshedState === newState) {
      logTest('✨ END-TO-END SUCCESS', true, `Checkbox state PERSISTED! ${initialState} → ${newState} → ${refreshedState}`);
      logInfo('   🎉 The deliverable checkbox is working correctly!\n');

      // Clean up - restore original state
      const restoreDeliverables = refreshedMilestone.deliverables.map(d =>
        d.id === TEST_DELIVERABLE_ID ? { ...d, completed: initialState } : d
      );
      await supabase
        .from('project_milestones')
        .update({ deliverables: restoreDeliverables })
        .eq('id', TEST_MILESTONE_ID);
      logInfo('   Restored original state for clean test environment');

      return { success: true };
    } else {
      logTest('❌ END-TO-END FAILURE', false, `Checkbox did NOT persist! ${initialState} → ${newState} → ${refreshedState}`);
      logInfo('\n   🔍 DIAGNOSIS:');
      logInfo('   - Save operation: ✅ Worked');
      logInfo('   - Database storage: ✅ Worked');
      logInfo('   - Data retrieval: ❌ Failed or returned wrong data');
      logInfo('\n   Possible causes:');
      logInfo('   1. Project load returns stale/cached data');
      logInfo('   2. Frontend is using localStorage instead of database');
      logInfo('   3. Different project ID being used for save vs load');

      return { success: false, reason: 'STATE_MISMATCH' };
    }

  } catch (err) {
    logTest('End-to-End Flow', false, `Exception: ${err.message}`);
    return { success: false, reason: 'EXCEPTION' };
  }
}

function printSummary() {
  logSection('TEST SUMMARY');

  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⚠️  Warnings: ${testResults.warnings}`);

  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.errors.forEach((err, idx) => {
      console.log(`   ${idx + 1}. ${err.test}`);
      if (err.details) console.log(`      ${err.details}`);
    });
  }

  console.log('\n' + '='.repeat(80));

  if (testResults.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Deliverable persistence is working correctly.');
  } else {
    console.log('💡 RECOMMENDED ACTIONS:');
    console.log('   1. Review the failed tests above');
    console.log('   2. Fix the identified issues');
    console.log('   3. Run this script again to verify fixes');
    console.log('   4. Test in the actual browser UI');
  }

  console.log('='.repeat(80) + '\n');
}

async function runAllTests() {
  console.log('\n🔬 STARTING COMPREHENSIVE DELIVERABLE PERSISTENCE TEST');
  console.log('📅 ' + new Date().toISOString());
  console.log('🎯 Target: Deliverable checkbox save/load functionality\n');

  // Run tests in sequence
  const conn = await test1_DatabaseConnection();
  if (!conn) {
    console.log('\n❌ Cannot proceed - database connection failed');
    return;
  }

  const { exists: projectExists } = await test2_ProjectExists();
  const { milestones } = await test3_MilestoneStructure();

  if (projectExists && milestones.length > 0) {
    await test4_DeliverableSaveOperation();
    await test5_DeliverableLoadOperation();
    await test6_PersistenceVerification();
    await test7_ProjectLoadFlow();
    await test8_EndToEndFlow();
  } else {
    console.log('\n⚠️  CANNOT RUN SAVE/LOAD TESTS:');
    if (!projectExists) {
      console.log('   - Project does not exist in database');
    }
    if (milestones.length === 0) {
      console.log('   - No milestones found for project');
    }
    console.log('\n💡 Run the database initialization script first:');
    console.log('   node initialize-database.js');
  }

  printSummary();
}

// Run the tests
runAllTests().catch(err => {
  console.error('\n💥 FATAL ERROR:', err);
  process.exit(1);
});
