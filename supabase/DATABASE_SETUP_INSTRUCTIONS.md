# Project Tracking Database Setup Instructions

This guide will help you set up the database tables needed for the deliverable checkboxes and project tracking system to work with Supabase.

---

## Prerequisites

- Supabase account with the project: `winhdjtlwhgdoinfrxch`
- Access to Supabase SQL Editor

---

## Step-by-Step Setup

### 1. Access Your Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/winhdjtlwhgdoinfrxch
2. Log in if needed
3. Click on **SQL Editor** in the left sidebar

### 2. Run the Migration Script

1. Click the **"+ New query"** button in the SQL Editor
2. Open the file: `/supabase/migrations/create_project_tracking_tables.sql`
3. Copy the entire contents of the file
4. Paste it into the SQL Editor
5. Click **"Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### 3. Verify Success

After running the script, you should see:
- ✅ Success message at the bottom
- No error messages in red

You can verify the tables were created by:
1. Click **"Table Editor"** in the left sidebar
2. You should see these new tables:
   - `projects`
   - `project_milestones`
   - `project_tasks`
   - `milestone_kpis`
   - `project_comments`
   - `project_updates`
   - `project_team_members`
   - `project_risks`

---

## What This Script Creates

### Tables

1. **`projects`** - Stores project metadata
   - id, name, description, client, dates, status, progress, budget

2. **`project_milestones`** - Stores phases with deliverables
   - id, project_id, name, description, status, dates, progress
   - **deliverables** (JSONB array) - This is where checkbox states are stored!

3. **`project_tasks`** - Stores individual tasks
   - id, milestone_id, name, description, status, priority, dates, progress

4. **`milestone_kpis`** - Stores KPI metrics for milestones
   - id, milestone_id, name, target, current, unit, status

5. **`project_comments`** - Stores project comments
   - id, project_id, user info, content, timestamp

6. **`project_updates`** - Stores activity updates
   - id, project_id, type, title, description, user info, timestamp

7. **`project_team_members`** - Stores team member information
   - id, project_id, user info, role, email

8. **`project_risks`** - Stores project risks
   - id, project_id, title, description, severity, probability, mitigation

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- Public access policies (you can restrict these later)
- Automatic `updated_at` timestamp triggers
- Foreign key constraints for data integrity

### Performance Optimizations

- Indexes on frequently queried columns
- Cascade deletes for related records
- Optimized for real-time subscriptions

---

## Testing the Setup

### Test 1: Verify Database Connection

1. Open: https://pulseofproject.com
2. Open Browser Console (F12)
3. Look for: `✅ Project Tracking database connected successfully`

### Test 2: Test Deliverable Checkbox

1. Navigate to a project in the Project Timeline
2. Click on a deliverable checkbox
3. Watch the Browser Console for:
   - `✅ Deliverable toggled in Supabase: deliverable-id`
   - Toast notification: "Deliverable status saved to database"

### Test 3: Verify Data Persistence

1. Check a deliverable checkbox
2. Refresh the page (F5)
3. The checkbox should remain checked!

### Test 4: Check Database Records

1. Go to Supabase Dashboard > Table Editor
2. Click on `project_milestones`
3. You should see records being created when you interact with the UI
4. Check the `deliverables` column - it should be a JSON array with checkbox states

---

## Troubleshooting

### Error: "relation does not exist"

**Problem**: Tables weren't created
**Solution**:
- Make sure you ran the SQL script completely
- Check for any error messages in the SQL Editor
- Try running the script again

### Error: "permission denied"

**Problem**: RLS policies not set up correctly
**Solution**:
- The script includes public access policies
- If you modified the script, ensure RLS policies are created
- Check the "Policies" tab in Table Editor

### Checkboxes still don't save

**Problem**: Front-end not connecting to database
**Solution**:
1. Clear browser cache and hard refresh (Ctrl+Shift+R)
2. Check Browser Console for connection errors
3. Verify environment variables are set correctly:
   - `VITE_BUGTRACKING_SUPABASE_URL=https://winhdjtlwhgdoinfrxch.supabase.co`
   - `VITE_BUGTRACKING_SUPABASE_ANON_KEY=[your key]`

### Data not appearing in UI

**Problem**: Data structure mismatch
**Solution**:
- Check the `deliverables` column format in `project_milestones`
- It should be a JSON array like:
  ```json
  [
    {
      "id": "deliverable-1",
      "name": "Setup Database",
      "completed": true
    }
  ]
  ```

---

## Next Steps

After setup is complete:

1. ✅ Deliverable checkboxes will persist in Supabase
2. ✅ Real-time updates work across multiple users
3. ✅ Data survives page refreshes
4. ✅ Full project tracking features are enabled

---

## Security Recommendations for Production

Once testing is complete, you may want to restrict access:

1. **Remove public policies** and add user-based policies:
   ```sql
   -- Example: Only allow authenticated users
   CREATE POLICY "Authenticated users can read projects"
   ON public.projects FOR SELECT
   TO authenticated
   USING (true);
   ```

2. **Add user authentication** checks:
   ```sql
   -- Example: Only project team members can edit
   CREATE POLICY "Team members can update milestones"
   ON public.project_milestones FOR UPDATE
   TO authenticated
   USING (
     project_id IN (
       SELECT project_id FROM project_team_members
       WHERE user_id = auth.uid()
     )
   );
   ```

3. **Enable audit logging** for sensitive operations

---

## Support

If you encounter issues:

1. Check the Browser Console for error messages
2. Check Supabase Logs: Dashboard > Logs
3. Verify table structures in Table Editor
4. Review RLS policies in Table Editor > Policies tab

---

## Summary

✅ **Database Schema**: Complete with 8 tables
✅ **Security**: RLS enabled with public access
✅ **Performance**: Indexed and optimized
✅ **Real-time**: Ready for subscriptions
✅ **Deliverables**: Stored as JSONB in `project_milestones.deliverables`

**You're all set!** Your deliverable checkboxes will now persist in Supabase. 🎉
