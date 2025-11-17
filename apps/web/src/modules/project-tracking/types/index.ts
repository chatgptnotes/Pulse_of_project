export interface Deliverable {
  id: string;
  text: string;
  completed: boolean;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  startDate: Date;
  endDate: Date;
  progress: number;
  deliverables: Deliverable[];
  assignedTo: string[];
  dependencies: string[];
  kpis: MilestoneKPI[];
  order: number;
  color?: string;
}

export interface MilestoneKPI {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  status: 'on-track' | 'at-risk' | 'off-track';
  trend?: 'up' | 'down' | 'stable';
}

export interface ProjectTask {
  id: string;
  milestoneId: string;
  name: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate: Date;
  progress: number;
  assignedTo: string[];
  dependencies?: string[];
  estimatedHours?: number;
  actualHours?: number;
}

export interface ProjectComment {
  id: string;
  milestoneId?: string;
  taskId?: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  attachments?: string[];
  mentions?: string[];
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  type: 'milestone' | 'task' | 'kpi' | 'general';
  title: string;
  description: string;
  timestamp: Date;
  data?: any;
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  client: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
  team: TeamMember[];
  overallProgress: number;
  budget?: {
    total: number;
    spent: number;
    currency: string;
  };
  risks?: ProjectRisk[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  allocation: number;
}

export interface ProjectRisk {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high';
  mitigation: string;
  status: 'identified' | 'monitoring' | 'resolved';
  owner: string;
}

export interface GanttChartData {
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
  startDate: Date;
  endDate: Date;
  viewMode: 'day' | 'week' | 'month' | 'quarter';
}

export interface KPIDashboard {
  overallProgress: number;
  completedMilestones: number;
  totalMilestones: number;
  onTrackKPIs: number;
  atRiskKPIs: number;
  offTrackKPIs: number;
  upcomingDeadlines: {
    milestone: string;
    date: Date;
    daysRemaining: number;
  }[];
  teamPerformance: {
    member: string;
    tasksCompleted: number;
    efficiency: number;
  }[];
}