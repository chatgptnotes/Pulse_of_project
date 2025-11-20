import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { testSupabaseConnection } from './utils/supabaseTest';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import ProjectTrackingPage from './pages/ProjectTracking.jsx';
import PulseOfProjectPage from './pages/PulseOfProject.jsx';
import PulseOfProjectLanding from './pages/PulseOfProjectLanding.jsx';
import ClientView from './pages/ClientView.jsx';
import ShareLinksPage from './pages/ShareLinksPage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import SimpleAuth from './pages/SimpleAuth.jsx';
import AdminPage from './pages/AdminPage.jsx';
import UserManagement from './pages/UserManagement.jsx';


function App() {
  console.log('🚀 App component loading...');

  // Test Bug Tracking database connection on app startup
  useEffect(() => {
    const runConnectionTest = async () => {
      console.log('🚀 PulseOfProject Bug Tracking System Starting...');
      await testSupabaseConnection();
    };

    runConnectionTest();
  }, []);

  // Add global error handler
  React.useEffect(() => {
    const handleError = (event) => {
      console.error('🚨 Global error caught:', event.error);
      
      // Check if it's a navigation/routing error
      if (event.error && (
        event.error.message.includes('Loading chunk') ||
        event.error.message.includes('Failed to fetch') ||
        event.error.message.includes('Cannot read properties') ||
        event.error.name === 'ChunkLoadError'
      )) {
        console.error('🚨 Navigation/Chunk loading error detected');
        // Force reload to clear any stale state
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    };
    
    const handleUnhandledRejection = (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
      
      // Check for common navigation errors
      if (event.reason && (
        String(event.reason).includes('Loading chunk') ||
        String(event.reason).includes('Failed to fetch') ||
        String(event.reason).includes('Cannot read properties')
      )) {
        console.error('🚨 Navigation promise rejection detected');
      }
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="App min-h-screen flex flex-col">
            {/* 🚀 Development Mode Banner */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2 px-4 text-sm font-medium shadow-lg">
              🔒 Super Admin Access Only - Login Required for All Pages
            </div>
            <div className="pt-12 flex-grow"> {/* Add padding to account for banner */}
            <Routes>
            {/* Public Routes - Only Landing and Login */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<SimpleAuth />} />
            <Route path="/auth" element={<SimpleAuth />} />

            {/* Protected Routes - Super Admin Only */}

            {/* About Page */}
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <PulseOfProjectLanding />
                </ProtectedRoute>
              }
            />

            {/* PulseOfProject Product Routes */}
            <Route
              path="/pulseofproject"
              element={
                <ProtectedRoute>
                  <PulseOfProjectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pulse"
              element={
                <ProtectedRoute>
                  <PulseOfProjectPage />
                </ProtectedRoute>
              }
            />

            {/* Project Tracking Routes */}
            <Route
              path="/project-tracking"
              element={
                <ProtectedRoute>
                  <ProjectTrackingPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Super Admin Only */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            {/* Client Share View - Protected */}
            <Route
              path="/client/:shareToken"
              element={
                <ProtectedRoute>
                  <ClientView />
                </ProtectedRoute>
              }
            />

            {/* Project Share Links - Protected */}
            <Route
              path="/sharelinks"
              element={
                <ProtectedRoute>
                  <ShareLinksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/share-links"
              element={
                <ProtectedRoute>
                  <ShareLinksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project-links"
              element={
                <ProtectedRoute>
                  <ShareLinksPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all route - redirect to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div> {/* Close padding div */}

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          {/* App Footer with version info */}
          <Footer />
          </div> {/* Close main App div */}
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
