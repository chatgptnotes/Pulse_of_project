import React from 'react';
import {
  TrendingUp, TrendingDown, Minus, Target, AlertTriangle,
  CheckCircle, Clock, Calendar, Users, DollarSign, Activity
} from 'lucide-react';
import { ProjectData, MilestoneKPI } from '../types';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, Area, AreaChart
} from 'recharts';
import { format, differenceInDays } from 'date-fns';

interface KPIDashboardProps {
  projectData: ProjectData;
  onKPIClick?: (kpi: MilestoneKPI) => void;
}

const KPIDashboard: React.FC<KPIDashboardProps> = ({ projectData, onKPIClick }) => {
  const calculateOverallKPIs = () => {
    let totalKPIs = 0;
    let onTrack = 0;
    let atRisk = 0;
    let offTrack = 0;

    projectData.milestones.forEach(milestone => {
      milestone.kpis?.forEach(kpi => {
        totalKPIs++;
        switch (kpi.status) {
          case 'on-track': onTrack++; break;
          case 'at-risk': atRisk++; break;
          case 'off-track': offTrack++; break;
        }
      });
    });

    return { totalKPIs, onTrack, atRisk, offTrack };
  };

  const getUpcomingDeadlines = () => {
    const now = new Date();
    return projectData.milestones
      .filter(m => m.status !== 'completed' && m.endDate > now)
      .map(m => ({
        milestone: m.name,
        date: m.endDate,
        daysRemaining: differenceInDays(m.endDate, now),
        status: m.status
      }))
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 5);
  };

  const getMilestoneProgress = () => {
    return projectData.milestones.map(m => ({
      name: m.name.replace('Phase ', 'P'),
      planned: 100,
      actual: m.progress,
      status: m.status
    }));
  };

  const getBudgetUtilization = () => {
    if (!projectData.budget) return null;
    const utilization = (projectData.budget.spent / projectData.budget.total) * 100;
    return {
      total: projectData.budget.total,
      spent: projectData.budget.spent,
      remaining: projectData.budget.total - projectData.budget.spent,
      utilization: utilization.toFixed(1)
    };
  };

  const kpiOverview = calculateOverallKPIs();
  const upcomingDeadlines = getUpcomingDeadlines();
  const milestoneProgress = getMilestoneProgress();
  const budget = getBudgetUtilization();

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-500';
      case 'at-risk': return 'text-yellow-500';
      case 'off-track': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const pieData = [
    { name: 'On Track', value: kpiOverview.onTrack, color: '#10B981' },
    { name: 'At Risk', value: kpiOverview.atRisk, color: '#F59E0B' },
    { name: 'Off Track', value: kpiOverview.offTrack, color: '#EF4444' }
  ];

  const radialData = projectData.milestones.map(m => ({
    name: m.name.split(':')[0],
    progress: m.progress,
    fill: m.color || '#8884d8'
  }));

  return (
    <div className="space-y-6">
      {/* Header KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold">{projectData.overallProgress}%</span>
          </div>
          <h3 className="text-gray-600 text-sm">Overall Progress</h3>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${projectData.overallProgress}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold">{kpiOverview.onTrack}</span>
          </div>
          <h3 className="text-gray-600 text-sm">KPIs On Track</h3>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-xs text-green-600">
              {((kpiOverview.onTrack / kpiOverview.totalKPIs) * 100).toFixed(0)}% healthy
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold">{kpiOverview.atRisk}</span>
          </div>
          <h3 className="text-gray-600 text-sm">KPIs At Risk</h3>
          <div className="flex items-center mt-2">
            <Minus className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-xs text-yellow-600">Requires attention</span>
          </div>
        </motion.div>

        {budget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold">{budget.utilization}%</span>
            </div>
            <h3 className="text-gray-600 text-sm">Budget Used</h3>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  parseFloat(budget.utilization) > 80 ? 'bg-red-500' : 'bg-purple-600'
                }`}
                style={{ width: `${budget.utilization}%` }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestone Progress Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Milestone Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={milestoneProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="planned" fill="#E5E7EB" name="Planned" />
              <Bar dataKey="actual" fill="#3B82F6" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* KPI Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold mb-4">KPI Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Detailed KPIs by Milestone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Milestone KPIs Detail</h3>
        <div className="space-y-4">
          {projectData.milestones
            .filter(m => m.kpis && m.kpis.length > 0)
            .map(milestone => (
              <div key={milestone.id} className="border-l-4 pl-4" style={{ borderColor: milestone.color }}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{milestone.name}</h4>
                  <span className={`text-sm font-medium ${
                    milestone.status === 'completed' ? 'text-green-500' :
                    milestone.status === 'in-progress' ? 'text-blue-500' :
                    milestone.status === 'delayed' ? 'text-red-500' :
                    'text-gray-500'
                  }`}>
                    {milestone.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {milestone.kpis.map(kpi => (
                    <motion.div
                      key={kpi.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => onKPIClick?.(kpi)}
                      className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{kpi.name}</span>
                        {getTrendIcon(kpi.trend)}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold">{kpi.current}</span>
                        <span className="text-sm text-gray-500">/ {kpi.target} {kpi.unit}</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            kpi.status === 'on-track' ? 'bg-green-500' :
                            kpi.status === 'at-risk' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs mt-1 ${getStatusColor(kpi.status)}`}>
                        {kpi.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </motion.div>

      {/* Upcoming Deadlines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Upcoming Deadlines
        </h3>
        <div className="space-y-3">
          {upcomingDeadlines.map((deadline, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">{deadline.milestone}</p>
                <p className="text-xs text-gray-600">{format(deadline.date, 'MMM dd, yyyy')}</p>
              </div>
              <div className={`text-right ${
                deadline.daysRemaining <= 3 ? 'text-red-600' :
                deadline.daysRemaining <= 7 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                <p className="text-sm font-semibold">{deadline.daysRemaining}</p>
                <p className="text-xs">days left</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default KPIDashboard;