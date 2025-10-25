import React from 'react';
import { motion } from 'framer-motion';
import {
  GitCommit, GitPullRequest, GitMerge, CheckCircle2,
  AlertTriangle, TrendingUp, Activity, Cpu
} from 'lucide-react';

interface AutoProgressTrackerProps {
  projectData: any;
  lastSync: Date;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  onManualSync: () => void;
}

const AutoProgressTracker: React.FC<AutoProgressTrackerProps> = ({
  projectData,
  lastSync,
  syncStatus,
  onManualSync
}) => {
  // Calculate automated metrics
  const getAutomationMetrics = () => {
    const activeMilestones = projectData.milestones.filter((m: any) => m.status === 'in-progress').length;
    const completedMilestones = projectData.milestones.filter((m: any) => m.status === 'completed').length;
    const totalTasks = projectData.tasks?.length || 0;
    const completedTasks = projectData.tasks?.filter((t: any) => t.status === 'completed').length || 0;

    return {
      progressVelocity: Math.round((completedMilestones / projectData.milestones.length) * 100),
      automationRate: 85, // Simulated automation rate
      tasksCompleted: completedTasks,
      tasksTotal: totalTasks,
      activeMilestones,
      syncHealth: syncStatus === 'success' ? 100 : syncStatus === 'error' ? 0 : 50
    };
  };

  const metrics = getAutomationMetrics();

  const automationEvents = [
    {
      id: 1,
      type: 'commit',
      message: 'feat: Implemented authentication system',
      timestamp: '2 minutes ago',
      impact: '+5% progress',
      icon: GitCommit,
      color: 'text-blue-500'
    },
    {
      id: 2,
      type: 'pr_merged',
      message: 'Merged PR #42: Add patient portal',
      timestamp: '15 minutes ago',
      impact: '+10% milestone',
      icon: GitMerge,
      color: 'text-green-500'
    },
    {
      id: 3,
      type: 'deployment',
      message: 'Successfully deployed to staging',
      timestamp: '1 hour ago',
      impact: 'Phase completed',
      icon: CheckCircle2,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Cpu className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Automated Progress Tracking</h3>
            <p className="text-sm text-gray-500">AI-powered project intelligence</p>
          </div>
        </div>

        <button
          onClick={onManualSync}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          Force Sync
        </button>
      </div>

      {/* Automation Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-700">{metrics.progressVelocity}%</span>
          </div>
          <p className="text-xs text-blue-600">Progress Velocity</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <Cpu className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-700">{metrics.automationRate}%</span>
          </div>
          <p className="text-xs text-green-600">Automation Rate</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
            <span className="text-2xl font-bold text-purple-700">
              {metrics.tasksCompleted}/{metrics.tasksTotal}
            </span>
          </div>
          <p className="text-xs text-purple-600">Tasks Tracked</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-orange-600" />
            <span className="text-2xl font-bold text-orange-700">{metrics.syncHealth}%</span>
          </div>
          <p className="text-xs text-orange-600">Sync Health</p>
        </motion.div>
      </div>

      {/* Automation Events */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Automation Events</h4>
        <div className="space-y-3">
          {automationEvents.map((event, idx) => {
            const Icon = event.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`p-2 bg-white rounded-lg ${event.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{event.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{event.timestamp}</span>
                    <span className="text-xs font-medium text-green-600">
                      {event.impact}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Automation Rules Status */}
      <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-indigo-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-indigo-900">
                  Active Automation Rules: 12
            </p>
            <p className="text-xs text-indigo-700 mt-1">
              Monitoring: Git commits • Pull requests • Deployments • Issue tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoProgressTracker;