# Deliverable Progress Tracking - Setup Guide

## Overview
Deliverable progress is now tracked in a **separate table** (`deliverable_progress`) instead of being embedded in the `project_milestones` table.

## Database Setup

### Step 1: Create the Table in Supabase

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/winhdjtlwhgdoinfrxch
2. Click **"SQL Editor"** in the left sidebar
3. Create a **New Query**
4. Copy and paste the SQL from: `./supabase-migrations/create-deliverable-progress-table.sql`
5. Click **"Run"** to execute

### Step 2: Verify Table Creation

Run this command to check:
```bash
node run-migration-deliverable-progress.js
```

If successful, you should see:
```
✅ Table already exists!
✅ Migration complete!
```

### Step 3: Migrate Existing Data

The migration script will automatically migrate existing deliverable data from `project_milestones.deliverables` to the new `deliverable_progress` table.

```bash
node run-migration-deliverable-progress.js
```

Expected output:
```
📦 Found X milestones to migrate
📋 Migrating Y deliverables...
✅ Successfully migrated Y deliverables!
```

## Table Schema

```sql
CREATE TABLE deliverable_progress (
  id UUID PRIMARY KEY,
  project_id TEXT NOT NULL,           -- References projects.id
  milestone_id TEXT NOT NULL,         -- Milestone identifier
  deliverable_id TEXT NOT NULL,       -- Deliverable identifier
  deliverable_text TEXT NOT NULL,     -- Deliverable description
  completed BOOLEAN DEFAULT FALSE,    -- Completion status
  completed_at TIMESTAMP,             -- When it was completed
  completed_by TEXT,                  -- Who completed it
  created_at TIMESTAMP,
  updated_at TIMESTAMP,

  UNIQUE(project_id, milestone_id, deliverable_id)
);
```

## Code Changes

### 1. Service Layer (`projectTrackingService.ts`)

Added new methods:
- `getDeliverableProgress(projectId)` - Get all progress for a project
- `toggleDeliverableProgress(projectId, milestoneId, deliverableId, text, completed)` - Toggle single deliverable
- `getDeliverableProgressByMilestone(projectId, milestoneId)` - Get progress for milestone
- `bulkSaveDeliverableProgress(projectId, milestoneId, deliverables)` - Bulk save

### 2. PulseOfProject.tsx

**Fetch Logic (Line 154-198):**
```typescript
// Fetch deliverable progress from separate table
const deliverableProgress = await ProjectTrackingService.getDeliverableProgress(dbProjectId);

// Merge with milestone deliverables
const progressMap = new Map();
deliverableProgress.forEach((dp: any) => {
  const key = `${dp.milestone_id}-${dp.deliverable_id}`;
  progressMap.set(key, dp.completed);
});

const milestones = dbProject.milestones.map((m: any) => {
  const deliverables = (m.deliverables || []).map((d: any) => {
    const key = `${m.id}-${d.id}`;
    const completedFromProgress = progressMap.get(key);
    return {
      ...d,
      completed: completedFromProgress !== undefined ? completedFromProgress : d.completed
    };
  });
  return { ...m, deliverables };
});
```

**Save Logic (Line 583-616):**
```typescript
const handleDeliverableToggle = async (milestoneId, deliverableId) => {
  // Update local state
  setProjectData(/* update local state */);

  // Save to NEW deliverable_progress table
  const success = await ProjectTrackingService.toggleDeliverableProgress(
    dbProjectId,
    milestoneId,
    deliverableId,
    deliverable.text,
    deliverable.completed
  );
};
```

## How It Works

### Data Flow

1. **Page Load:**
   ```
   GET /projects/{id} → Load milestones
   ↓
   GET /deliverable_progress → Load progress
   ↓
   Merge progress with milestones → Display UI
   ```

2. **Checkbox Toggle:**
   ```
   User clicks checkbox
   ↓
   Update React state (immediate UI update)
   ↓
   UPSERT /deliverable_progress → Save to database
   ↓
   Toast: "✅ Progress saved to database"
   ```

3. **Data Separation:**
   - `project_milestones` table: Milestone metadata (name, dates, status, deliverable **definitions**)
   - `deliverable_progress` table: Deliverable **completion status** (who, when, completed or not)

## Benefits

✅ **Separation of Concerns:** Milestone structure vs completion tracking
✅ **Audit Trail:** Track who completed what and when
✅ **Query Efficiency:** Easy to query all completed deliverables across projects
✅ **Flexibility:** Can add more fields (comments, attachments, etc.) without modifying milestone structure
✅ **Historical Data:** Can track progress over time

## Testing

### Test 1: Toggle Deliverable
```
1. Open: http://localhost:3001/pulseofproject?project=neurosense-mvp
2. Expand "Phase 1: Foundation & Infrastructure"
3. Toggle "Signed LOC" checkbox
4. Check console:
   💾 Saving to deliverable_progress table: {...}
   ✅ Deliverable progress saved to separate table
5. Refresh page → checkbox state persists
```

### Test 2: Verify Database
```sql
SELECT * FROM deliverable_progress
WHERE project_id = 'neurosense-mvp'
ORDER BY milestone_id, deliverable_id;
```

### Test 3: Cross-Device Persistence
```
1. Toggle checkbox on Device A
2. Open same page on Device B
3. Checkbox should show same state
```

## Troubleshooting

### Table doesn't exist
- Run the SQL migration in Supabase Dashboard
- Check output of `node run-migration-deliverable-progress.js`

### Progress not saving
- Check console for error messages
- Verify Supabase RLS policies allow insert/update
- Check network tab for failed requests

### Data not loading
- Check console: "📡 Fetching deliverable progress for project: X"
- Should see: "✅ Fetched Y deliverable progress records"
- If 0 records, need to toggle checkboxes to create initial data

## Files Modified

1. `supabase-migrations/create-deliverable-progress-table.sql` - NEW
2. `run-migration-deliverable-progress.js` - NEW
3. `apps/web/src/modules/project-tracking/services/projectTrackingService.ts` - Added methods (Line 517-659)
4. `apps/web/src/modules/pulseofproject/PulseOfProject.tsx` - Updated fetch (Line 154-198) and save (Line 583-616) logic

## Migration Checklist

- [x] Create SQL migration file
- [x] Add service methods for new table
- [x] Update PulseOfProject fetch logic
- [x] Update PulseOfProject save logic
- [ ] **Run SQL migration in Supabase Dashboard** ← DO THIS FIRST!
- [ ] Run data migration script
- [ ] Test checkbox toggle
- [ ] Verify persistence across refresh
- [ ] Test cross-device sync

## Next Steps

After running the SQL migration:
1. Open the app
2. Toggle some deliverables
3. Verify they save to `deliverable_progress` table
4. Check persistence across page refreshes
5. Verify data is NOT being saved to `project_milestones.deliverables` anymore

---

**Server:** http://localhost:3001
**Project URL:** http://localhost:3001/pulseofproject?project=neurosense-mvp
