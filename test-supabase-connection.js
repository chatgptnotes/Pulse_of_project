/**
 * Simple test script for Supabase connection
 * Run with: node test-supabase-connection.js
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

console.log('🧪 Testing Supabase Connection');
console.log('==============================');

async function testSupabaseConnection() {
  try {
    // Get environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    console.log('\n📋 Environment Check:');
    console.log('- Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('- Supabase Key:', supabaseKey ? 'Set (first 20 chars): ' + supabaseKey.substring(0, 20) + '...' : 'Missing');

    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Missing required environment variables');
      return;
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created');

    // Test 1: Check connection by trying to access a system table
    console.log('\n📋 Test 1: Testing connection...');
    try {
      const { data, error } = await supabase
        .from('bug_reports')
        .select('id')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          console.log('⚠️ bug_reports table does not exist (expected if not deployed yet)');
          console.log('✅ Connection successful, but tables need to be created');
        } else {
          console.log('❌ Connection error:', error.message);
          return;
        }
      } else {
        console.log('✅ Connection successful, found', data?.length || 0, 'bug reports');
      }
    } catch (connectionError) {
      console.log('❌ Connection failed:', connectionError.message);
      return;
    }

    // Test 2: Test storage access
    console.log('\n📋 Test 2: Testing storage access...');
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

      if (bucketsError) {
        console.log('⚠️ Storage access error:', bucketsError.message);
      } else {
        console.log('✅ Storage accessible, found', buckets?.length || 0, 'buckets');
        const bugImagesBucket = buckets?.find(b => b.id === 'bug-report-images');
        if (bugImagesBucket) {
          console.log('✅ bug-report-images bucket exists');
        } else {
          console.log('⚠️ bug-report-images bucket not found (needs to be created)');
        }
      }
    } catch (storageError) {
      console.log('⚠️ Storage test failed:', storageError.message);
    }

    console.log('\n🎉 Connection test completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Deploy the migrations by running deploy-migrations.sql in Supabase SQL Editor');
    console.log('2. Create the bug-report-images storage bucket if it doesn\'t exist');
    console.log('3. Configure RLS policies in Supabase Dashboard');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test
testSupabaseConnection().then(() => {
  console.log('\n✨ Test execution completed');
}).catch((error) => {
  console.error('\n💥 Test execution failed:', error);
});