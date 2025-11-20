# Automatic Versioning System

## Overview

This project includes an **automatic versioning system** that displays version information in the footer of every page and auto-increments the version number with every Git push.

## Version Display

### Footer Component
All pages display a footer with:
- **Version Number**: Current app version (e.g., v2.0.0)
- **Build Date**: Date when the version was last updated
- **Repository Name**: pulseofproject
- **Organization**: Bettroi Solutions

The footer appears at the bottom of every page with a subtle, grayed-out design for minimal visual interference.

### Format
```
© 2025 Bettroi Solutions • v2.0.0 • Updated: 2025-11-20 • Repo: pulseofproject • PulseOfProject
```

## Automatic Version Bumping

### How It Works

1. **Version Source**: Version is read from `apps/web/package.json`
2. **Auto-Increment**: Every `git push` automatically increments the patch version (x.y.Z → x.y.Z+1)
3. **Git Hook**: A pre-push hook runs before each push to bump the version
4. **Build Integration**: Vite injects the version into the app at build time

### Version Scheme

The project uses **Semantic Versioning** (semver):
- **Major.Minor.Patch** (e.g., 2.1.5)
- **Auto-increment**: Patch version increments automatically on push
- **Manual updates**: Major/minor versions should be updated manually for significant changes

Example progression:
```
Initial:     v1.0.0
After push:  v1.0.1
After push:  v1.0.2
After push:  v1.0.3
```

## Setup Instructions

### One-Time Setup

Run this command once to set up automatic version bumping:

```bash
npm run setup:hooks
```

This will:
- Install the pre-push Git hook
- Enable automatic version bumping on every push

### Alternative: Automatic Setup

The hooks are automatically installed when you run:

```bash
npm install
```

The `postinstall` script ensures hooks are set up for every team member.

## Manual Version Management

### Bump Version Manually

To increment the version without pushing:

```bash
npm run version:bump
```

This will:
- Read current version from `apps/web/package.json`
- Increment the patch version
- Update the package.json file

### Update Major/Minor Versions

For significant changes, manually edit `apps/web/package.json`:

**Major version** (breaking changes):
```json
{
  "version": "2.0.0"  // from 1.x.x
}
```

**Minor version** (new features):
```json
{
  "version": "1.1.0"  // from 1.0.x
}
```

The next push will continue from this new base (e.g., 2.0.1, 1.1.1, etc.)

## Technical Implementation

### Files Modified/Created

1. **vite.config.js** - Injects version info at build time
   - Reads `apps/web/package.json`
   - Exposes version via `import.meta.env.VITE_APP_VERSION`
   - Exposes build date via `import.meta.env.VITE_BUILD_DATE`

2. **apps/web/src/components/Footer.jsx** - New footer component
   - Displays version, date, and repo info
   - Responsive design with Tailwind CSS
   - Dark mode support

3. **apps/web/src/App.jsx** - Integrated footer
   - Added Footer component import
   - Footer renders at bottom of all pages
   - Uses flexbox layout for sticky footer

4. **scripts/bump-version.js** - Version bumping script
   - Reads current version
   - Increments patch number
   - Updates package.json

5. **scripts/pre-push-hook.sh** - Git pre-push hook
   - Runs before every `git push`
   - Calls bump-version.js
   - Commits version change automatically

6. **scripts/setup-git-hooks.js** - Hook installation script
   - Copies pre-push hook to .git/hooks/
   - Makes hook executable
   - Runs on `npm install`

### Environment Variables

The following are injected at build time:

| Variable | Source | Example |
|----------|--------|---------|
| `VITE_APP_VERSION` | apps/web/package.json | "2.0.0" |
| `VITE_BUILD_DATE` | Current date | "2025-11-20" |
| `VITE_APP_NAME` | apps/web/package.json | "@neuro360/web" |

## Usage Examples

### During Development

```bash
# Start dev server (version shown in footer)
npm run dev

# Version displayed: v2.0.0 (current version)
```

### Before Deployment

```bash
# 1. Make your changes
git add .
git commit -m "feat: add new feature"

# 2. Push to GitHub (auto-bumps version)
git push origin main

# Version automatically increments: 2.0.0 → 2.0.1
# Commit message: "chore: bump version to 2.0.1"
```

### Build for Production

```bash
npm run build

# The built files will include:
# - Current version number
# - Build timestamp
# - All version info in the footer
```

## Workflow Example

### Typical Development Workflow

1. **Developer makes changes**
   ```bash
   # Edit code
   git add .
   git commit -m "feat: implement user dashboard"
   ```

2. **Push to remote (auto-version bump)**
   ```bash
   git push origin main

   # Output:
   # 🔄 Running pre-push hook: Version bump...
   # 📦 Current version: 2.0.5
   # ✅ Version bumped to: 2.0.6
   # 📝 Updated: apps/web/package.json
   # ✅ Version bumped and committed: 2.0.6
   # 🚀 Proceeding with push...
   ```

3. **Two commits are pushed**
   - First: Your feature commit
   - Second: Auto-generated version bump commit

4. **Footer updates automatically**
   - Next build/deploy shows: v2.0.6
   - Build date updates to push date

## Troubleshooting

### Hook Not Running

If version doesn't auto-bump on push:

```bash
# Reinstall hooks
npm run setup:hooks

# Check hook exists
ls -la .git/hooks/pre-push

# Check hook is executable (Unix/Mac)
chmod +x .git/hooks/pre-push
```

### Version Not Updating in UI

If footer shows old version:

```bash
# Rebuild the app
npm run build

# Or restart dev server
npm run dev
```

The version is injected at build time, so changes require a rebuild.

### Manual Fix

If version gets out of sync:

1. Edit `apps/web/package.json` manually
2. Set desired version
3. Commit and push
4. Auto-increment continues from new version

## Best Practices

### Do's
✅ Let the system auto-increment patch versions
✅ Manually update major/minor for significant releases
✅ Include version in bug reports
✅ Check footer to verify version after deployment

### Don'ts
❌ Don't manually edit patch version (use auto-increment)
❌ Don't skip the pre-push hook
❌ Don't forget to rebuild after version changes
❌ Don't commit package.json changes separately from version bumps

## Future Enhancements

Potential improvements:
- Add changelog generation
- Include git commit hash in version display
- Add environment indicator (dev/staging/prod)
- Version comparison/upgrade notifications
- Rollback to previous version
- Integration with release tags

## Support

For issues or questions:
- Check hook installation: `npm run setup:hooks`
- Manually bump version: `npm run version:bump`
- View current version: `cat apps/web/package.json | grep version`

---

**System Version**: Auto-increments with every push
**Last Updated**: 2025-11-20
**Repository**: pulseofproject
**Maintained by**: Bettroi Solutions
