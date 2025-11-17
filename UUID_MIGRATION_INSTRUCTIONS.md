# UUID Migration Instructions

## Overview
This migration converts the primary keys from TEXT to UUID while keeping TEXT `project_id` for compatibility.

## Database Schema Changes

### Before:
```sql
admin_projects (
  id TEXT PRIMARY KEY  -- ❌ TEXT primary key
)
```

### After:
```sql
admin_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- ✅ UUID primary key
  project_id TEXT UNIQUE NOT NULL  -- ✅ TEXT field for 'neurosense-360', etc.
)
```

## Migration Steps

### Step 1: Run the Migration SQL
1. Open Supabase SQL Editor
2. Copy and paste **`MIGRATE_TO_UUID_PRIMARY_KEYS.sql`**
3. Click "Run"

This will:
- ✅ Create UUID extension
- ✅ Backup existing data (if any)
- ✅ Recreate tables with UUID primary keys
- ✅ Insert all 45 projects
- ✅ Enable RLS policies
- ✅ Update `get_user_projects` function
- ✅ **DOES NOT DELETE ANY DATA**

### Step 2: Verify Data
After running the migration, run these queries to verify:

```sql
-- Count projects
SELECT COUNT(*) FROM admin_projects;
-- Should return: 45

-- Check neurosense-360 project
SELECT id, project_id, name FROM admin_projects
WHERE project_id = 'neurosense-360';
-- Should return: 1 row with UUID id and 'neurosense-360' as project_id

-- List all projects
SELECT id, project_id, name, status, priority
FROM admin_projects
ORDER BY priority, name
LIMIT 10;
```

### Step 3: Test Frontend
1. Refresh browser (Ctrl+F5)
2. Login as regular user
3. Projects should load in selector
4. Click on a project - should open without errors

## Key Changes

### Database:
1. **admin_projects** table:
   - `id` = UUID (primary key)
   - `project_id` = TEXT (e.g., 'neurosense-360')

2. **projects** table:
   - `id` = UUID (primary key)
   - `project_id` = TEXT (matches admin_projects.project_id)

3. **project_milestones** table:
   - `id` = UUID (primary key)
   - `milestone_id` = TEXT (e.g., 'milestone-1763111769111')
   - `project_uuid` = UUID (foreign key to projects.id)
   - `project_id` = TEXT (for compatibility)

### Frontend Code Updated:
1. **userProjectsService.js** - Uses `project_id` field
2. **projectTrackingService.ts** - Queries by `project_id` instead of `id`

## How It Works Now

1. **Frontend** uses TEXT IDs like `'neurosense-360'`
2. **Database** stores:
   - UUID as primary key (for relational integrity)
   - TEXT `project_id` field (for frontend compatibility)
3. **Queries** match by `project_id` field:
   ```sql
   SELECT * FROM admin_projects WHERE project_id = 'neurosense-360'
   ```

## Benefits

✅ **UUID Primary Keys** - Better for distributed systems, no collisions
✅ **TEXT project_id** - Human-readable, URL-friendly
✅ **No Breaking Changes** - Frontend code still uses same IDs
✅ **Data Preserved** - Migration doesn't delete anything
✅ **RLS Enabled** - Row-level security policies active

## Rollback (if needed)

If something goes wrong, the migration creates temporary backup tables:
- `admin_projects_backup`
- `project_milestones_backup`

You can restore from these if needed (within the same session).

## Troubleshooting

### Error: "function uuid_generate_v4() does not exist"
**Fix:** Run `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### Error: "relation admin_projects does not exist"
**Fix:** The table will be created by the migration script

### Projects not loading in frontend
**Fix:**
1. Check browser console for errors
2. Verify data with SQL: `SELECT COUNT(*) FROM admin_projects;`
3. Check RLS policies: The migration enables them automatically

## Summary

This migration modernizes the database schema while maintaining compatibility with existing frontend code. All project IDs remain the same (e.g., 'neurosense-360'), but internally use UUID primary keys for better database performance and scalability.
