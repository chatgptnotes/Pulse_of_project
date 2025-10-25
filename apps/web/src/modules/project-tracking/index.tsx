import React from 'react';
import ProjectTrackingDashboard from './ProjectTrackingDashboard';

export { ProjectTrackingDashboard };

// Export all components for individual use
export { default as GanttChart } from './components/GanttChart';
export { default as KPIDashboard } from './components/KPIDashboard';
export { default as ClientCollaboration } from './components/ClientCollaboration';

// Export services
export { ProjectTrackingService } from './services/projectTrackingService';

// Export types
export * from './types';

// Export data
export { projectOverview, sampleProjectMilestones, neurosenseTasks } from './data/sample-project-milestones';

// Main component wrapper for easy integration
const ProjectTracking: React.FC = () => {
  return <ProjectTrackingDashboard />;
};

export default ProjectTracking;