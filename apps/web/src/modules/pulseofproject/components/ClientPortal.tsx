import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Download, MessageSquare, Calendar, Target,
  TrendingUp, Clock, Users, BarChart3, FileText,
  ChevronRight, Bell, Share2, Lock
} from 'lucide-react';
import GanttChart from '../../project-tracking/components/GanttChart';
import { PRODUCT_CONFIG } from '../config/brand';

interface ClientPortalProps {
  projectData: any;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ projectData }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'timeline' | 'reports'>('overview');
  const [showCommentBox, setShowCommentBox] = useState(false);

  const calculateMetrics = () => {
    const completedMilestones = projectData.milestones.filter((m: any) => m.status === 'completed').length;
    const totalMilestones = projectData.milestones.length;
    const nextMilestone = projectData.milestones.find((m: any) => m.status === 'in-progress') ||
                         projectData.milestones.find((m: any) => m.status === 'pending');

    const startDate = new Date(projectData.startDate);
    const endDate = new Date(projectData.endDate);
    const today = new Date();
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      progress: projectData.overallProgress || 0,
      completedMilestones,
      totalMilestones,
      nextMilestone,
      daysRemaining,
      totalDays,
      budgetUsed: projectData.budget ? Math.round((projectData.budget.spent / projectData.budget.total) * 100) : 0
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Client Portal Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-indigo-600" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {PRODUCT_CONFIG.name} <span className="text-sm text-gray-500">Client Portal</span>
                  </h1>
                  <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-full">
                    A Bettroi Product
                  </span>
                </div>
                <p className="text-sm text-gray-500">{projectData.name} - {projectData.client}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <Bell className="w-4 h-4" />
                Notifications
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 flex gap-8 border-t border-gray-100">
          {(['overview', 'milestones', 'timeline', 'reports'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-indigo-600" />
                  <span className="text-3xl font-bold">{metrics.progress}%</span>
                </div>
                <p className="text-gray-700 font-medium">Overall Progress</p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.progress}%` }}
                  />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 text-green-600" />
                  <span className="text-3xl font-bold">
                    {metrics.completedMilestones}/{metrics.totalMilestones}
                  </span>
                </div>
                <p className="text-gray-700 font-medium">Milestones Complete</p>
                <p className="text-sm text-gray-500 mt-2">
                  Next: {metrics.nextMilestone?.name || 'All Complete'}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-orange-600" />
                  <span className="text-3xl font-bold">{metrics.daysRemaining}</span>
                </div>
                <p className="text-gray-700 font-medium">Days Remaining</p>
                <p className="text-sm text-gray-500 mt-2">
                  Deadline: {new Date(projectData.endDate).toLocaleDateString()}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                  <span className="text-3xl font-bold">{metrics.budgetUsed}%</span>
                </div>
                <p className="text-gray-700 font-medium">Budget Used</p>
                <p className="text-sm text-gray-500 mt-2">
                  {projectData.budget?.currency} {projectData.budget?.spent?.toLocaleString()}
                </p>
              </motion.div>
            </div>

            {/* Current Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Current Status</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Active Milestone</h3>
                  {metrics.nextMilestone && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900">{metrics.nextMilestone.name}</h4>
                      <p className="text-sm text-blue-700 mt-1">{metrics.nextMilestone.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-sm text-blue-600">
                          Progress: {metrics.nextMilestone.progress}%
                        </span>
                        <span className="text-sm text-blue-600">
                          Due: {new Date(metrics.nextMilestone.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Recent Updates</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                      <div>
                        <p className="text-sm text-gray-700">Authentication system completed</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                      <div>
                        <p className="text-sm text-gray-700">Database schema updated</p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setShowCommentBox(!showCommentBox)}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <div className="text-left">
                    <p className="font-medium">Add Feedback</p>
                    <p className="text-xs text-gray-500">Share your thoughts</p>
                  </div>
                </button>

                <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">Schedule Meeting</p>
                    <p className="text-xs text-gray-500">Book a review session</p>
                  </div>
                </button>

                <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <p className="font-medium">View Documents</p>
                    <p className="text-xs text-gray-500">Access project files</p>
                  </div>
                </button>
              </div>

              {showCommentBox && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-gray-50 rounded-lg"
                >
                  <textarea
                    placeholder="Share your feedback or questions..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => setShowCommentBox(false)}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      Send Feedback
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Project Milestones</h2>
            {projectData.milestones.map((milestone: any, idx: number) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{milestone.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        milestone.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : milestone.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : milestone.status === 'delayed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {milestone.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{milestone.description}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-gray-500">
                        Start: {new Date(milestone.startDate).toLocaleDateString()}
                      </span>
                      <span className="text-gray-500">
                        End: {new Date(milestone.endDate).toLocaleDateString()}
                      </span>
                      <span className="font-medium">Progress: {milestone.progress}%</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      milestone.status === 'completed' ? 'bg-green-500' :
                      milestone.status === 'in-progress' ? 'bg-blue-500' :
                      milestone.status === 'delayed' ? 'bg-red-500' :
                      'bg-gray-300'
                    }`}
                    style={{ width: `${milestone.progress}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Project Timeline</h2>
            <GanttChart
              data={{
                ...projectData,
                viewMode: 'month'
              }}
              showTasks={false}
              interactive={false}
            />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Project Reports</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <FileText className="w-8 h-8 text-indigo-600 mb-3" />
                <h3 className="font-semibold mb-2">Weekly Progress Report</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Generated every Monday with detailed progress metrics
                </p>
                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                  View Latest Report →
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <BarChart3 className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-semibold mb-2">Performance Analytics</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Real-time metrics and KPI tracking dashboard
                </p>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  View Analytics →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Powered by PulseOfProject */}
      <footer className="mt-12 py-4 text-center text-sm text-gray-500">
        Powered by <a href="https://pulseofproject.com" className="text-indigo-600 hover:text-indigo-700">PulseOfProject.com</a>
      </footer>
    </div>
  );
};

export default ClientPortal;