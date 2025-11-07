// Apply the SNO generation function fix to the database
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const bugTrackingUrl = 'https://winhdjtlwhgdoinfrxch.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmhkanRsd2hnZG9pbmZyeGNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM1OTA1NCwiZXhwIjoyMDc2OTM1MDU0fQ.YRWXaHhsrAww6oNik72fDoxYa_SjQDPsoCE7si-1u9Q';

// Use service role key for admin operations
const supabase = createClient(bugTrackingUrl, serviceRoleKey);

async function applyFix() {
  console.log('🔧 Applying SNO generation function fix...\n');

  // Read the SQL file
  const sql = fs.readFileSync('fix-sno-generation.sql', 'utf8');

  console.log('📝 SQL to execute:');
  console.log(sql);
  console.log('\n');

  try {
    // Execute the SQL via RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Error executing SQL:', error.message);
      console.log('\n⚠️  The exec_sql function might not exist. You need to run this SQL manually in Supabase SQL Editor:');
      console.log('\n1. Go to https://supabase.com/dashboard/project/winhdjtlwhgdoinfrxch/sql');
      console.log('2. Copy the contents of fix-sno-generation.sql');
      console.log('3. Paste and run it');
      console.log('\nOr use the Supabase CLI:');
      console.log('supabase db push --db-url "postgresql://postgres.[password]@db.winhdjtlwhgdoinfrxch.supabase.co:5432/postgres"');
    } else {
      console.log('✅ Fix applied successfully!');
      console.log('   Result:', data);
    }
  } catch (err) {
    console.error('❌ Failed to apply fix:', err.message);
    console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/winhdjtlwhgdoinfrxch/sql');
    console.log('\nSQL:');
    console.log(sql);
  }

  // Test if the function works now
  console.log('\n🧪 Testing the function...');
  try {
    const { data, error } = await supabase.rpc('get_next_bug_sno', { project_name: 'test-project' });

    if (error) {
      console.error('❌ Function test failed:', error.message);
      console.log('\n⚠️  You need to run the SQL manually in Supabase SQL Editor');
    } else {
      console.log('✅ Function works! Next SNO for test-project:', data);
    }
  } catch (err) {
    console.error('❌ Function test error:', err.message);
  }

  console.log('\n🏁 Done!');
}

applyFix();
