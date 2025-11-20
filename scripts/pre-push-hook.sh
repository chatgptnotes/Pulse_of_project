#!/bin/bash

# Pre-push Git Hook
# Automatically bumps version before each push to GitHub
# This ensures version increments with every push

echo "🔄 Running pre-push hook: Version bump..."

# Check if we're in the root directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Not in project root directory"
  exit 1
fi

# Run the version bump script
node scripts/bump-version.js

# Check if version bump succeeded
if [ $? -ne 0 ]; then
  echo "❌ Version bump failed"
  exit 1
fi

# Stage the updated package.json
git add apps/web/package.json

# Commit the version bump
NEW_VERSION=$(node -p "require('./apps/web/package.json').version")
git commit -m "chore: bump version to ${NEW_VERSION}" --no-verify

echo "✅ Version bumped and committed: ${NEW_VERSION}"
echo "🚀 Proceeding with push..."

exit 0
