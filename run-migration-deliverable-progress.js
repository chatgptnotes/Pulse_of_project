// Script to create deliverable_progress table in Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://winhdjtlwhgdoinfrxch.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmhkanRsd2hnZG9pbmZyeGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkwNTQsImV4cCI6MjA3NjkzNTA1NH0.IKxXiHRZiJI4UXfbAiYThXcsvdx04vqx0ejQs8LhkGU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('\n🚀 Creating deliverable_progress table in Supabase...\n');

  try {
    // Read SQL file
    const sql = readFileSync('./supabase-migrations/create-deliverable-progress-table.sql', 'utf-8');

    console.log('📝 SQL Migration:\n');
    console.log('─'.repeat(60));
    console.log(sql.substring(0, 500) + '...\n');
    console.log('─'.repeat(60));

    console.log('\n⚠️  NOTE: This script uses anon key which may not have permission to run DDL.');
    console.log('You need to run this SQL in Supabase Dashboard:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/winhdjtlwhgdoinfrxch');
    console.log('2. Click "SQL Editor" in the left sidebar');
    console.log('3. Create a new query');
    console.log('4. Copy the SQL from: ./supabase-migrations/create-deliverable-progress-table.sql');
    console.log('5. Click "Run" to execute\n');

    // Test if table already exists by trying to select from it
    console.log('🔍 Checking if table already exists...');
    const { data, error } = await supabase
      .from('deliverable_progress')
      .select('count')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Table does not exist yet.');
        console.log('\n📋 Please run the SQL migration in Supabase Dashboard (see instructions above)\n');
      } else {
        console.error('❌ Error:', error.message);
      }
    } else {
      console.log('✅ Table already exists!');
      console.log('✅ Migration complete!\n');

      // Now migrate existing data
      console.log('🔄 Migrating existing deliverable data...');
      await migrateExistingData();
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

async function migrateExistingData() {
  try {
    // Get all milestones with deliverables
    const { data: milestones, error: fetchError } = await supabase
      .from('project_milestones')
      .select('id, project_id, deliverables');

    if (fetchError) {
      console.error('❌ Error fetching milestones:', fetchError.message);
      return;
    }

    console.log(`📦 Found ${milestones.length} milestones to migrate`);

    let totalDeliverables = 0;
    const deliverableRecords = [];

    // Convert deliverables to individual records
    milestones.forEach(milestone => {
      if (milestone.deliverables && milestone.deliverables.length > 0) {
        milestone.deliverables.forEach(deliverable => {
          deliverableRecords.push({
            project_id: milestone.project_id,
            milestone_id: milestone.id,
            deliverable_id: deliverable.id,
            deliverable_text: deliverable.text,
            completed: deliverable.completed || false,
            completed_at: deliverable.completed ? new Date().toISOString() : null,
            completed_by: null
          });
          totalDeliverables++;
        });
      }
    });

    console.log(`📋 Migrating ${totalDeliverables} deliverables...`);

    if (deliverableRecords.length > 0) {
      // Use upsert to avoid duplicates
      const { data, error: insertError } = await supabase
        .from('deliverable_progress')
        .upsert(deliverableRecords, {
          onConflict: 'project_id,milestone_id,deliverable_id'
        });

      if (insertError) {
        console.error('❌ Error migrating data:', insertError.message);
      } else {
        console.log(`✅ Successfully migrated ${totalDeliverables} deliverables!`);
      }
    }

    console.log('\n✅ Data migration complete!\n');

  } catch (error) {
    console.error('❌ Data migration failed:', error);
  }
}

// Run migration
runMigration().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
