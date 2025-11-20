// Apply nullable fields fix to bug_reports table
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const bugTrackingUrl = 'https://winhdjtlwhgdoinfrxch.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmhkanRsd2hnZG9pbmZyeGNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM1OTA1NCwiZXhwIjoyMDc2OTM1MDU0fQ.YRWXaHhsrAww6oNik72fDoxYa_SjQDPsoCE7si-1u9Q';

const supabase = createClient(bugTrackingUrl, serviceRoleKey);

async function applyNullableFix() {
  console.log('🔧 Applying nullable fields fix...\n');

  const sql = fs.readFileSync('fix-nullable-fields.sql', 'utf8');

  console.log('📝 SQL to execute:');
  console.log(sql);
  console.log('\n');

  console.log('⚠️  This SQL needs to be run manually in Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/winhdjtlwhgdoinfrxch/sql\n');

  // Let's test if we can create a bug now without reported_by
  console.log('🧪 Testing bug creation after you run the SQL...');
  console.log('   Please run the SQL above first, then press Enter to test');
  console.log('   Or skip and run this script again after running the SQL');

  console.log('\n📋 QUICK FIX INSTRUCTIONS:');
  console.log('1. Open: https://supabase.com/dashboard/project/winhdjtlwhgdoinfrxch/sql');
  console.log('2. Copy and paste the SQL from fix-nullable-fields.sql');
  console.log('3. Click "RUN" button');
  console.log('4. Come back to the browser and try adding an issue again');
}

applyNullableFix();
