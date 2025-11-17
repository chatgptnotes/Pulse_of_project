# Project Tracking Module for NeuroSense360

## Overview
A comprehensive project tracking module designed for client collaboration on the LBW-NeuroSense Web Application project. This module provides Gantt charts, milestone KPIs, and collaboration features aligned with the project scope shared with Dr. Sweta.

## Features

### 1. **Gantt Chart View**
- Interactive timeline visualization of all 10 project phases
- Milestone and task tracking with progress indicators
- Color-coded status indicators (Pending, In Progress, Completed, Delayed)
- Expandable tasks under each milestone
- Real-time progress tracking
- Multiple view modes (Week, Month, Quarter)

### 2. **KPI Dashboard**
- Overall project progress metrics
- Milestone-specific KPIs with targets and current values
- Status distribution (On Track, At Risk, Off Track)
- Budget utilization tracking
- Upcoming deadlines with countdown
- Team performance metrics
- Visual charts using Recharts library

### 3. **Client Collaboration**
- **Comments System**: Real-time discussion threads
- **Project Updates**: Automated activity feed
- **Document Sharing**: Centralized document repository
- **Notifications**: Alert system for important updates
- **File Attachments**: Support for sharing project files

## Project Milestones & Timeline

### 10-Week Development Schedule (Oct 21 - Dec 31, 2025)

1. **Phase 1: Foundation & Infrastructure** (Week 1)
   - Database setup, authentication, core API

2. **Phase 2: Landing Page & Marketing** (Week 2)
   - Public website, clinic locator, content sections

3. **Phase 3: Super Admin Dashboard** (Weeks 3-4)
   - Multi-clinic management, payment integration, algorithms

4. **Phase 4: Clinic Admin Dashboard** (Week 5)
   - Patient management, EDF upload, report access

5. **Phase 5: Patient Portal** (Week 6)
   - Personal profiles, report access, care plans

6. **Phase 6: Algorithm Integration** (Week 7)
   - NeuroSense algorithms, report generation

7. **Phase 7: Notifications & Alerts** (Week 8)
   - Email/SMS/in-app notifications

8. **Phase 8: Testing & QA** (Week 9)
   - Comprehensive testing, bug fixes

9. **Phase 9: Deployment & Documentation** (Week 9-10)
   - Production setup, documentation

10. **Phase 10: Launch & Handover** (Week 10)
    - Go-live, training, support handover

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
Run the Supabase migration to create necessary tables:
```bash
npx supabase migration up
```

### 3. Add Route to Your App
Add the following route to your main App.jsx:

```javascript
import ProjectTrackingPage from './pages/ProjectTracking';

// In your Routes component
<Route path="/project-tracking" element={
  <ProtectedRoute allowedRoles={['superAdmin', 'clinic']}>
    <ProjectTrackingPage />
  </ProtectedRoute>
} />
```

## Usage

### Access the Module
Navigate to `/project-tracking` in your application

### For Project Managers
- Monitor overall project progress
- Track milestone KPIs
- Review team performance
- Export project reports

### For Clients (Dr. Sweta/LBW Team)
- View real-time project status
- Comment on milestones and tasks
- Access project documents
- Receive update notifications

### For Development Team
- Update task progress
- Log time spent on tasks
- Mark milestones as complete
- Add project updates

## Data Management

### Supabase Integration
The module uses Supabase for:
- Real-time data synchronization
- Persistent storage of project data
- User authentication and permissions
- File storage for attachments

### Key Tables
- `projects` - Main project information
- `project_milestones` - Milestone tracking
- `project_tasks` - Task management
- `milestone_kpis` - KPI metrics
- `project_comments` - Collaboration comments
- `project_updates` - Activity feed

## API Services

The `ProjectTrackingService` class provides methods for:
- CRUD operations on projects, milestones, tasks
- Real-time subscription to changes
- Comment and update management
- KPI tracking and updates

## Customization

### Modify Milestones
Edit `/src/modules/project-tracking/data/neurosense-milestones.ts`

### Adjust KPI Targets
Update KPI definitions in the milestone data

### Change Visual Theme
Modify color schemes in component files

### Add Custom Views
Extend the dashboard with additional visualization components

## Key Components

1. **GanttChart** - Timeline visualization
2. **KPIDashboard** - Metrics and analytics
3. **ClientCollaboration** - Communication hub
4. **ProjectTrackingDashboard** - Main container

## Export Capabilities

- **JSON Export**: Full project data export
- **PDF Reports**: (To be implemented)
- **Excel Export**: (To be implemented)

## Performance Considerations

- Lazy loading of task details
- Virtualized lists for large datasets
- Optimized real-time subscriptions
- Caching of static data

## Security

- Row-level security in Supabase
- Role-based access control
- Secure file uploads
- Authenticated API calls

## Support

For questions or issues, contact:
- **Project Manager**: Haritha V R (admin@bettroi.com)
- **Technical Lead**: Biji Thomas (bt.thomas@bettroi.com)
- **Client Contact**: Dr. Murali BK (cmd@hopehospital.com)

## License

Proprietary - BETTROI & Limitless Brain Wellness

---

**Last Updated**: October 24, 2025
**Version**: 1.0.0