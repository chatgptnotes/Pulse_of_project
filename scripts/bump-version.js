#!/usr/bin/env node

/**
 * Version Bumping Script
 * Automatically increments the patch version (x.y.Z) in package.json
 * Usage: node scripts/bump-version.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { cwd } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PACKAGE_JSON_PATH = join(cwd(), 'apps/web/package.json');

function bumpVersion() {
  try {
    // Read package.json
    const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    const currentVersion = packageJson.version;

    console.log(`📦 Current version: ${currentVersion}`);

    // Parse version
    const versionParts = currentVersion.split('.');
    const major = parseInt(versionParts[0]) || 1;
    const minor = parseInt(versionParts[1]) || 0;
    const patch = parseInt(versionParts[2]) || 0;

    // Increment patch version
    const newVersion = `${major}.${minor}.${patch + 1}`;

    // Update package.json
    packageJson.version = newVersion;

    // Write back to file with proper formatting
    writeFileSync(
      PACKAGE_JSON_PATH,
      JSON.stringify(packageJson, null, 2) + '\n',
      'utf-8'
    );

    console.log(`✅ Version bumped to: ${newVersion}`);
    console.log(`📝 Updated: ${PACKAGE_JSON_PATH}`);

    return newVersion;
  } catch (error) {
    console.error('❌ Error bumping version:', error.message);
    process.exit(1);
  }
}

// Run if called directly
// This works across platforms (Windows, Mac, Linux)
bumpVersion();

export { bumpVersion };
