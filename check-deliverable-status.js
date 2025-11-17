// Check Deliverable Status in Database
// Shows what deliverables are checked/unchecked

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.VITE_BUGTRACKING_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_BUGTRACKING_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDeliverableStatus() {
  console.log('🔍 Checking Phase 1 Deliverables in Database...\n');

  try {
    // Get milestone-1 from database
    const { data: milestone, error } = await supabase
      .from('project_milestones')
      .select('id, name, deliverables')
      .eq('id', 'milestone-1')
      .single();

    if (error) throw error;

    console.log(`📋 ${milestone.name}`);
    console.log('─'.repeat(60));
    console.log('');

    if (milestone.deliverables && Array.isArray(milestone.deliverables)) {
      milestone.deliverables.forEach((deliverable, index) => {
        const status = deliverable.completed ? '✅ CHECKED' : '☐ UNCHECKED';
        const color = deliverable.completed ? '\x1b[32m' : '\x1b[90m';
        const reset = '\x1b[0m';

        console.log(`${color}${index + 1}. ${status}${reset} - ${deliverable.text}`);
        console.log(`   ID: ${deliverable.id}`);
        if (index < milestone.deliverables.length - 1) {
          console.log('');
        }
      });

      const checkedCount = milestone.deliverables.filter(d => d.completed).length;
      const totalCount = milestone.deliverables.length;
      const percentage = Math.round((checkedCount / totalCount) * 100);

      console.log('');
      console.log('='.repeat(60));
      console.log(`📊 Progress: ${checkedCount}/${totalCount} completed (${percentage}%)`);
      console.log('='.repeat(60));
    } else {
      console.log('⚠️  No deliverables found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDeliverableStatus();
