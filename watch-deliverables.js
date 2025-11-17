// Real-time Deliverable Watcher
// Shows live database status of deliverables

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.VITE_BUGTRACKING_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_BUGTRACKING_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function watchDeliverables() {
  console.clear();
  console.log('🔴 LIVE DATABASE WATCH - Press Ctrl+C to exit');
  console.log('📊 Watching: Phase 1 Deliverables');
  console.log('🔄 Auto-refreshing every 2 seconds...\n');
  console.log('='.repeat(70));

  const fetchData = async () => {
    try {
      const { data: milestone, error } = await supabase
        .from('project_milestones')
        .select('id, name, deliverables, updated_at')
        .eq('id', 'milestone-1')
        .single();

      if (error) throw error;

      const timestamp = new Date().toLocaleTimeString();

      console.clear();
      console.log('🔴 LIVE DATABASE WATCH - Press Ctrl+C to exit');
      console.log(`🕒 Last Updated: ${timestamp}`);
      console.log(`📅 Database Timestamp: ${new Date(milestone.updated_at).toLocaleString()}`);
      console.log('='.repeat(70));
      console.log(`\n📋 ${milestone.name}\n`);

      if (milestone.deliverables && Array.isArray(milestone.deliverables)) {
        milestone.deliverables.forEach((deliverable, index) => {
          const checkbox = deliverable.completed ? '✅' : '☐';
          const status = deliverable.completed ? '✅ CHECKED' : '☐ UNCHECKED';
          const color = deliverable.completed ? '\x1b[32m' : '\x1b[90m';
          const reset = '\x1b[0m';

          console.log(`${color}${checkbox} ${deliverable.text}${reset}`);
          console.log(`   ${status} | ID: ${deliverable.id}`);
        });

        const checkedCount = milestone.deliverables.filter(d => d.completed).length;
        const totalCount = milestone.deliverables.length;
        const percentage = Math.round((checkedCount / totalCount) * 100);

        console.log('\n' + '─'.repeat(70));
        console.log(`📊 Progress: ${checkedCount}/${totalCount} completed (${percentage}%)`);
        console.log('─'.repeat(70));
      }

      console.log('\n💡 TIP: Click checkboxes in browser and watch them update here!');
      console.log('🔄 Refreshing in 2 seconds...');

    } catch (error) {
      console.error('❌ Error fetching data:', error.message);
    }
  };

  // Initial fetch
  await fetchData();

  // Auto-refresh every 2 seconds
  const interval = setInterval(fetchData, 2000);

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('\n\n👋 Watch stopped. Database connection closed.');
    process.exit(0);
  });
}

watchDeliverables();
