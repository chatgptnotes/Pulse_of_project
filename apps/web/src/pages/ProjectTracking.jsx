import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

// Lazy load the dashboard
const EditableProjectDashboard = React.lazy(() =>
  import('../modules/project-tracking/EditableProjectDashboard')
);

// Specific Error Boundary for Project Tracking
class ProjectTrackingErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 ProjectTracking Error:', error, errorInfo);
  }

  clearProjectData = () => {
    const { projectId } = this.props;
    console.log(`🗑️ Clearing all data for project: ${projectId}`);

    // Clear all project-related data
    localStorage.removeItem(`project-${projectId}-data`);
    localStorage.removeItem(`project-${projectId}-last-saved`);
    localStorage.removeItem(`project-${projectId}-edit-lock`);

    // Reload the page
    window.location.reload();
  };

  clearAllProjectData = () => {
    console.log('🗑️ Clearing ALL project data');

    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    const projectKeys = keys.filter(key => key.startsWith('project-'));

    projectKeys.forEach(key => {
      console.log(`  Removing: ${key}`);
      localStorage.removeItem(key);
    });

    // Reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { projectId } = this.props;

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Project Dashboard Error
            </h2>

            <p className="text-gray-600 text-center mb-6">
              There was an error loading the project dashboard. This is often caused by corrupted data in your browser's storage.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Project ID:</strong> {projectId}
              </p>
              <p className="text-sm text-gray-600">
                Try clearing the project data to reset to defaults.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.clearProjectData}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Clear This Project's Data
              </button>

              <button
                onClick={this.clearAllProjectData}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Clear All Projects Data
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Return to Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 bg-red-50 rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-red-700 mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-red-600 overflow-auto whitespace-pre-wrap">
                  {this.state.error && this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ProjectTrackingPage = () => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const projectId = urlParams.get('project') || 'default-project';

  console.log('🔍 ProjectTrackingPage rendering');
  console.log('  Project ID:', projectId);
  console.log('  URL:', location.pathname + location.search);

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectTrackingErrorBoundary projectId={projectId}>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
              <p className="text-xl font-semibold text-gray-700">Loading Project Dashboard...</p>
              <p className="text-sm text-gray-500 mt-2">Project ID: {projectId}</p>
            </div>
          </div>
        }>
          <EditableProjectDashboard projectId={projectId} />
        </Suspense>
      </ProjectTrackingErrorBoundary>
    </div>
  );
};

export default ProjectTrackingPage;