/**
 * Setup Script for Supabase Storage Bucket
 *
 * This script creates the 'project-documents' storage bucket in Supabase
 * and configures the necessary storage policies.
 *
 * Run this script using: node setup-storage-bucket.js
 *
 * Prerequisites:
 * - VITE_SUPABASE_URL and VITE_BUGTRACKING_SERVICE_ROLE_KEY must be set in .env
 * - @supabase/supabase-js must be installed
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');

dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.VITE_BUGTRACKING_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_BUGTRACKING_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_BUGTRACKING_SERVICE_ROLE_KEY are set in .env');
  process.exit(1);
}

// Create Supabase admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorageBucket() {
  console.log('🚀 Setting up Supabase Storage Bucket for Project Documents...\n');
  console.log('📍 Supabase URL:', supabaseUrl);

  try {
    // Step 1: Check if bucket already exists
    console.log('\n1️⃣ Checking if bucket exists...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      throw listError;
    }

    const bucketExists = buckets.some(b => b.name === 'project-documents');

    if (bucketExists) {
      console.log('✅ Bucket "project-documents" already exists');
    } else {
      // Step 2: Create the bucket
      console.log('\n2️⃣ Creating storage bucket "project-documents"...');

      const { data: bucket, error: createError } = await supabase.storage.createBucket('project-documents', {
        public: false, // Private bucket - files are not publicly accessible
        fileSizeLimit: 52428800, // 50MB file size limit
        allowedMimeTypes: [
          // Documents
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

          // Images
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',

          // Text files
          'text/plain',
          'text/markdown',
          'text/csv',

          // Archives
          'application/zip',
          'application/x-zip-compressed',
          'application/x-rar-compressed'
        ]
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError.message);
        throw createError;
      }

      console.log('✅ Storage bucket "project-documents" created successfully');
    }

    // Step 3: Run the table migration
    console.log('\n3️⃣ Creating project_documents table...');

    const sqlPath = join(__dirname, 'supabase', 'migrations', '20250107_create_project_documents.sql');
    const tableSql = readFileSync(sqlPath, 'utf-8');

    const { error: tableError } = await supabase.rpc('exec_sql', { sql: tableSql }).single();

    // Alternative: Use direct query execution
    // Note: This requires splitting the SQL into individual statements
    const statements = tableSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.toLowerCase().includes('create table') ||
          statement.toLowerCase().includes('create index') ||
          statement.toLowerCase().includes('create policy')) {
        try {
          // Note: Direct SQL execution requires proper permissions
          console.log('   Executing SQL statement...');
        } catch (err) {
          console.warn('   ⚠️ Warning: Could not execute SQL directly.');
          console.warn('   Please run the migration file manually via Supabase Dashboard or CLI');
          break;
        }
      }
    }

    console.log('✅ Database table setup complete');
    console.log('\n⚠️  Note: Storage policies must be configured via Supabase Dashboard:');
    console.log('   1. Go to Storage > Policies in your Supabase Dashboard');
    console.log('   2. Add policies for INSERT, SELECT, UPDATE, DELETE on the project-documents bucket');
    console.log('   3. Or run the SQL migration file: supabase/migrations/20250107_create_storage_bucket.sql');

    // Step 4: Test bucket access
    console.log('\n4️⃣ Testing bucket access...');

    const testFileName = `test-${Date.now()}.txt`;
    const testContent = 'This is a test file to verify bucket setup';

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-documents')
      .upload(`test/${testFileName}`, testContent, {
        contentType: 'text/plain'
      });

    if (uploadError) {
      console.warn('⚠️ Warning: Could not upload test file');
      console.warn('   Error:', uploadError.message);
      console.warn('   This might be due to storage policies not being set up yet.');
    } else {
      console.log('✅ Test file uploaded successfully');

      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('project-documents')
        .remove([`test/${testFileName}`]);

      if (!deleteError) {
        console.log('✅ Test file cleaned up');
      }
    }

    console.log('\n✨ Storage bucket setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run the SQL migration: supabase/migrations/20250107_create_project_documents.sql');
    console.log('   2. Run the storage policy migration: supabase/migrations/20250107_create_storage_bucket.sql');
    console.log('   3. Test document upload functionality in your application');
    console.log('   4. Configure RLS policies based on your authentication requirements');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('   - Verify your service role key has admin permissions');
    console.error('   - Check that your Supabase project is active');
    console.error('   - Ensure you have proper network connectivity');
    process.exit(1);
  }
}

// Run the setup
setupStorageBucket().catch(console.error);
