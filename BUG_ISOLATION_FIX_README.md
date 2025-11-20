# Bug List Isolation Fix

## Problem Summary

All projects were showing the same bug list (Linkist bugs) instead of having their own isolated bug lists.

### Root Cause
1. **Database Constraint**: The `bug_reports` table had a CHECK constraint limiting `project_name` to only `'LinkList'` and `'Neuro360'`
2. **Fallback Mapping**: The BugReport component mapped all unknown projects to `'LinkList'`
3. **Non-Reactive Variable**: The `dbProjectName` was calculated once and not recalculated when the project changed

### Impact
- ❌ 4csecure project showed Linkist bugs
- ❌ All new projects showed Linkist bugs
- ✅ Only linkist-nfc and neurosense-360 worked correctly

---

## Solution Implemented

### Code Changes

#### 1. BugReport Component (`apps/web/src/modules/pulseofproject/components/BugReport.tsx`)

**Before:**
```typescript
const getDBProjectName = (projectId: string): string => {
  // Complex mapping logic with fallback to 'LinkList'
  if (projectId.includes('linkist')) return 'LinkList';
  if (projectId.includes('neuro')) return 'Neuro360';
  return 'LinkList'; // ❌ All other projects fall back to LinkList
};

const dbProjectName = getDBProjectName(projectName); // ❌ Not reactive
```

**After:**
```typescript
const getDBProjectName = (projectId: string): string => {
  if (!projectId || projectId === '') {
    return 'linklist'; // Only fallback for empty
  }
  return projectId; // ✅ Use actual project ID
};

// ✅ Made reactive using useMemo
const dbProjectName = React.useMemo(() => {
  const dbName = getDBProjectName(projectName);
  console.log('💾 Database project name recalculated:', dbName);
  return dbName;
}, [projectName]);
```

### Database Changes Required

Run the SQL migration script: `DATABASE_MIGRATION_PROJECT_NAMES.sql`

```sql
-- Remove the CHECK constraint that limits project names
ALTER TABLE bug_reports
DROP CONSTRAINT IF EXISTS bug_reports_project_name_check;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_bug_reports_project_name
ON bug_reports(project_name);
```

---

## Testing Instructions

### 1. Apply Database Migration

Open Supabase SQL Editor and run:
```sql
-- Remove constraint
ALTER TABLE bug_reports
DROP CONSTRAINT IF EXISTS bug_reports_project_name_check;

-- Verify it's removed
SELECT conname
FROM pg_constraint
WHERE conrelid = 'bug_reports'::regclass AND contype = 'c';
```

### 2. Test Bug Isolation

1. **Navigate to 4csecure project**:
   - Go to http://localhost:3000/pulseofproject?project=4csecure
   - Scroll to Bug Report section
   - Add a new bug: "4csecure Test Bug"

2. **Navigate to linkist-nfc project**:
   - Go to http://localhost:3000/pulseofproject?project=linkist-nfc
   - Verify you DON'T see "4csecure Test Bug"
   - Add a new bug: "Linkist Test Bug"

3. **Navigate back to 4csecure**:
   - Go to http://localhost:3000/pulseofproject?project=4csecure
   - Verify you see "4csecure Test Bug" but NOT "Linkist Test Bug"

### 3. Verify Database Isolation

Query the database:
```sql
-- Check bugs per project
SELECT project_name, COUNT(*) as bug_count
FROM bug_reports
GROUP BY project_name
ORDER BY project_name;

-- Should show:
-- 4csecure       | 1
-- linkist-nfc    | X
-- neurosense-360 | Y
```

---

## Expected Behavior After Fix

✅ **Each project has its own bug list**
- 4csecure → Only shows bugs with `project_name = '4csecure'`
- linkist-nfc → Only shows bugs with `project_name = 'linkist-nfc'`
- neurosense-360 → Only shows bugs with `project_name = 'neurosense-360'`

✅ **Bugs are properly isolated**
- Adding a bug in 4csecure does NOT show in linkist-nfc
- Adding a bug in linkist-nfc does NOT show in 4csecure

✅ **Dynamic project support**
- Any new project automatically gets its own bug list
- No code changes needed for new projects

---

## Console Logs to Verify

When switching projects, you should see:
```
🔍 Mapping project ID: 4csecure
✅ Using actual project name: 4csecure
💾 Database project name recalculated: 4csecure for projectName: 4csecure
🐛 Loading bugs for project: 4csecure (DB name: 4csecure)
✅ Loaded X bugs for 4csecure (4csecure)
```

---

## Rollback Instructions

If you need to revert these changes:

### 1. Restore Database Constraint
```sql
ALTER TABLE bug_reports
ADD CONSTRAINT bug_reports_project_name_check
CHECK (project_name IN ('LinkList', 'Neuro360'));
```

### 2. Revert Code Changes
```bash
git revert <commit-hash>
```

---

## Files Modified

1. `apps/web/src/modules/pulseofproject/components/BugReport.tsx`
   - Simplified `getDBProjectName()` to use actual project IDs
   - Made `dbProjectName` reactive using `useMemo`

2. `DATABASE_MIGRATION_PROJECT_NAMES.sql` (new file)
   - SQL migration to remove project_name constraint

3. `BUG_ISOLATION_FIX_README.md` (this file)
   - Complete documentation of the fix

---

## Additional Notes

### Data Migration (Optional)

If you want to rename existing bugs from legacy names:

```sql
-- Rename LinkList bugs to linkist-nfc
UPDATE bug_reports
SET project_name = 'linkist-nfc'
WHERE project_name = 'LinkList';

-- Rename Neuro360 bugs to neurosense-360
UPDATE bug_reports
SET project_name = 'neurosense-360'
WHERE project_name = 'Neuro360';
```

### Performance Considerations

- Added index on `project_name` for faster filtering
- `useMemo` prevents unnecessary recalculations
- Each project query is scoped to its own bugs only

---

## Support

If you encounter issues:

1. Check console logs for project name mapping
2. Verify database constraint is removed
3. Test with a fresh bug creation
4. Check network tab for API calls

For questions, contact the development team.
