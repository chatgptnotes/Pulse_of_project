import React from 'react';
import { useLocation } from 'react-router-dom';
import EditableProjectDashboard from '../modules/project-tracking/EditableProjectDashboard';

const ProjectTrackingPage = () => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const projectId = urlParams.get('project') || 'default-project';

  return (
    <div className="min-h-screen bg-gray-50">
      <EditableProjectDashboard projectId={projectId} />
    </div>
  );
};

export default ProjectTrackingPage;