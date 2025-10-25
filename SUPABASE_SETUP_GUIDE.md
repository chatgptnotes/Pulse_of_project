# Supabase Bug Tracking System Setup Guide

This guide will help you set up the complete bug tracking database system for both LinkList and Neuro360 projects using Supabase.

## 📋 Overview

The bug tracking system includes:
- **bug_reports** table for storing bug reports
- **testing_tracker** table for tracking testing activities
- **project_images** table for managing uploaded screenshots
- Storage bucket for image uploads
- Automated functions and triggers for data consistency

## 🔧 Prerequisites

1. Supabase project with valid URL and API keys
2. Environment variables properly configured in `.env` file
3. Admin access to Supabase Dashboard

## 📁 File Structure

```
supabase/
├── migrations/
│   ├── 001_create_bug_reports_table.sql
│   ├── 002_create_testing_tracker_table.sql
│   ├── 003_create_project_images_table.sql
│   └── 004_setup_storage_buckets.sql
├── deploy-migrations.sql (complete deployment script)
test-supabase-connection.js (connection test)
```

## 🚀 Deployment Steps

### Step 1: Verify Environment Configuration

Ensure your `.env` file contains:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Test the connection:
```bash
node test-supabase-connection.js
```

### Step 2: Deploy Database Schema

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/deploy-migrations.sql`
3. Execute the script
4. Verify successful deployment in the output

### Step 3: Configure Storage

The deployment script automatically creates the storage bucket and policies, but verify:

1. Go to Supabase Dashboard → Storage
2. Confirm `bug-report-images` bucket exists
3. Check that RLS policies are properly configured

### Step 4: Verify Table Creation

Run these queries in SQL Editor to verify setup:

```sql
-- Check tables exist
SELECT schemaname, tablename
FROM pg_tables
WHERE tablename IN ('bug_reports', 'testing_tracker', 'project_images')
AND schemaname = 'public';

-- Check functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (routine_name LIKE '%bug%' OR routine_name LIKE '%testing%' OR routine_name LIKE '%image%');

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'bug-report-images';
```

## 📊 Database Schema

### bug_reports Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| project_name | VARCHAR(100) | 'LinkList' or 'Neuro360' |
| project_version | VARCHAR(50) | Version number |
| sno | INTEGER | Serial number (auto-generated) |
| date | DATE | Report date |
| module | VARCHAR(255) | Module name |
| screen | VARCHAR(255) | Screen/page name |
| snag | TEXT | Bug description |
| severity | VARCHAR(10) | 'P1', 'P2', or 'P3' |
| image_url | TEXT | Screenshot URL |
| comments | TEXT | Additional comments |
| status | VARCHAR(20) | Bug status |
| testing_status | VARCHAR(20) | Testing verification status |
| assigned_to | VARCHAR(255) | Assignee |
| reported_by | VARCHAR(255) | Reporter |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### testing_tracker Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| bug_report_id | UUID | Foreign key to bug_reports |
| project_name | VARCHAR(100) | Project name |
| test_case_name | VARCHAR(255) | Test case name |
| test_description | TEXT | Test description |
| expected_result | TEXT | Expected outcome |
| actual_result | TEXT | Actual outcome |
| test_status | VARCHAR(20) | 'Pass', 'Fail', 'Blocked', 'Pending' |
| tester_name | VARCHAR(255) | Tester name |
| test_date | DATE | Test date |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### project_images Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| bug_report_id | UUID | Foreign key to bug_reports |
| project_name | VARCHAR(100) | Project name |
| file_name | VARCHAR(255) | Original filename |
| file_path | TEXT | Storage path |
| file_size | INTEGER | File size in bytes |
| content_type | VARCHAR(100) | MIME type |
| uploaded_by | VARCHAR(255) | Uploader |
| created_at | TIMESTAMPTZ | Upload timestamp |

## 🔍 Key Features

### Automatic Serial Numbers
- Each project maintains its own serial number sequence
- Uses `get_next_bug_sno(project_name)` function

### Testing Status Automation
- Bug testing status automatically updates based on test results
- Triggers ensure data consistency

### Image Management
- Organized storage structure: `project/bug-id/year/filename`
- Automatic URL generation for uploaded images
- Cleanup functions for orphaned images

### Security
- Row Level Security (RLS) enabled on all tables
- Storage bucket policies for secure file access
- Proper foreign key constraints

## 🎯 API Methods Available

The updated `supabaseService.js` provides these methods:

### Bug Reports
- `createBugReport(bugData)` - Create new bug report
- `getBugReports(projectName?)` - Get all bug reports
- `getBugReportById(id)` - Get specific bug report
- `updateBugReport(id, updates)` - Update bug report
- `deleteBugReport(id)` - Delete bug report
- `getBugReportsByStatus(status, projectName?)` - Filter by status
- `getBugReportsBySeverity(severity, projectName?)` - Filter by severity

### Testing Tracker
- `createTestRecord(testData)` - Create test record
- `getTestRecords(bugReportId?, projectName?)` - Get test records
- `updateTestRecord(id, updates)` - Update test record
- `deleteTestRecord(id)` - Delete test record
- `getTestingSummary(bugReportId)` - Get testing statistics

### Image Management
- `uploadBugImage(bugReportId, projectName, file, uploadedBy)` - Upload image
- `getBugImages(bugReportId)` - Get all images for bug
- `deleteImage(imageId)` - Delete image

### Analytics
- `getBugStatistics(projectName?)` - Get bug statistics
- `getStorageStatistics()` - Get storage usage stats

## 🧪 Testing

After deployment, test the system:

```bash
# Test connection
node test-supabase-connection.js

# Test in your application
import supabaseService from './apps/web/src/services/supabaseService.js';

// Create a test bug report
const bug = await supabaseService.createBugReport({
  project_name: 'Neuro360',
  module: 'Authentication',
  screen: 'Login',
  snag: 'Login button not responding',
  severity: 'P2',
  reported_by: 'tester@example.com'
});

console.log('Created bug:', bug);
```

## 🔒 Security Considerations

1. **RLS Policies**: Currently set to allow all operations. Customize based on your authentication requirements.
2. **Storage Access**: Images are publicly readable but uploads require authentication.
3. **API Keys**: Use anon key for client-side operations, service role key for admin operations only.

## 🛠️ Maintenance

### Regular Tasks
- Monitor storage usage with `getStorageStatistics()`
- Clean up orphaned images with `cleanup_orphaned_images()`
- Review and update RLS policies as needed

### Backup Strategy
- Supabase provides automatic backups
- Consider exporting critical data periodically
- Test restoration procedures

## 📞 Support

If you encounter issues:

1. Check Supabase Dashboard → Logs for error details
2. Verify environment variables are correctly set
3. Ensure RLS policies allow your operations
4. Check network connectivity to Supabase

## 🎉 Success!

Your bug tracking system is now ready to handle bug reports for both LinkList and Neuro360 projects with full image upload support and automated testing tracking!

---

**Next Steps:**
1. Update your BugReport component to use the new API methods
2. Implement image upload UI
3. Create testing workflow components
4. Set up project-specific dashboards