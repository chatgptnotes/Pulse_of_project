import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Activity, GitBranch, Github, Gitlab, AlertCircle, CheckCircle2,
  Settings, Users, BarChart3, Calendar, Zap, Bell, Download,
  Upload, Share2, RefreshCw, Webhook, Database, Cloud, MessageSquare, Menu, X, ArrowRight, Edit3
} from 'lucide-react';
import { PRODUCT_CONFIG, CLIENT_CONFIG } from './config/brand';
import ProjectSelector from './components/ProjectSelector';
import AutoProgressTracker from './components/AutoProgressTracker';
import IntegrationPanel from './components/IntegrationPanel';
import ClientPortal from './components/ClientPortal';
import DashboardMetrics from './components/DashboardMetrics';
import ChatCollaboration from './components/ChatCollaboration';
import BugReport from './components/BugReport';
import TestingTracker from './components/TestingTracker';
import GanttChart from '../project-tracking/components/GanttChart';
import ProjectDocuments from '../project-tracking/components/ProjectDocuments';
import { projectOverview } from '../project-tracking/data/sample-project-milestones';
import { ProjectTrackingService } from '../project-tracking/services/projectTrackingService';

interface PulseOfProjectProps {
  clientMode?: boolean;
  projectId?: string;
  apiKey?: string;
}

const PulseOfProject: React.FC<PulseOfProjectProps> = ({
  clientMode = false,
  projectId = 'neurosense-mvp',
  apiKey
}) => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(projectId);
  const [projectData, setProjectData] = useState(projectOverview);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [notifications, setNotifications] = useState<Array<any>>([]);
  const [showChat, setShowChat] = useState(true);
  const [bugs, setBugs] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Collapsed by default
  const [integrations, setIntegrations] = useState({
    github: { connected: false, repos: [] },
    gitlab: { connected: false, projects: [] },
    jira: { connected: false, projects: [] },
    slack: { connected: false, channels: [] }
  });

  // Update selectedProject when projectId prop changes
  useEffect(() => {
    setSelectedProject(projectId);
  }, [projectId]);

  // Load project data based on selected project
  useEffect(() => {
    import('./data/projects').then(({ projects }) => {
      const project = projects.find(p => p.id === selectedProject);
      if (project) {
        // Generate milestone data based on project progress
        const totalMilestones = 10;
        const completedCount = Math.floor((project.progress / 100) * totalMilestones);
        const inProgressCount = project.progress < 100 ? 1 : 0;

        const milestones = Array.from({ length: totalMilestones }, (_, i) => {
          const milestoneNumber = i + 1;
          let status: 'completed' | 'in-progress' | 'pending' = 'pending';
          let progress = 0;

          if (milestoneNumber <= completedCount) {
            status = 'completed';
            progress = 100;
          } else if (milestoneNumber === completedCount + 1 && inProgressCount > 0) {
            status = 'in-progress';
            progress = ((project.progress % 10) || 10) * 10;
          }

          return {
            id: `milestone-${milestoneNumber}`,
            name: `Phase ${milestoneNumber}: ${['Foundation', 'Development', 'Integration', 'Testing', 'Polish', 'Deployment', 'Launch', 'Optimization', 'Scale', 'Completion'][i]}`,
            description: `Phase ${milestoneNumber} of project development`,
            status,
            startDate: new Date(),
            endDate: new Date(),
            progress,
            deliverables: [],
            assignedTo: [],
            dependencies: [],
            order: milestoneNumber,
            color: '#4F46E5',
            kpis: []
          };
        });

        // Calculate start and end dates
        const endDate = project.deadline ? new Date(project.deadline) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // Default 90 days from now
        const startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - 3); // Start date is 3 months before end date

        setProjectData({
          ...projectOverview,
          id: project.id,
          name: project.name,
          description: project.description || `${project.client} project`,
          client: project.client,
          startDate,
          endDate,
          overallProgress: project.progress,
          milestones,
          team: Array.from({ length: project.team }, (_, i) => ({
            id: String(i + 1),
            name: `Team Member ${i + 1}`,
            email: `member${i + 1}@${project.client.toLowerCase().replace(/\s+/g, '')}.com`,
            role: 'Developer',
            allocation: 100
          }))
        });
      }
    });
  }, [selectedProject]);

  // Navigate to detailed project tracking page
  const goToDetailedView = () => {
    navigate(`/project-tracking-public?project=${selectedProject}`);
  };

  // Automatic progress tracking via webhooks/polling
  const syncProjectProgress = useCallback(async () => {
    setSyncStatus('syncing');

    try {
      // Simulate fetching updates from various sources
      const updates = await fetchProgressUpdates();

      if (updates.length > 0) {
        applyProgressUpdates(updates);
        setNotifications(prev => [...prev, ...updates.map(u => ({
          id: Date.now(),
          type: 'update',
          message: u.message,
          timestamp: new Date()
        }))]);
      }

      setLastSync(new Date());
      setSyncStatus('success');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }
  }, [selectedProject]);

  // Fetch progress updates from integrated sources
  const fetchProgressUpdates = async () => {
    const updates = [];

    // GitHub Integration
    if (integrations.github.connected) {
      // Simulate fetching commits, PRs, issues
      const githubActivity = {
        commits: Math.floor(Math.random() * 5),
        prs: Math.floor(Math.random() * 2),
        issues: Math.floor(Math.random() * 3)
      };

      if (githubActivity.commits > 0) {
        updates.push({
          source: 'github',
          type: 'commit',
          message: `${githubActivity.commits} new commits detected`,
          impact: { progress: githubActivity.commits * 2 }
        });
      }
    }

    // Jira Integration
    if (integrations.jira.connected) {
      // Simulate Jira ticket updates
      const jiraUpdates = Math.random() > 0.5 ? 1 : 0;
      if (jiraUpdates > 0) {
        updates.push({
          source: 'jira',
          type: 'ticket',
          message: 'Ticket moved to Done',
          impact: { progress: 5, status: 'in-progress' }
        });
      }
    }

    return updates;
  };

  // Apply progress updates to project data
  const applyProgressUpdates = (updates: any[]) => {
    setProjectData(prev => {
      const updated = { ...prev };

      updates.forEach(update => {
        // Update milestone progress based on rules
        if (update.impact.progress) {
          const activeMilestone = updated.milestones.find(m => m.status === 'in-progress');
          if (activeMilestone) {
            activeMilestone.progress = Math.min(100, activeMilestone.progress + update.impact.progress);

            // Auto-complete milestone if progress reaches 100%
            if (activeMilestone.progress === 100) {
              activeMilestone.status = 'completed';

              // Start next milestone
              const nextMilestone = updated.milestones.find(m => m.status === 'pending');
              if (nextMilestone) {
                nextMilestone.status = 'in-progress';
              }
            }
          }
        }
      });

      // Recalculate overall progress
      const totalProgress = updated.milestones.reduce((sum, m) => sum + m.progress, 0) / updated.milestones.length;
      updated.overallProgress = Math.round(totalProgress);

      return updated;
    });
  };

  // Handle deliverable toggle
  const handleDeliverableToggle = useCallback(async (milestoneId: string, deliverableId: string) => {
    console.log('=== handleDeliverableToggle CALLED IN PulseOfProject ===');
    console.log('milestoneId:', milestoneId, 'deliverableId:', deliverableId);

    // Get the milestone data before updating
    const milestone = projectData.milestones.find(m => m.id === milestoneId);

    // Update local state with functional update
    setProjectData((prevData) => {
      const updatedMilestones = prevData.milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          const updatedDeliverables = milestone.deliverables.map(deliverable =>
            deliverable.id === deliverableId
              ? { ...deliverable, completed: !deliverable.completed }
              : deliverable
          );
          return { ...milestone, deliverables: updatedDeliverables };
        }
        return milestone;
      });

      return {
        ...prevData,
        milestones: updatedMilestones
      };
    });

    // Save to Supabase with milestone data
    try {
      const milestoneData = milestone ? {
        project_id: projectData.id,
        name: milestone.name,
        description: milestone.description,
        status: milestone.status,
        start_date: milestone.startDate instanceof Date ? milestone.startDate.toISOString() : new Date(milestone.startDate).toISOString(),
        end_date: milestone.endDate instanceof Date ? milestone.endDate.toISOString() : new Date(milestone.endDate).toISOString(),
        progress: milestone.progress,
        deliverables: milestone.deliverables,
        assigned_to: milestone.assignedTo || [],
        dependencies: milestone.dependencies || [],
        order: milestone.order,
        color: milestone.color || '#4F46E5'
      } : undefined;

      const success = await ProjectTrackingService.toggleDeliverable(milestoneId, deliverableId, milestoneData);
      if (success) {
        toast.success('Deliverable status saved to database');
      } else {
        toast.error('Failed to save to database (saved locally)');
      }
    } catch (error) {
      console.error('Error saving deliverable to Supabase:', error);
      toast.error('Failed to save to database (saved locally)');
    }
  }, [projectData]);

  // Auto-sync on interval
  useEffect(() => {
    if (autoUpdateEnabled && PRODUCT_CONFIG.integrations.github.autoSync) {
      const interval = setInterval(syncProjectProgress, PRODUCT_CONFIG.integrations.github.syncInterval);
      return () => clearInterval(interval);
    }
  }, [autoUpdateEnabled, syncProjectProgress]);

  // Initial sync on mount
  useEffect(() => {
    syncProjectProgress();
  }, []);

  const connectIntegration = async (service: string) => {
    // Simulate OAuth flow
    console.log(`Connecting to ${service}...`);

    setTimeout(() => {
      setIntegrations(prev => ({
        ...prev,
        [service]: { ...prev[service as keyof typeof prev], connected: true }
      }));

      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: `Successfully connected to ${service}`,
        timestamp: new Date()
      }]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Product Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Integrations Sidebar Toggle Button */}
              {!clientMode && (
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isSidebarOpen
                      ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={isSidebarOpen ? "Close Integrations Panel" : "Open Integrations Panel (GitHub, Jira, etc.)"}
                >
                  {isSidebarOpen ? (
                    <>
                      <X className="w-5 h-5" />
                      <span className="text-sm font-medium hidden md:block">Close</span>
                    </>
                  ) : (
                    <>
                      <Menu className="w-5 h-5" />
                      <span className="text-sm font-medium hidden md:block">Integrations</span>
                    </>
                  )}
                </button>
              )}
              <Activity className="w-8 h-8 text-indigo-600" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {PRODUCT_CONFIG.name}
                  </h1>
                  <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-full">
                    A Bettroi Product
                  </span>
                </div>
                <p className="text-sm text-gray-500">{PRODUCT_CONFIG.tagline}</p>
              </div>
            </div>

            {!clientMode && (
              <div className="flex items-center gap-4">
                {/* Sync Status */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                  <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  <span className="text-sm">
                    {syncStatus === 'syncing' ? 'Syncing...' :
                     syncStatus === 'success' ? 'Synced' :
                     syncStatus === 'error' ? 'Sync Failed' : 'Ready'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {lastSync.toLocaleTimeString()}
                  </span>
                </div>

                {/* Auto-Update Toggle */}
                <button
                  onClick={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    autoUpdateEnabled
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Auto-Update {autoUpdateEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* Chat/Collaboration */}
                <button
                  onClick={() => setShowChat(!showChat)}
                  className={`relative p-2 rounded-lg transition-colors flex items-center gap-2 ${
                    showChat ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Project Chat"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm font-medium">Chat</span>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </button>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-gray-100">
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>

                {/* Settings */}
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex relative">
        {/* Sidebar - Integration Panel (hidden in client mode) */}
        <AnimatePresence>
          {!clientMode && isSidebarOpen && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-80 bg-white border-r border-gray-200 h-[calc(100vh-73px)] overflow-y-auto"
            >
              <IntegrationPanel
                integrations={integrations}
                onConnect={connectIntegration}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Dashboard */}
        <main className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ${!isSidebarOpen || clientMode ? 'ml-0' : ''}`}>
          {/* Project Selector - TOP */}
          <ProjectSelector
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
            clientMode={clientMode}
          />

          {/* Navigate to Detailed Project Tracking Button */}
          {!clientMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 mb-6"
            >
              <button
                onClick={goToDetailedView}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Edit3 className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-lg">View Detailed Project Plan</div>
                    <div className="text-sm opacity-90">
                      Edit milestones, tasks, dates, and full project details
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {/* Metrics Dashboard - SECOND */}
          <DashboardMetrics projectData={projectData} />

          {/* Bug Report Module - THIRD (Below project info) */}
          <div className="mt-6">
            <BugReport
              key={selectedProject}
              projectName={selectedProject}
              version="v1.0.0"
              onBugsUpdate={setBugs}
            />
          </div>

          {/* Testing Tracker Module - FOURTH (Below bug reports) */}
          <div className="mt-6">
            <TestingTracker
              key={`testing-${selectedProject}`}
              projectName={selectedProject}
              bugs={bugs}
            />
          </div>

          {/* Project Documents - FIFTH (Below testing tracker) */}
          <div className="mt-6">
            <ProjectDocuments
              projectId={selectedProject}
              isEditMode={!clientMode}
            />
          </div>

          {/* Auto Progress Tracker */}
          <AutoProgressTracker
            projectData={projectData}
            lastSync={lastSync}
            syncStatus={syncStatus}
            onManualSync={syncProjectProgress}
          />

          {/* Gantt Chart */}
          <div className="mt-6">
            <GanttChart
              data={{
                ...projectData,
                viewMode: 'month'
              }}
              onDeliverableToggle={handleDeliverableToggle}
              showTasks={true}
              interactive={true}
            />
          </div>

          {/* Recent Activity Feed */}
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <AnimatePresence>
                {notifications.slice(-5).reverse().map((notif, idx) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {notif.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : notif.type === 'error' ? (
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    ) : (
                      <Activity className="w-5 h-5 text-blue-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notif.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button for Manual Sync (hidden in client mode) */}
      {!clientMode && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={syncProjectProgress}
          className="fixed bottom-6 left-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className={`w-6 h-6 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
        </motion.button>
      )}

      {/* Chat Collaboration Module */}
      {showChat && (
        <ChatCollaboration
          projectName={selectedProject}
          clientMode={clientMode}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default PulseOfProject;