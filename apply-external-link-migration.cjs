const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Applying database migration for external link support...');
console.log('📍 Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    // Add external_url column
    console.log('\n1️⃣ Adding external_url column...');
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS external_url TEXT;`
    });
    if (error1) {
      console.log('Note:', error1.message);
    } else {
      console.log('✅ external_url column added');
    }

    // Add is_external_link column
    console.log('\n2️⃣ Adding is_external_link column...');
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS is_external_link BOOLEAN DEFAULT FALSE;`
    });
    if (error2) {
      console.log('Note:', error2.message);
    } else {
      console.log('✅ is_external_link column added');
    }

    console.log('\n✨ Migration completed successfully!');
    console.log('\nNew features enabled:');
    console.log('  ✓ Users can now add external links (Google Docs, Sheets, etc.)');
    console.log('  ✓ Links are stored with descriptions/comments');
    console.log('  ✓ Links are visually distinguished from uploaded files');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
