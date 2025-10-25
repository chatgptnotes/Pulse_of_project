import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Calendar, Target, Clock,
  AlertTriangle, CheckCircle2, Activity
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface DashboardMetricsProps {
  projectData: any;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ projectData }) => {
  // Calculate project metrics
  const calculateMetrics = () => {
    const totalMilestones = projectData.milestones.length;
    const completedMilestones = projectData.milestones.filter((m: any) => m.status === 'completed').length;
    const inProgressMilestones = projectData.milestones.filter((m: any) => m.status === 'in-progress').length;
    const delayedMilestones = projectData.milestones.filter((m: any) => m.status === 'delayed').length;

    const startDate = new Date(projectData.startDate);
    const endDate = new Date(projectData.endDate);
    const today = new Date();
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const timeProgress = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

    const burnRate = projectData.budget ?
      Math.round((projectData.budget.spent / projectData.budget.total) * 100) : 0;

    return {
      overallProgress: projectData.overallProgress || 0,
      timeProgress,
      completedMilestones,
      totalMilestones,
      inProgressMilestones,
      delayedMilestones,
      burnRate,
      teamSize: projectData.team?.length || 0,
      daysRemaining: Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    };
  };

  const metrics = calculateMetrics();

  // Sample progress data for charts
  const progressData = [
    { week: 'W1', planned: 10, actual: 8 },
    { week: 'W2', planned: 20, actual: 18 },
    { week: 'W3', planned: 30, actual: 32 },
    { week: 'W4', planned: 40, actual: 38 },
    { week: 'W5', planned: 50, actual: 45 },
    { week: 'W6', planned: 60, actual: 52 },
    { week: 'W7', planned: 70, actual: 58 },
    { week: 'W8', planned: 80, actual: 65 }
  ];

  const velocityData = [
    { day: 'Mon', tasks: 5 },
    { day: 'Tue', tasks: 8 },
    { day: 'Wed', tasks: 6 },
    { day: 'Thu', tasks: 10 },
    { day: 'Fri', tasks: 7 },
  ];

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Key Metrics Cards */}
      <div className="col-span-12 grid grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{metrics.overallProgress}%</span>
          </div>
          <p className="text-sm font-medium text-gray-700">Overall Progress</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.overallProgress}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {metrics.completedMilestones}/{metrics.totalMilestones}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-700">Milestones</p>
          <div className="mt-2 flex gap-1">
            {metrics.inProgressMilestones > 0 && (
              <span className="text-xs text-blue-600">{metrics.inProgressMilestones} in progress</span>
            )}
            {metrics.delayedMilestones > 0 && (
              <span className="text-xs text-red-600">{metrics.delayedMilestones} delayed</span>
            )}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{metrics.daysRemaining}</span>
          </div>
          <p className="text-sm font-medium text-gray-700">Days Remaining</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${100 - metrics.timeProgress}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{metrics.teamSize}</span>
          </div>
          <p className="text-sm font-medium text-gray-700">Team Members</p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Fully allocated resources</span>
          </div>
        </motion.div>
      </div>

      {/* Progress Chart */}
      <div className="col-span-8 bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Progress Tracking</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="planned"
              stroke="#94a3b8"
              fill="#e2e8f0"
              name="Planned"
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#4f46e5"
              fill="#818cf8"
              name="Actual"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Velocity Chart */}
      <div className="col-span-4 bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Task Velocity</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={velocityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="tasks" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Health Indicators */}
      <div className="col-span-12 bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Project Health</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">On Track</p>
              <p className="text-xs text-green-700">Meeting deadlines</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Active Development</p>
              <p className="text-xs text-blue-700">High commit frequency</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-900">2 Risks Identified</p>
              <p className="text-xs text-yellow-700">Mitigation in progress</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <Target className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-900">{metrics.burnRate}% Budget Used</p>
              <p className="text-xs text-purple-700">Within allocated budget</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;