import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getProjectByShareToken } from '../modules/pulseofproject/data/projects';
import PulseOfProject from '../modules/pulseofproject/PulseOfProject';

const ClientView = () => {
  const { shareToken } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔗 Client view loading for shareToken:', shareToken);

    // Find project by share token
    const foundProject = getProjectByShareToken(shareToken);

    if (foundProject) {
      console.log('✅ Project found:', foundProject.name);
      setProject(foundProject);
    } else {
      console.error('❌ Project not found for shareToken:', shareToken);
      setProject(null);
    }

    setLoading(false);
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Share Link</h1>
            <p className="text-gray-600 mb-6">
              This project share link is invalid or has been removed. Please contact the project administrator for a valid link.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Render the PulseOfProject page locked to this project
  return (
    <PulseOfProject
      clientMode={true}
      projectId={project.id}
    />
  );
};

export default ClientView;
