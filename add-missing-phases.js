// Add Missing Phases (6-10) to NeuroSense360 Project
// This script adds the remaining 5 phases to complete the 10-phase project timeline

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.VITE_BUGTRACKING_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_BUGTRACKING_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Missing phases for NeuroSense360 (Phase 6-10)
const missingPhases = [
  {
    id: 'milestone-6',
    project_id: 'neurosense-mvp',
    name: 'Phase 6: Algorithm Integration',
    description: 'Integration of neuromodulation algorithms and brain mapping processing',
    status: 'pending',
    start_date: '2025-12-09',
    end_date: '2025-12-15',
    progress: 0,
    deliverables: [
      { id: 'del-6-1', text: 'Neuromodulation algorithm integration', completed: false },
      { id: 'del-6-2', text: 'Brain mapping data processing', completed: false },
      { id: 'del-6-3', text: 'Real-time feedback system', completed: false },
      { id: 'del-6-4', text: 'Algorithm optimization', completed: false },
      { id: 'del-6-5', text: 'Performance benchmarking', completed: false }
    ],
    assigned_to: ['Algorithm Team', 'Backend Team'],
    dependencies: ['milestone-5'],
    order: 6,
    color: '#06B6D4'
  },
  {
    id: 'milestone-7',
    project_id: 'neurosense-mvp',
    name: 'Phase 7: Notifications & Alerts',
    description: 'Implementation of comprehensive notification and alert system',
    status: 'pending',
    start_date: '2025-12-16',
    end_date: '2025-12-22',
    progress: 0,
    deliverables: [
      { id: 'del-7-1', text: 'Email notification system', completed: false },
      { id: 'del-7-2', text: 'SMS alerts integration', completed: false },
      { id: 'del-7-3', text: 'Push notifications (web/mobile)', completed: false },
      { id: 'del-7-4', text: 'Alert preferences management', completed: false },
      { id: 'del-7-5', text: 'Notification history tracking', completed: false }
    ],
    assigned_to: ['Backend Team', 'Frontend Team'],
    dependencies: ['milestone-6'],
    order: 7,
    color: '#14B8A6'
  },
  {
    id: 'milestone-8',
    project_id: 'neurosense-mvp',
    name: 'Phase 8: Testing & Quality Assurance',
    description: 'Comprehensive testing, quality assurance, and bug fixing',
    status: 'pending',
    start_date: '2025-12-23',
    end_date: '2025-12-29',
    progress: 0,
    deliverables: [
      { id: 'del-8-1', text: 'Unit testing (80%+ coverage)', completed: false },
      { id: 'del-8-2', text: 'Integration testing', completed: false },
      { id: 'del-8-3', text: 'End-to-end testing', completed: false },
      { id: 'del-8-4', text: 'Performance testing', completed: false },
      { id: 'del-8-5', text: 'Security audit', completed: false },
      { id: 'del-8-6', text: 'Bug fixing and optimization', completed: false }
    ],
    assigned_to: ['QA Team', 'Full Stack Team'],
    dependencies: ['milestone-7'],
    order: 8,
    color: '#F59E0B'
  },
  {
    id: 'milestone-9',
    project_id: 'neurosense-mvp',
    name: 'Phase 9: Deployment & Documentation',
    description: 'Production deployment setup and comprehensive documentation',
    status: 'pending',
    start_date: '2025-12-30',
    end_date: '2026-01-05',
    progress: 0,
    deliverables: [
      { id: 'del-9-1', text: 'Production deployment setup', completed: false },
      { id: 'del-9-2', text: 'CI/CD pipeline configuration', completed: false },
      { id: 'del-9-3', text: 'Technical documentation', completed: false },
      { id: 'del-9-4', text: 'User manuals', completed: false },
      { id: 'del-9-5', text: 'API documentation', completed: false },
      { id: 'del-9-6', text: 'Training materials', completed: false }
    ],
    assigned_to: ['DevOps', 'Technical Writer'],
    dependencies: ['milestone-8'],
    order: 9,
    color: '#EF4444'
  },
  {
    id: 'milestone-10',
    project_id: 'neurosense-mvp',
    name: 'Phase 10: Launch & Handover',
    description: 'Final production launch and project handover',
    status: 'pending',
    start_date: '2026-01-06',
    end_date: '2026-01-12',
    progress: 0,
    deliverables: [
      { id: 'del-10-1', text: 'Production launch', completed: false },
      { id: 'del-10-2', text: 'User training sessions', completed: false },
      { id: 'del-10-3', text: 'Knowledge transfer', completed: false },
      { id: 'del-10-4', text: 'Post-launch support setup', completed: false },
      { id: 'del-10-5', text: 'Final project handover', completed: false }
    ],
    assigned_to: ['Project Manager', 'Full Team'],
    dependencies: ['milestone-9'],
    order: 10,
    color: '#DC2626'
  }
];

async function addMissingPhases() {
  console.log('🚀 Adding missing phases (6-10) to NeuroSense360 MVP...\n');

  try {
    let addedCount = 0;
    let skippedCount = 0;

    for (const phase of missingPhases) {
      // Check if phase already exists
      const { data: existing, error: checkError } = await supabase
        .from('project_milestones')
        .select('id')
        .eq('id', phase.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Phase doesn't exist, add it
        const { error: insertError } = await supabase
          .from('project_milestones')
          .insert(phase);

        if (insertError) {
          console.error(`  ❌ Error adding ${phase.name}:`, insertError.message);
        } else {
          console.log(`  ✅ Added: ${phase.name}`);
          console.log(`     - Deliverables: ${phase.deliverables.length}`);
          console.log(`     - Date: ${phase.start_date} to ${phase.end_date}`);
          addedCount++;
        }
      } else if (existing) {
        console.log(`  ⏭️  Skipped: ${phase.name} (already exists)`);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Process Complete!`);
    console.log(`   - Added: ${addedCount} phases`);
    console.log(`   - Skipped: ${skippedCount} phases (already existed)`);

    if (addedCount > 0) {
      console.log('\n📝 Next steps:');
      console.log('1. Restart your browser (hard refresh: Cmd+Shift+R)');
      console.log('2. Navigate to: http://localhost:3000/pulseofproject?project=neurosense-mvp');
      console.log('3. Scroll down to see all 10 phases in the Gantt chart');
      console.log('4. Expand any phase to see deliverables with checkboxes');
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
addMissingPhases();
