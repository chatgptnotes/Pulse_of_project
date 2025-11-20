# LinkList NFC Projects Table Setup Instructions

## Database Setup

To complete the setup of the `linklist_nfc_projects` table, you need to execute the SQL schema in your Supabase dashboard:

### Step 1: Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project: `omyltmcesgbhnqmhrrvq`
3. Go to **SQL Editor** in the sidebar

### Step 2: Execute the Schema
1. Copy the contents of `linklist_nfc_projects_schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the schema

### Step 3: Verify Installation
The schema will create:
- ✅ `linklist_nfc_projects` table with comprehensive structure
- ✅ Performance indexes for fast queries
- ✅ Row Level Security (RLS) policies
- ✅ Auto-updating timestamp triggers
- ✅ Integration with existing `bug_reports` table
- ✅ Database functions for statistics and search
- ✅ Sample data for testing

### Step 4: Test the Integration
After running the SQL, you can test the integration by:

```bash
cd /Users/murali/NEURO24OCT/Neuro360
node test-supabase-connection.js
```

## Available NFC Project Methods

The `supabaseService.js` now includes comprehensive methods for NFC project management:

### Core CRUD Operations
- `createNFCProject(projectData)` - Create new NFC project
- `getNFCProjects(filters)` - Get all projects with optional filtering
- `getNFCProjectById(id)` - Get single project by ID
- `updateNFCProject(id, updates)` - Update project
- `deleteNFCProject(id)` - Delete project

### Filtering and Search
- `getNFCProjectsByStatus(status)` - Filter by status
- `getNFCProjectsByPriority(priority)` - Filter by priority
- `getNFCProjectsByAssignee(assignedTo)` - Filter by assignee
- `getNFCProjectsByClient(clientName)` - Filter by client
- `searchNFCProjects(searchTerm)` - Full-text search

### Project Management
- `getNFCProjectsWithUpcomingDeadlines(daysAhead)` - Get projects due soon
- `getOverdueNFCProjects()` - Get overdue projects
- `updateNFCProjectStatus(id, status)` - Update status with auto-completion
- `getNFCProjectStatistics()` - Get comprehensive statistics
- `getNFCProjectCostAnalysis(projectId)` - Cost and budget analysis

### Bug Report Integration
- `linkBugReportToNFCProject(bugReportId, nfcProjectId)` - Link bug to project
- `getBugReportsForNFCProject(nfcProjectId)` - Get bugs for project

## Example Usage

```javascript
import supabaseService from './src/services/supabaseService.js';

// Create a new NFC project
const newProject = await supabaseService.createNFCProject({
  project_name: "Smart Business Cards - TechCorp",
  project_description: "Digital business cards with NFC technology",
  nfc_tag_type: "NTAG213",
  nfc_data_format: "vCard",
  nfc_payload: {
    name: "John Doe",
    title: "CEO",
    company: "TechCorp",
    email: "john@techcorp.com",
    phone: "+1234567890"
  },
  project_status: "Active",
  project_priority: "High",
  created_by: "project.manager@linklist.com",
  assigned_to: "developer@linklist.com",
  client_name: "TechCorp Inc.",
  deployment_location: "Corporate Headquarters",
  tag_quantity: 50,
  estimated_completion_date: "2024-11-30",
  project_budget: 5000.00,
  notes: "Premium NFC business cards with custom branding"
});

// Get all active projects
const activeProjects = await supabaseService.getNFCProjectsByStatus('Active');

// Search projects
const searchResults = await supabaseService.searchNFCProjects('TechCorp');

// Get project statistics
const stats = await supabaseService.getNFCProjectStatistics();
```

## Table Structure

The `linklist_nfc_projects` table includes:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `project_name` | VARCHAR(255) | Project name |
| `project_description` | TEXT | Project description |
| `nfc_tag_type` | VARCHAR(50) | NFC tag type (NTAG213, NTAG215, etc.) |
| `nfc_data_format` | VARCHAR(50) | Data format (URL, vCard, Text, etc.) |
| `nfc_payload` | JSONB | NFC data payload |
| `project_status` | VARCHAR(20) | Status (Draft, Active, Completed, etc.) |
| `project_priority` | VARCHAR(10) | Priority (Low, Medium, High, Critical) |
| `created_by` | VARCHAR(255) | Project creator |
| `assigned_to` | VARCHAR(255) | Project assignee |
| `client_name` | VARCHAR(255) | Client name |
| `deployment_location` | VARCHAR(255) | Deployment location |
| `tag_quantity` | INTEGER | Number of NFC tags |
| `estimated_completion_date` | DATE | Estimated completion |
| `actual_completion_date` | DATE | Actual completion |
| `project_budget` | DECIMAL(10,2) | Project budget |
| `project_cost` | DECIMAL(10,2) | Actual project cost |
| `notes` | TEXT | Additional notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

## Integration with Bug Reports

Bug reports can now be linked to NFC projects using the `nfc_project_id` foreign key. This allows you to track which bugs are related to specific NFC projects and provides better project management capabilities.