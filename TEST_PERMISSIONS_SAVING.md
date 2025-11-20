# Test Guide: Verify Permissions Are Saving

## Step 1: Open Browser Console
1. Open your app: `localhost:3000/users`
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Keep it open

## Step 2: Assign Projects with Permissions
1. Click on any user's "Assign Projects" button (folder icon)
2. Select a permission preset OR manually check/uncheck permissions
3. Select some projects
4. Click "Assign Projects"

## Step 3: Check Console Output

You should see these logs in the console:

```
✅ Expected Output:
➕ Assigning X projects to user with permissions
📋 Received permissions: {canViewDetailedPlan: false, canUploadDocuments: true, ...}
✏️ Can Edit: false
🎯 Final permissions after merge: {canViewDetailedPlan: false, canUploadDocuments: true, ...}
📦 Assignments to be saved: [{user_id: "...", project_id: "...", can_edit: false, ...}]
✅ Projects assigned successfully with permissions
💾 Saved data: [...]
```

### What to Look For:

**✅ GOOD - Permissions Are Saving:**
- You see the `💾 Saved data:` log
- The saved data shows `can_view_detailed_plan`, `can_upload_documents`, etc. with `true`/`false` values
- No errors in console

**❌ BAD - Permissions NOT Saving:**
- You see `❌ Database error:`
- Missing columns error
- Permission fields are `null` in saved data

## Step 4: Verify in Database

Run this query in **Supabase SQL Editor**:

```sql
-- Check the most recent assignment
SELECT
  u.email,
  p.name as project_name,
  up.can_edit as "Can Edit",
  up.can_view_detailed_plan as "View Plan",
  up.can_upload_documents as "Upload Docs",
  up.can_manage_bugs as "Manage Bugs",
  up.can_access_testing as "Testing",
  up.assigned_at
FROM user_projects up
JOIN users u ON up.user_id = u.id
JOIN admin_projects p ON up.project_id = p.id::text
ORDER BY up.assigned_at DESC
LIMIT 5;
```

**Expected Result:**
- You should see `t` (true) or `f` (false) for each permission column
- NOT `null` values

## Step 5: Test Different Permission Presets

Try each preset and verify they save correctly:

### 1. View Only Preset
- Should save: All permissions = `false` EXCEPT `can_view_metrics` and `can_view_timeline` = `true`

### 2. Standard User Preset
- Should save: Most permissions = `true`, `can_view_detailed_plan` = `false`, `can_edit` = `false`

### 3. Full Access Preset
- Should save: ALL permissions = `true`, `can_edit` = `true`

## Common Issues & Fixes

### Issue 1: "Column does not exist" error
**Fix:** Run the migration SQL:
```sql
-- Run COMPLETE_USER_PERMISSIONS_MIGRATION.sql
```

### Issue 2: Permissions are `null` in database
**Fix:** Check if the columns exist:
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'user_projects'
  AND column_name LIKE 'can_%';
```

If columns are missing, run the migration.

### Issue 3: Console shows error "permission denied"
**Fix:** Check RLS policies:
```sql
-- Super admins should be able to insert/update
SELECT * FROM pg_policies WHERE tablename = 'user_projects';
```

## Full Verification SQL

Run `VERIFY_PERMISSIONS_SAVED.sql` for a complete check:
- View all assignments
- Check for NULL values
- Count users by permission type
- Verify table structure

## Success Criteria

✅ Permissions are working correctly if:
1. Console shows `💾 Saved data` with permission values
2. Database query shows `t`/`f` (not `null`)
3. Different presets save different permission combinations
4. No errors in console or database

## Need Help?

If permissions are NOT saving:
1. Check console for errors (red text)
2. Run `VERIFY_PERMISSIONS_SAVED.sql` in Supabase
3. Check if `user_projects` table has all `can_*` columns
4. Verify you're logged in as super admin
