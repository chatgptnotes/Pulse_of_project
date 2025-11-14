# Deliverable Data Migration Instructions

## Overview
This migration moves deliverable completion data from `project_milestones.deliverables` JSONB column to the dedicated `deliverable_progress` table.

## What This Migration Does

### Step 1: Copy Data to New Table
- Extracts all deliverables from `project_milestones.deliverables` column
- Inserts them into `deliverable_progress` table with:
  - `project_id`: From the milestone's project
  - `milestone_id`: The milestone ID
  - `deliverable_id`: From deliverable.id
  - `deliverable_text`: From deliverable.text
  - `completed`: From deliverable.completed
  - `completed_at`: Set to NOW() if completed, NULL otherwise

### Step 2: Clean Milestone Table
- Removes the `completed` field from each deliverable in `project_milestones.deliverables`
- Keeps only `id` and `text` fields (for display purposes)
- Completion status now lives ONLY in `deliverable_progress` table

## Migration Steps

### 1. Run the Table Creation (if not done already)
```sql
-- In Supabase SQL Editor, run:
-- File: supabase-migrations/create-deliverable-progress-table.sql
```

### 2. Run the Migration Script
```sql
-- In Supabase SQL Editor, run:
-- File: supabase-migrations/migrate-deliverables-to-progress-table.sql
```

### 3. Verify the Migration

**Check deliverables were copied:**
```sql
SELECT COUNT(*) as total_deliverables FROM public.deliverable_progress;
```

**View sample migrated data:**
```sql
SELECT
  project_id,
  milestone_id,
  deliverable_text,
  completed,
  completed_at
FROM public.deliverable_progress
ORDER BY milestone_id, deliverable_id
LIMIT 20;
```

**Check milestones no longer have 'completed' field:**
```sql
SELECT
  name,
  deliverables
FROM public.project_milestones
WHERE deliverables IS NOT NULL
LIMIT 5;
```

Expected result:
```json
[
  {"id": "d1", "text": "Signed LOC"},
  {"id": "d2", "text": "Receipt of advance payment"}
]
```

Notice: NO "completed" field!

## Before vs After

### Before Migration:
**project_milestones.deliverables:**
```json
[
  {
    "id": "d1",
    "text": "Signed LOC",
    "completed": true
  },
  {
    "id": "d2",
    "text": "Receipt of advance payment",
    "completed": false
  }
]
```

**deliverable_progress:** (empty or partial data)

### After Migration:
**project_milestones.deliverables:**
```json
[
  {
    "id": "d1",
    "text": "Signed LOC"
  },
  {
    "id": "d2",
    "text": "Receipt of advance payment"
  }
]
```

**deliverable_progress:**
| project_id | milestone_id | deliverable_id | deliverable_text | completed | completed_at |
|------------|--------------|----------------|------------------|-----------|--------------|
| neurosense-mvp | phase-1 | d1 | Signed LOC | true | 2025-11-14 15:30:00 |
| neurosense-mvp | phase-1 | d2 | Receipt of advance payment | false | NULL |

## Rollback Plan (if needed)

If something goes wrong, you can restore the completed field:

```sql
UPDATE public.project_milestones pm
SET deliverables = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', d->>'id',
      'text', d->>'text',
      'completed', COALESCE(dp.completed, false)
    )
  )
  FROM jsonb_array_elements(pm.deliverables) as d
  LEFT JOIN public.deliverable_progress dp
    ON dp.milestone_id = pm.id
    AND dp.deliverable_id = d->>'id'
)
WHERE deliverables IS NOT NULL;
```

## Post-Migration Checklist

- [ ] Run table creation SQL
- [ ] Run migration SQL
- [ ] Verify count matches expected deliverables
- [ ] Check sample data in both tables
- [ ] Test toggling deliverables in UI
- [ ] Confirm progress percentages still calculate correctly
- [ ] Test page refresh (data persistence)

## Important Notes

1. **Idempotent:** This migration can be run multiple times safely (uses `ON CONFLICT`)
2. **No Data Loss:** Original data is not deleted until verified
3. **Code Already Updated:** The application code already uses `deliverable_progress` table
4. **Backward Compatible:** If migration not run, app will still work (uses fallback)

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard > Logs
2. Verify RLS policies are set up correctly
3. Ensure `deliverable_progress` table exists
4. Check that your user has permissions

---

**Migration File:** `supabase-migrations/migrate-deliverables-to-progress-table.sql`
**Created:** 2025-11-14
