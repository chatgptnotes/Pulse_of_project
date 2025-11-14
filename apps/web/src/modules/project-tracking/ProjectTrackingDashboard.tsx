import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import GanttChart from './components/GanttChart';
import KPIDashboard from './components/KPIDashboard';
import ClientCollaboration from './components/ClientCollaboration';
import TeamManagement from './components/TeamManagement';
import { projectOverview } from './data/sample-project-milestones';
import { ProjectComment, ProjectUpdate, ProjectMilestone, MilestoneKPI } from './types';
import { ProjectTrackingService } from './services/projectTrackingService';
import {
  BarChart3, MessageSquare, Target, FileText, Settings,
  Download, Share2, RefreshCw, Filter, Calendar, Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ProjectTrackingDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'gantt' | 'kpi' | 'collaboration' | 'team'>('gantt');
  const [projectData, setProjectData] = useState(projectOverview);
  const [comments, setComments] = useState<ProjectComment[]>([
    {
      id: '1',
      userId: '1',
      userName: 'Haritha V R',
      message: 'Please review the updated milestone schedule and provide feedback on the Phase 3 deliverables.',
      timestamp: new Date('2025-10-23T10:00:00'),
      milestoneId: 'milestone-3'
    },
    {
      id: '2',
      userId: '2',
      userName: 'Dr. Murali BK',
      message: 'The Algorithm integration needs to be prioritized. Can we move it to an earlier phase?',
      timestamp: new Date('2025-10-23T14:30:00'),
      milestoneId: 'milestone-6'
    }
  ]);

  const [updates, setUpdates] = useState<ProjectUpdate[]>([
    {
      id: '1',
      projectId: projectData.id,
      userId: '1',
      userName: 'Backend Team',
      type: 'milestone',
      title: 'Database Setup Completed',
      description: 'Successfully configured Supabase database with all required tables and relationships.',
      timestamp: new Date('2025-10-22T16:00:00')
    },
    {
      id: '2',
      projectId: projectData.id,
      userId: '2',
      userName: 'Frontend Team',
      type: 'task',
      title: 'Authentication System Progress',
      description: 'Multi-role authentication is 80% complete. Testing login flows for all user types.',
      timestamp: new Date('2025-10-23T11:00:00')
    },
    {
      id: '3',
      projectId: projectData.id,
      userId: '3',
      userName: 'Project Manager',
      type: 'kpi',
      title: 'Phase 1 KPIs Update',
      description: 'Database tables: 12/15 completed. API endpoints: 15/20 ready. On track for deadline.',
      timestamp: new Date('2025-10-24T09:00:00')
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());

  const handleMilestoneClick = (milestone: ProjectMilestone) => {
    toast.success(`Viewing details for: ${milestone.name}`);
    console.log('Milestone clicked:', milestone);
  };

  const handleKPIClick = (kpi: MilestoneKPI) => {
    toast.info(`KPI: ${kpi.name} - ${kpi.current}/${kpi.target} ${kpi.unit}`);
    console.log('KPI clicked:', kpi);
  };

  const handleDeliverableToggle = async (milestoneId: string, deliverableId: string) => {
    console.log('Deliverable toggle requested:', milestoneId, deliverableId);

    // Get milestone data before updating
    const milestone = projectData.milestones.find(m => m.id === milestoneId);

    // Update local state
    const updatedMilestones = projectData.milestones.map(milestone => {
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

    setProjectData({
      ...projectData,
      milestones: updatedMilestones
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
        deliverables: milestone.deliverables || [], // Save WITH completed field
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
  };

  const handleSendComment = (comment: Omit<ProjectComment, 'id' | 'timestamp'>) => {
    const newComment: ProjectComment = {
      ...comment,
      id: `comment-${Date.now()}`,
      timestamp: new Date()
    };
    setComments(prev => [...prev, newComment]);
    toast.success('Comment added successfully');

    // Create an update for the new comment
    const update: ProjectUpdate = {
      id: `update-${Date.now()}`,
      projectId: projectData.id,
      userId: comment.userId,
      userName: comment.userName,
      type: 'general',
      title: 'New Comment Added',
      description: comment.message.substring(0, 100) + (comment.message.length > 100 ? '...' : ''),
      timestamp: new Date()
    };
    setUpdates(prev => [...prev, update]);
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    toast.success('Comment deleted');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setLastSync(new Date());
      setIsLoading(false);
      toast.success('Data refreshed successfully');
    }, 1500);
  };

  const handleExport = () => {
    const exportData = {
      project: projectData,
      comments,
      updates,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurosense-project-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Project data exported');
  };

  const viewConfig = {
    gantt: {
      icon: BarChart3,
      title: 'Timeline View',
      description: 'Visualize project milestones and tasks'
    },
    kpi: {
      icon: Target,
      title: 'KPI Dashboard',
      description: 'Track performance metrics and progress'
    },
    collaboration: {
      icon: MessageSquare,
      title: 'Collaboration',
      description: 'Communicate with team and clients'
    },
    team: {
      icon: Users,
      title: 'Team Management',
      description: 'Manage client and development teams'
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6 mb-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{projectData.name}</h1>
                <p className="text-gray-600 mt-2">{projectData.description}</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    Client: {projectData.client}
                  </span>
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Status: {projectData.status}
                  </span>
                  <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                    Progress: {projectData.overallProgress}%
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleExport}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* View Selector */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              {(Object.keys(viewConfig) as Array<keyof typeof viewConfig>).map(view => {
                const config = viewConfig[view];
                const Icon = config.icon;
                const isActive = activeView === view;

                return (
                  <motion.button
                    key={view}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveView(view)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                      <div className="text-left">
                        <div className={`font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                          {config.title}
                        </div>
                        <div className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                          {config.description}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeView === 'gantt' && (
              <GanttChart
                data={{
                  milestones: projectData.milestones,
                  tasks: projectData.tasks,
                  startDate: projectData.startDate,
                  endDate: projectData.endDate,
                  viewMode: 'month'
                }}
                onMilestoneClick={handleMilestoneClick}
                onDeliverableToggle={handleDeliverableToggle}
                showTasks={true}
                interactive={true}
              />
            )}

            {activeView === 'kpi' && (
              <KPIDashboard
                projectData={projectData}
                onKPIClick={handleKPIClick}
              />
            )}

            {activeView === 'collaboration' && (
              <ClientCollaboration
                projectId={projectData.id}
                comments={comments}
                updates={updates}
                onSendComment={handleSendComment}
                onDeleteComment={handleDeleteComment}
                currentUserId="current-user"
                currentUserName="Current User"
                currentUserRole="team"
              />
            )}

            {activeView === 'team' && (
              <TeamManagement
                projectName={projectData.id}
              />
            )}
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-sm text-gray-500"
          >
            Last synced: {lastSync.toLocaleString()} •
            {projectData.team.length} team members •
            {projectData.milestones.length} milestones •
            {projectData.tasks.length} tasks
          </motion.div>
        </div>
      </div>
    </DndProvider>
  );
};

export default ProjectTrackingDashboard;