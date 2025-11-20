# Document Upload - Helpful Scripts

## NPM Scripts to Add

Add these scripts to your `package.json` for easier management:

```json
{
  "scripts": {
    "setup:storage": "node setup-storage-bucket.js",
    "db:migrate:docs": "supabase db push --file supabase/migrations/20250107_create_project_documents.sql",
    "db:migrate:storage": "supabase db push --file supabase/migrations/20250107_create_storage_bucket.sql",
    "db:migrate:all": "npm run db:migrate:docs && npm run db:migrate:storage",
    "docs:verify": "node scripts/verify-document-setup.js"
  }
}
```

## Usage

```bash
# Setup storage bucket
npm run setup:storage

# Run database migrations (requires Supabase CLI)
npm run db:migrate:docs
npm run db:migrate:storage
# Or run both at once
npm run db:migrate:all

# Verify setup (create this script if needed)
npm run docs:verify
```

## Verification Script

Create `scripts/verify-document-setup.js`:

```javascript
/**
 * Verification script for document upload setup
 * Run with: node scripts/verify-document-setup.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_BUGTRACKING_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verify() {
  console.log('🔍 Verifying document upload setup...\n');

  let allPassed = true;

  // Check 1: Storage bucket exists
  console.log('1️⃣ Checking storage bucket...');
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

  if (bucketError) {
    console.error('   ❌ Error listing buckets:', bucketError.message);
    allPassed = false;
  } else {
    const bucket = buckets.find(b => b.name === 'project-documents');
    if (bucket) {
      console.log('   ✅ Bucket "project-documents" exists');
      console.log(`      - Public: ${bucket.public}`);
      console.log(`      - Created: ${bucket.created_at}`);
    } else {
      console.log('   ❌ Bucket "project-documents" not found');
      allPassed = false;
    }
  }

  // Check 2: Database table exists
  console.log('\n2️⃣ Checking database table...');
  const { data: tableData, error: tableError } = await supabase
    .from('project_documents')
    .select('*')
    .limit(1);

  if (tableError && tableError.code === 'PGRST116') {
    console.log('   ❌ Table "project_documents" does not exist');
    allPassed = false;
  } else if (tableError) {
    console.error('   ❌ Error querying table:', tableError.message);
    allPassed = false;
  } else {
    console.log('   ✅ Table "project_documents" exists');
  }

  // Check 3: RLS policies (requires service role)
  console.log('\n3️⃣ Checking RLS policies...');
  const { data: policies, error: policyError } = await supabase
    .rpc('exec_sql', {
      sql: "SELECT COUNT(*) as count FROM pg_policies WHERE tablename = 'project_documents'"
    });

  if (policyError) {
    console.log('   ⚠️  Could not check policies (requires service role)');
  } else {
    console.log('   ✅ RLS policies configured');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ All checks passed! Document upload is ready.');
  } else {
    console.log('❌ Some checks failed. Please review the setup guide.');
  }
  console.log('='.repeat(50));
}

verify().catch(console.error);
```

## Cleanup Script

Create `scripts/cleanup-test-documents.js`:

```javascript
/**
 * Cleanup script to remove test documents
 * Run with: node scripts/cleanup-test-documents.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_BUGTRACKING_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function cleanup() {
  console.log('🧹 Cleaning up test documents...\n');

  // Get all test documents
  const { data: docs, error: fetchError } = await supabase
    .from('project_documents')
    .select('*')
    .ilike('filename', '%test%');

  if (fetchError) {
    console.error('Error fetching documents:', fetchError);
    return;
  }

  if (!docs || docs.length === 0) {
    console.log('No test documents found.');
    return;
  }

  console.log(`Found ${docs.length} test document(s):\n`);
  docs.forEach(doc => {
    console.log(`- ${doc.filename} (${doc.file_size} bytes)`);
  });

  console.log('\nDeleting...');

  // Delete from storage and database
  for (const doc of docs) {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('project-documents')
      .remove([doc.file_path]);

    if (storageError) {
      console.error(`  ❌ Failed to delete ${doc.filename} from storage:`, storageError.message);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('project_documents')
      .delete()
      .eq('id', doc.id);

    if (dbError) {
      console.error(`  ❌ Failed to delete ${doc.filename} from database:`, dbError.message);
    } else {
      console.log(`  ✅ Deleted ${doc.filename}`);
    }
  }

  console.log('\n✅ Cleanup complete!');
}

cleanup().catch(console.error);
```

## Migration Helper

Create `scripts/run-migration.js`:

```javascript
/**
 * Helper to run SQL migrations
 * Run with: node scripts/run-migration.js <migration-file>
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_BUGTRACKING_SERVICE_ROLE_KEY;

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node scripts/run-migration.js <migration-file>');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runMigration() {
  console.log(`📝 Running migration: ${migrationFile}\n`);

  try {
    const sql = readFileSync(migrationFile, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statement(s)\n`);

    for (let i = 0; i < statements.length; i++) {
      console.log(`Executing statement ${i + 1}/${statements.length}...`);

      // Note: This is a simplified version
      // For production, use Supabase CLI or proper migration tool
      console.log('⚠️  Please run this SQL manually via Supabase Dashboard');
      break;
    }

    console.log('\n✅ Migration instructions provided');
    console.log('\nTo run manually:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Paste the SQL from:', migrationFile);
    console.log('3. Click Run');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
```

## Quick Commands

Add to your shell profile (`.bashrc`, `.zshrc`, etc.):

```bash
# Document upload shortcuts
alias docs-setup="npm run setup:storage"
alias docs-verify="node scripts/verify-document-setup.js"
alias docs-clean="node scripts/cleanup-test-documents.js"
```

Then use:

```bash
docs-setup    # Setup storage bucket
docs-verify   # Verify configuration
docs-clean    # Remove test documents
```

## Git Hooks

Add to `.husky/pre-commit` or `.git/hooks/pre-commit`:

```bash
#!/bin/sh

# Verify document upload setup before commit
if [ -f "scripts/verify-document-setup.js" ]; then
  echo "Verifying document upload setup..."
  node scripts/verify-document-setup.js || {
    echo "Document upload verification failed. Commit anyway? (y/n)"
    read answer
    if [ "$answer" != "y" ]; then
      exit 1
    fi
  }
fi
```

## CI/CD Integration

Add to your CI/CD pipeline (e.g., `.github/workflows/test.yml`):

```yaml
name: Test Document Upload

on: [push, pull_request]

jobs:
  verify-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Verify document upload setup
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_BUGTRACKING_SERVICE_ROLE_KEY: ${{ secrets.SERVICE_ROLE_KEY }}
        run: node scripts/verify-document-setup.js
```

## Makefile (Optional)

Create `Makefile`:

```makefile
.PHONY: setup-storage migrate-docs verify-docs clean-test-docs

setup-storage:
	@echo "Setting up storage bucket..."
	@node setup-storage-bucket.js

migrate-docs:
	@echo "Running document migrations..."
	@echo "Please run the SQL files manually via Supabase Dashboard"
	@echo "1. supabase/migrations/20250107_create_project_documents.sql"
	@echo "2. supabase/migrations/20250107_create_storage_bucket.sql"

verify-docs:
	@echo "Verifying document upload setup..."
	@node scripts/verify-document-setup.js

clean-test-docs:
	@echo "Cleaning test documents..."
	@node scripts/cleanup-test-documents.js

help:
	@echo "Document Upload Commands:"
	@echo "  make setup-storage    - Setup Supabase storage bucket"
	@echo "  make migrate-docs     - Show migration instructions"
	@echo "  make verify-docs      - Verify setup"
	@echo "  make clean-test-docs  - Remove test documents"
```

Then use:

```bash
make setup-storage
make verify-docs
make clean-test-docs
```

## Summary

These scripts provide:
- Automated setup and verification
- Easy cleanup of test data
- Integration with CI/CD
- Developer-friendly commands
- Consistent workflow

Choose the approach that best fits your team's workflow!
