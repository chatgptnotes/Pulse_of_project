#!/usr/bin/env node

/**
 * Git Hooks Setup Script
 * Installs the pre-push hook to automatically bump versions
 * Usage: node scripts/setup-git-hooks.js
 */

import { readFileSync, writeFileSync, chmodSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GIT_HOOKS_DIR = join(__dirname, '../.git/hooks');
const PRE_PUSH_HOOK = join(GIT_HOOKS_DIR, 'pre-push');
const PRE_PUSH_SCRIPT = join(__dirname, 'pre-push-hook.sh');

function setupGitHooks() {
  console.log('🔧 Setting up Git hooks for automatic versioning...');

  try {
    // Check if .git directory exists
    if (!existsSync(join(__dirname, '../.git'))) {
      console.log('⚠️  Not a git repository. Skipping hook setup.');
      console.log('💡 Run this script after initializing git with: git init');
      return;
    }

    // Create hooks directory if it doesn't exist
    if (!existsSync(GIT_HOOKS_DIR)) {
      mkdirSync(GIT_HOOKS_DIR, { recursive: true });
      console.log('📁 Created .git/hooks directory');
    }

    // Check if pre-push script exists
    if (!existsSync(PRE_PUSH_SCRIPT)) {
      console.error('❌ Error: pre-push-hook.sh not found');
      console.error(`   Expected at: ${PRE_PUSH_SCRIPT}`);
      process.exit(1);
    }

    // Read the pre-push script
    const hookContent = readFileSync(PRE_PUSH_SCRIPT, 'utf-8');

    // Write to .git/hooks/pre-push
    writeFileSync(PRE_PUSH_HOOK, hookContent, 'utf-8');

    // Make it executable (Unix-like systems)
    if (process.platform !== 'win32') {
      chmodSync(PRE_PUSH_HOOK, 0o755);
    }

    console.log('✅ Pre-push hook installed successfully!');
    console.log(`📍 Location: ${PRE_PUSH_HOOK}`);
    console.log('');
    console.log('🎉 Automatic version bumping is now enabled!');
    console.log('📝 Version will auto-increment with every git push');
    console.log('');
    console.log('To test the hook:');
    console.log('  git add .');
    console.log('  git commit -m "test commit"');
    console.log('  git push');
    console.log('');

  } catch (error) {
    console.error('❌ Error setting up Git hooks:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupGitHooks();
}

export { setupGitHooks };
