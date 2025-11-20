# Database Setup Guide - Fix Deliverable Checkbox Issue

## Problem Description

When you click on a deliverable checkbox, you're getting these errors:

```
Error fetching loading: GET "https://...supabase.co/rest/v1/project_milestones?..."
Error fetching loading: POST "https://...supabase.co/rest/v1/undeliverable_milestone_milestones"
```

**Root Cause:** The database tables don't exist in your Supabase project yet.

## Solution: Create Database Tables

Follow these steps to create all required tables in Supabase:

### Step 1: Access Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Login with your credentials
3. Select your project: **winhdjtlwhgdoinfrxch**

### Step 2: Open SQL Editor

1. In the left sidebar, click on **SQL Editor**
2. Click **New Query** button

### Step 3: Run Database Schema

1. Open the file: `create-project-tracking-tables.sql` in your project root
2. Copy the **entire contents** of the file
3. Paste it into the Supabase SQL Editor
4. Click the **Run** button (or press Ctrl/Cmd + Enter)

### Step 4: Verify Tables Were Created

After running the SQL script, you should see a success message. The following tables will be created:

- ✅ `projects` - Main project information
- ✅ `project_milestones` - Milestones with deliverables (JSONB)
- ✅ `project_tasks` - Individual tasks
- ✅ `milestone_kpis` - KPI tracking
- ✅ `project_team_members` - Team members
- ✅ `project_risks` - Risk management
- ✅ `project_comments` - Comments and discussions
- ✅ `project_updates` - Activity feed

### Step 5: Verify Setup (Using Node Script)

Run the verification script to confirm all tables exist:

```bash
node verify-database-setup.js
```

Expected output:
```
✅ projects                   - EXISTS (0 rows)
✅ project_milestones         - EXISTS (0 rows)
✅ project_tasks              - EXISTS (0 rows)
...
✅ SUCCESS! All required tables exist in the database.
```

### Step 6: Test the Application

1. Restart your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to the project tracking page
3. Click on a deliverable checkbox
4. You should now see:
   - ✅ No console errors
   - ✅ Toast notification: "Deliverable status saved to database"
   - ✅ Checkbox state persists on page refresh

## Troubleshooting

### Issue: "Table already exists" error

If you see this error, it means the tables were already created. You can:
- Ignore this error (tables exist)
- Or drop existing tables first:
  ```sql
  DROP TABLE IF EXISTS project_updates CASCADE;
  DROP TABLE IF EXISTS project_comments CASCADE;
  DROP TABLE IF EXISTS project_risks CASCADE;
  DROP TABLE IF EXISTS project_team_members CASCADE;
  DROP TABLE IF EXISTS milestone_kpis CASCADE;
  DROP TABLE IF EXISTS project_tasks CASCADE;
  DROP TABLE IF EXISTS project_milestones CASCADE;
  DROP TABLE IF EXISTS projects CASCADE;
  ```
  Then run the create script again.

### Issue: "Permission denied" error

If you see permission errors:
1. Make sure you're using the correct Supabase project
2. Check that your API keys in `.env` are correct
3. Try using the service role key (more permissive):
   ```env
   VITE_SUPABASE_ANON_KEY=your_service_role_key_here
   ```

### Issue: Still getting errors after setup

1. Clear browser cache and local storage
2. Restart your development server
3. Check browser console for new error messages
4. Verify your `.env` file has the correct Supabase URL:
   ```env
   VITE_SUPABASE_URL=https://winhdjtlwhgdoinfrxch.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Database Schema Overview

### project_milestones Table

The `project_milestones` table stores deliverables as a JSONB array:

```json
{
  "id": "milestone-1",
  "project_id": "neurosense-mvp",
  "name": "Phase 1: Foundation",
  "deliverables": [
    {
      "id": "1",
      "text": "Setup SDK",
      "completed": false
    },
    {
      "id": "2",
      "text": "Supabase database setup",
      "completed": true
    }
  ]
}
```

When you click a checkbox:
1. Frontend updates local state
2. `ProjectTrackingService.toggleDeliverable()` is called
3. It fetches the milestone from database
4. Toggles the specific deliverable's `completed` field
5. Saves back to database

## Need Help?

If you're still experiencing issues:

1. Run the verification script and share the output
2. Check browser console for error messages
3. Verify your Supabase project dashboard shows the tables
4. Make sure your `.env` file is in the root directory and properly configured

## Quick Reference

**Supabase Project URL:** `https://winhdjtlwhgdoinfrxch.supabase.co`

**Environment Variables:**
```env
VITE_SUPABASE_URL=https://winhdjtlwhgdoinfrxch.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Verification Command:**
```bash
node verify-database-setup.js
```

**Development Server:**
```bash
pnpm dev
```
