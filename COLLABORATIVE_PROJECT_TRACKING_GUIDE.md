# Collaborative Project Tracking Guide

## Overview
The NeuroSense360 Project Tracking module now includes **full editing capabilities** that allow all team members and stakeholders to collaboratively update project status in real-time.

## Key Features

### 🔐 Edit Mode
- **Enable Edit Mode**: Click the "Edit Mode" button in the top-right corner
- **Edit Lock**: Prevents simultaneous editing conflicts (5-minute timeout)
- **Auto-save**: Changes are automatically saved every 30 seconds
- **Manual Save**: Click "Save" button to immediately persist changes

### 📝 Editable Elements

#### Milestones
- **Name & Description**: Click edit icon to modify
- **Status**: Change between Pending, In Progress, Completed, Delayed
- **Dates**: Update start and end dates
- **Progress**: Adjust progress slider (0-100%)
- **Deliverables**: Add/remove deliverable items
- **KPIs**: Add/edit/update Key Performance Indicators

#### Tasks
- **Add Tasks**: Click "Add Task" button within any milestone
- **Task Details**: Name, priority, status, dates
- **Delete Tasks**: Remove tasks with the trash icon
- **Progress Tracking**: Update individual task progress

#### KPIs
- **Dynamic Calculation**: Status auto-updates based on current/target ratio
- **Custom Metrics**: Add any measurable KPI
- **Real-time Updates**: Changes reflect immediately in dashboard

### 💾 Data Management

#### Local Storage
- All changes are saved locally in browser storage
- Data persists between sessions
- Works offline - no internet required

#### Export/Import
1. **Export**: Click download button to save as JSON file
2. **Import**: Click upload button to load a JSON file
3. **Share**: Click share button to copy project link

### 👥 Collaboration Features

#### Real-time Status
- **Online/Offline Indicator**: Shows connection status
- **Last Saved Time**: Displays when data was last saved
- **Unsaved Changes**: Yellow warning when changes pending
- **Edit Lock**: Shows who's currently editing

#### Comments & Updates
- **Add Comments**: Discuss milestones and tasks
- **Activity Feed**: Automatic updates when changes are made
- **Notifications**: Get alerts for important changes

## How to Collaborate

### For Project Managers

1. **Daily Updates**:
   ```
   1. Go to /project-tracking
   2. Click "Edit Mode"
   3. Update milestone progress
   4. Update task statuses
   5. Click "Save" or wait for auto-save
   ```

2. **Weekly Reviews**:
   ```
   1. Export current data for backup
   2. Review all KPIs
   3. Update milestone statuses
   4. Add comments for team
   ```

### For Developers

1. **Update Your Tasks**:
   ```
   1. Navigate to your assigned milestone
   2. Enable Edit Mode
   3. Update task progress
   4. Mark completed tasks
   5. Add new tasks as needed
   ```

2. **Report Blockers**:
   ```
   1. Change task status to "Blocked"
   2. Add comment explaining issue
   3. Update milestone status if needed
   ```

### For Clients (Dr. Sweta/LBW Team)

1. **View Progress**:
   ```
   - Check overall progress bar
   - Review KPI dashboard
   - Read recent updates
   ```

2. **Provide Feedback**:
   ```
   - Use Comments section
   - Tag specific milestones
   - Request changes via comments
   ```

## Data Sharing Protocol

### Method 1: Shared JSON File (Recommended)

1. **Setup Shared Location**:
   ```
   Create a shared folder (Google Drive, Dropbox, GitHub)
   Store the master project JSON file there
   ```

2. **Update Process**:
   ```
   1. Download latest JSON from shared location
   2. Import into your local project tracking
   3. Make your updates
   4. Export updated JSON
   5. Upload back to shared location
   6. Notify team via Slack/Email
   ```

### Method 2: GitHub Integration

1. **Create Repository**:
   ```bash
   git init project-tracking
   cd project-tracking
   ```

2. **Daily Sync**:
   ```bash
   # Pull latest
   git pull origin main

   # Import JSON to web app
   # Make changes in Edit Mode
   # Export JSON

   # Commit and push
   git add neurosense-project.json
   git commit -m "Updated: [describe changes]"
   git push origin main
   ```

### Method 3: Real-time Database (Future)

For true real-time collaboration, integrate with Supabase:
- Automatic sync across all users
- No manual import/export needed
- Instant updates visible to all

## Best Practices

### ✅ DO's
- **Update Daily**: Keep progress current
- **Be Specific**: Add detailed task descriptions
- **Communicate**: Use comments for important notes
- **Backup Regular**: Export JSON weekly
- **Tag Changes**: Note what you updated

### ❌ DON'Ts
- Don't edit while offline for extended periods
- Don't forget to save before closing
- Don't delete others' tasks without discussion
- Don't change milestone dates without approval

## Keyboard Shortcuts

- `Ctrl/Cmd + S`: Save changes
- `Ctrl/Cmd + E`: Toggle edit mode
- `Ctrl/Cmd + D`: Download/Export
- `Ctrl/Cmd + O`: Open/Import

## Troubleshooting

### Lost Changes?
1. Check browser's local storage
2. Look for auto-save backup
3. Check "Last Saved" timestamp

### Can't Edit?
1. Check if someone else has edit lock
2. Wait 5 minutes for lock to expire
3. Refresh page and try again

### Data Out of Sync?
1. Export your version
2. Import latest shared version
3. Manually merge changes
4. Re-export merged version

## Version Control

### Naming Convention
```
neurosense-project-YYYY-MM-DD-[initials].json
Example: neurosense-project-2025-10-24-HVR.json
```

### Change Log
Always note in comments or commit message:
- What changed
- Why it changed
- Who made the change
- Date/time of change

## Contact for Issues

- **Technical Issues**: Development Team
- **Project Questions**: Haritha V R (PM)
- **Feature Requests**: Submit via comments

## Quick Start Video
[Coming Soon - Screen recording of edit workflow]

---

**Remember**: This is a collaborative tool. Your updates help everyone stay informed!

Last Updated: October 24, 2025
Version: 2.0 (Editable)