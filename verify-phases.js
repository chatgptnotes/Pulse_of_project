// Verify All Phases in Database
// Shows what milestones exist for each project

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.VITE_BUGTRACKING_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_BUGTRACKING_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPhases() {
  console.log('🔍 Verifying Project Phases in Database...\n');

  try {
    // Get all projects
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .order('name');

    if (projectError) throw projectError;

    for (const project of projects) {
      console.log(`📋 ${project.name}`);
      console.log('─'.repeat(60));

      // Get milestones for this project
      const { data: milestones, error: milestoneError } = await supabase
        .from('project_milestones')
        .select('id, name, deliverables, start_date, end_date, progress, status')
        .eq('project_id', project.id)
        .order('order');

      if (milestoneError) throw milestoneError;

      if (milestones && milestones.length > 0) {
        milestones.forEach((milestone, index) => {
          const deliverableCount = Array.isArray(milestone.deliverables)
            ? milestone.deliverables.length
            : 0;

          const statusIcon = milestone.status === 'completed' ? '✅'
            : milestone.status === 'in-progress' ? '🔄'
            : '⏳';

          console.log(`  ${statusIcon} ${milestone.name}`);
          console.log(`     ID: ${milestone.id}`);
          console.log(`     Deliverables: ${deliverableCount}`);
          console.log(`     Progress: ${milestone.progress}%`);
          console.log(`     Dates: ${milestone.start_date.split('T')[0]} → ${milestone.end_date.split('T')[0]}`);

          if (index < milestones.length - 1) {
            console.log('');
          }
        });

        console.log('\n  📊 Total Phases: ' + milestones.length);

        const totalDeliverables = milestones.reduce((sum, m) => {
          return sum + (Array.isArray(m.deliverables) ? m.deliverables.length : 0);
        }, 0);
        console.log(`  📦 Total Deliverables: ${totalDeliverables}`);
      } else {
        console.log('  ⚠️  No milestones found');
      }

      console.log('\n');
    }

    console.log('='.repeat(60));
    console.log('✅ Verification Complete!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyPhases();
