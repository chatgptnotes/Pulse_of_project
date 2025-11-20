# Versioning System - Quick Start Guide

## What's New?

Your app now includes **automatic version tracking** with:
- ✅ Footer showing version, date, and repo name on every page
- ✅ Auto-increment version on every Git push (1.0 → 1.1 → 1.2...)
- ✅ Grayed-out footer design for minimal visual impact

## Setup (One Command)

```bash
npm run setup:hooks
```

That's it! Version auto-incrementing is now enabled.

## What You'll See

### Footer Display
Every page now shows at the bottom:

```
© 2025 Bettroi Solutions • v2.0.0 • Updated: 2025-11-20 • Repo: pulseofproject • PulseOfProject
```

### Auto-Versioning on Push

When you push to GitHub:

```bash
git push origin main

# Automatic output:
# 🔄 Running pre-push hook: Version bump...
# ✅ Version bumped to: 2.0.1
# 🚀 Proceeding with push...
```

## Version Numbering

- **First time**: Version starts at whatever is in `apps/web/package.json` (currently **2.0.0**)
- **Each push**: Auto-increments by 0.1 (2.0.0 → 2.1.0 → 2.2.0 → 2.3.0...)
- **Format**: Major.Minor.Patch

## Manual Version Bump

If you need to bump version without pushing:

```bash
npm run version:bump
```

## Files Changed

### New Files
- `apps/web/src/components/Footer.jsx` - Footer component
- `scripts/bump-version.js` - Version bumping logic
- `scripts/pre-push-hook.sh` - Git hook script
- `scripts/setup-git-hooks.js` - Hook installer
- `VERSIONING_SYSTEM.md` - Full documentation

### Modified Files
- `vite.config.js` - Injects version info
- `apps/web/src/App.jsx` - Includes Footer component
- `package.json` - Added version scripts

## Verify Installation

1. **Check footer appears**:
   ```bash
   npm run dev
   # Visit http://localhost:3000
   # Look at bottom of page for version footer
   ```

2. **Test version bump**:
   ```bash
   npm run version:bump
   # Should show: ✅ Version bumped to: X.Y.Z
   ```

3. **Check git hook**:
   ```bash
   # Windows
   type .git\hooks\pre-push

   # Mac/Linux
   cat .git/hooks/pre-push
   ```

## How It Works

1. **Before each push**: Git hook runs automatically
2. **Version bumps**: Patch number increments (2.0.0 → 2.0.1)
3. **Auto-commit**: New version commits automatically
4. **Push continues**: Your code + version commit both push

## Troubleshooting

### Footer Not Showing?
```bash
# Restart dev server
npm run dev
```

### Version Not Auto-Incrementing?
```bash
# Reinstall hooks
npm run setup:hooks
```

### Want to Skip Version Bump?
```bash
# Push with --no-verify flag
git push --no-verify
```

## Next Steps

1. Run `npm run setup:hooks` to enable auto-versioning
2. Start dev server: `npm run dev`
3. Check footer at bottom of any page
4. Make a change, commit, and push to see version auto-increment

## Need More Details?

See full documentation: [VERSIONING_SYSTEM.md](./VERSIONING_SYSTEM.md)

---

**v2.0.0** • 2025-11-20 • pulseofproject
