import { ProjectMilestone, MilestoneKPI, ProjectTask, Deliverable } from '../types';

// 12-Week Project Timeline: November 1, 2025 - January 24, 2026
export const sampleProjectMilestones: ProjectMilestone[] = [
  {
    id: 'milestone-1',
    name: 'Phase 1: Foundation & Infrastructure',
    description: 'Setup core infrastructure, database schema, and authentication system',
    status: 'pending',
    startDate: new Date('2025-11-01'),
    endDate: new Date('2025-11-10'),
    progress: 0,
    deliverables: [
      { id: 'del-1-1', text: 'Signed LOC', completed: false },
      { id: 'del-1-2', text: 'Receipt of advance payment', completed: false },
      { id: 'del-1-3', text: 'Supabase database setup', completed: false },
      { id: 'del-1-4', text: 'Authentication system (Super Admin, Clinic Admin, Patient)', completed: false },
      { id: 'del-1-5', text: 'Core API structure', completed: false },
      { id: 'del-1-6', text: 'Basic routing and navigation', completed: false }
    ],
    assignedTo: ['Backend Team', 'DevOps'],
    dependencies: [],
    order: 1,
    color: '#4F46E5',
    kpis: [
      {
        id: 'kpi-1-1',
        name: 'Database Tables Created',
        target: 15,
        current: 0,
        unit: 'tables',
        status: 'on-track',
        trend: 'stable'
      },
      {
        id: 'kpi-1-2',
        name: 'API Endpoints',
        target: 20,
        current: 0,
        unit: 'endpoints',
        status: 'on-track',
        trend: 'stable'
      },
      {
        id: 'kpi-1-3',
        name: 'Auth Flows Completed',
        target: 3,
        current: 0,
        unit: 'flows',
        status: 'on-track',
        trend: 'stable'
      }
    ]
  },
  {
    id: 'milestone-2',
    name: 'Phase 2: Landing Page & Marketing',
    description: 'Develop public-facing landing page with clinic locator and information',
    status: 'pending',
    startDate: new Date('2025-11-11'),
    endDate: new Date('2025-11-17'),
    progress: 0,
    deliverables: [
      { id: 'del-2-1', text: 'Landing page similar to biomesight', completed: false },
      { id: 'del-2-2', text: 'Clinic locator with auto-detection', completed: false },
      { id: 'del-2-3', text: 'Enquiry form integration', completed: false },
      { id: 'del-2-4', text: 'YouTube video integration', completed: false },
      { id: 'del-2-5', text: 'Brain health articles section', completed: false }
    ],
    assignedTo: ['Frontend Team', 'UI/UX Designer'],
    dependencies: ['milestone-1'],
    order: 2,
    color: '#10B981',
    kpis: [
      {
        id: 'kpi-2-1',
        name: 'Page Components',
        target: 8,
        current: 0,
        unit: 'components',
        status: 'on-track',
        trend: 'stable'
      },
      {
        id: 'kpi-2-2',
        name: 'Lighthouse Score',
        target: 90,
        current: 0,
        unit: 'score',
        status: 'on-track',
        trend: 'stable'
      }
    ]
  },
  {
    id: 'milestone-3',
    name: 'Phase 3: Super Admin Dashboard',
    description: 'Complete super admin functionality for multi-clinic management',
    status: 'pending',
    startDate: new Date('2025-11-18'),
    endDate: new Date('2025-12-01'),
    progress: 0,
    deliverables: [
      { id: 'del-3-1', text: 'Multi-clinic onboarding', completed: false },
      { id: 'del-3-2', text: 'User role management', completed: false },
      { id: 'del-3-3', text: 'Report unit SKU catalog', completed: false },
      { id: 'del-3-4', text: 'Revenue analytics dashboard', completed: false },
      { id: 'del-3-5', text: 'Global settings management', completed: false },
      { id: 'del-3-6', text: 'Stripe payment integration', completed: false },
      { id: 'del-3-7', text: 'EDF file handling', completed: false },
      { id: 'del-3-8', text: 'Algorithm 1 & 2 integration', completed: false }
    ],
    assignedTo: ['Full Stack Team', 'Data Science Team'],
    dependencies: ['milestone-1'],
    order: 3,
    color: '#F59E0B',
    kpis: [
      {
        id: 'kpi-3-1',
        name: 'Dashboard Views',
        target: 12,
        current: 0,
        unit: 'views',
        status: 'on-track',
        trend: 'stable'
      },
      {
        id: 'kpi-3-2',
        name: 'Payment Integration',
        target: 100,
        current: 0,
        unit: '%',
        status: 'on-track',
        trend: 'stable'
      },
      {
        id: 'kpi-3-3',
        name: 'Algorithm Integration',
        target: 2,
        current: 0,
        unit: 'algorithms',
        status: 'on-track',
        trend: 'stable'
      }
    ]
  },
  {
    id: 'milestone-4',
    name: 'Phase 4: Clinic Admin Dashboard',
    description: 'Develop clinic-specific administration portal',
    status: 'pending',
    startDate: new Date('2025-12-02'),
    endDate: new Date('2025-12-10'),
    progress: 0,
    deliverables: [
      { id: 'del-4-1', text: 'Patient management interface', completed: false },
      { id: 'del-4-2', text: 'EDF file upload system', completed: false },
      { id: 'del-4-3', text: 'Report access and download', completed: false },
      { id: 'del-4-4', text: 'Usage analytics dashboard', completed: false },
      { id: 'del-4-5', text: 'Subscription management', completed: false },
      { id: 'del-4-6', text: 'Patient follow-up tracking', completed: false }
    ],
    assignedTo: ['Frontend Team', 'Backend Team'],
    dependencies: ['milestone-3'],
    order: 4,
    color: '#8B5CF6',
    kpis: [
      {
        id: 'kpi-4-1',
        name: 'Features Completed',
        target: 8,
        current: 0,
        unit: 'features',
        status: 'on-track',
        trend: 'stable'
      },
      {
        id: 'kpi-4-2',
        name: 'File Upload System',
        target: 100,
        current: 0,
        unit: '%',
        status: 'on-track',
        trend: 'stable'
      }
    ]
  },
  {
    id: 'milestone-5',
    name: 'Phase 5: Patient Portal',
    description: 'Create patient-facing portal with reports and care plans',
    status: 'pending',
    startDate: new Date('2025-12-11'),
    endDate: new Date('2025-12-18'),
    progress: 0,
    deliverables: [
      { id: 'del-5-1', text: 'Patient login system', completed: false },
      { id: 'del-5-2', text: 'Personal profile management', completed: false },
      { id: 'del-5-3', text: 'Test history view', completed: false },
      { id: 'del-5-4', text: 'NeuroSense report access', completed: false },
      { id: 'del-5-5', text: 'Personalized care plan access', completed: false },
      { id: 'del-5-6', text: 'Educational resources', completed: false },
      { id: 'del-5-7', text: 'Progress tracking graphs', completed: false }
    ],
    assignedTo: ['Frontend Team', 'UX Team'],
    dependencies: ['milestone-4'],
    order: 5,
    color: '#EC4899',
    kpis: [
      {
        id: 'kpi-5-1',
        name: 'Portal Features',
        target: 7,
        current: 0,
        unit: 'features',
        status: 'on-track',
        trend: 'stable'
      },
      {
        id: 'kpi-5-2',
        name: 'User Experience Score',
        target: 85,
        current: 0,
        unit: '%',
        status: 'on-track',
        trend: 'stable'
      }
    ]
  },
  {
    id: 'milestone-6',
    name: 'Phase 6: Algorithm Integration',
    description: 'Implement NeuroSense algorithms for report generation',
    status: 'pending',
    startDate: new Date('2025-12-19'),
    endDate: new Date('2025-12-28'),
    progress: 0,
    deliverables: [
      { id: 'del-6-1', text: 'Algorithm 1: NeuroSense report generation', completed: false },
      { id: 'del-6-2', text: 'Algorithm 2: Personalized care plan', completed: false },
      { id: 'del-6-3', text: 'Score calculations (Cognition, Stress, Focus, etc.)', completed: false },
      { id: 'del-6-4', text: 'Dynamic meter visualizations', completed: false },
      { id: 'del-6-5', text: 'Report template system', completed: false },
      { id: 'del-6-6', text: 'Care plan template system', completed: false }
    ],
    assignedTo: ['Data Science Team', 'Backend Team'],
    dependencies: ['milestone-5'],
    order: 6,
    color: '#06B6D4',
    kpis: [
      {
        id: 'kpi-6-1',
        name: 'Algorithms Implemented',
        target: 2,
        current: 0,
        unit: 'algorithms',
        status: 'on-track',
        trend: 'stable'
      },
      {
        id: 'kpi-6-2',
        name: 'Score Metrics',
        target: 7,
        current: 0,
        unit: 'metrics',
        status: 'on-track',
        trend: 'stable'
      }
    ]
  },
  {
    id: 'milestone-7',
    name: 'Phase 7: Notifications & Alerts',
    description: 'Implement comprehensive notification system',
    status: 'pending',
    startDate: new Date('2025-12-29'),
    endDate: new Date('2026-01-04'),
    progress: 0,
    deliverables: [
      { id: 'del-7-1', text: 'Email notification system', completed: false },
      { id: 'del-7-2', text: 'In-app notifications', completed: false },
      { id: 'del-7-3', text: 'SMS alerts integration', completed: false },
      { id: 'del-7-4', text: 'Usage threshold alerts', completed: false },
      { id: 'del-7-5', text: 'Report ready notifications', completed: false },
      { id: 'del-7-6', text: 'Payment reminders', completed: false }
    ],
    assignedTo: ['Backend Team'],
    dependencies: ['milestone-6'],
    order: 7,
    color: '#14B8A6',
    kpis: [
      {
        id: 'kpi-7-1',
        name: 'Notification Types',
        target: 6,
        current: 0,
        unit: 'types',
        status: 'on-track',
        trend: 'stable'
      }
    ]
  },
  {
    id: 'milestone-8',
    name: 'Phase 8: Testing & Quality Assurance',
    description: 'Comprehensive testing of all features and workflows',
    status: 'pending',
    startDate: new Date('2026-01-05'),
    endDate: new Date('2026-01-14'),
    progress: 0,
    deliverables: [
      { id: 'del-8-1', text: 'Unit testing coverage', completed: false },
      { id: 'del-8-2', text: 'Integration testing', completed: false },
      { id: 'del-8-3', text: 'End-to-end testing', completed: false },
      { id: 'del-8-4', text: 'Performance testing', completed: false },
      { id: 'del-8-5', text: 'Security audit', completed: false },
      { id: 'del-8-6', text: 'User acceptance testing', completed: false }
    ],
    assignedTo: ['QA Team', 'All Teams'],
    dependencies: ['milestone-7'],
    order: 8,
    color: '#F97316',
    kpis: [
      {
        id: 'kpi-8-1',
        name: 'Test Coverage',
        target: 80,
        current: 0,
        unit: '%',
        status: 'on-track',
        trend: 'stable'
      },
      {
        id: 'kpi-8-2',
        name: 'Critical Bugs',
        target: 0,
        current: 0,
        unit: 'bugs',
        status: 'on-track',
        trend: 'stable'
      }
    ]
  },
  {
    id: 'milestone-9',
    name: 'Phase 9: Deployment & Documentation',
    description: 'Production deployment and documentation completion',
    status: 'pending',
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-01-20'),
    progress: 0,
    deliverables: [
      { id: 'del-9-1', text: 'Production deployment', completed: false },
      { id: 'del-9-2', text: 'SSL certificate setup', completed: false },
      { id: 'del-9-3', text: 'CDN configuration', completed: false },
      { id: 'del-9-4', text: 'Backup strategy', completed: false },
      { id: 'del-9-5', text: 'User documentation', completed: false },
      { id: 'del-9-6', text: 'API documentation', completed: false },
      { id: 'del-9-7', text: 'Admin guides', completed: false }
    ],
    assignedTo: ['DevOps', 'Technical Writers'],
    dependencies: ['milestone-8'],
    order: 9,
    color: '#DC2626',
    kpis: [
      {
        id: 'kpi-9-1',
        name: 'Deployment Tasks',
        target: 7,
        current: 0,
        unit: 'tasks',
        status: 'on-track',
        trend: 'stable'
      },
      {
        id: 'kpi-9-2',
        name: 'Documentation Pages',
        target: 15,
        current: 0,
        unit: 'pages',
        status: 'on-track',
        trend: 'stable'
      }
    ]
  },
  {
    id: 'milestone-10',
    name: 'Phase 10: Launch & Handover',
    description: 'Final launch preparations and client handover',
    status: 'pending',
    startDate: new Date('2026-01-21'),
    endDate: new Date('2026-01-24'),
    progress: 0,
    deliverables: [
      { id: 'del-10-1', text: 'Production go-live', completed: false },
      { id: 'del-10-2', text: 'Client training sessions', completed: false },
      { id: 'del-10-3', text: 'Support handover', completed: false },
      { id: 'del-10-4', text: 'Maintenance documentation', completed: false },
      { id: 'del-10-5', text: 'Performance monitoring setup', completed: false },
      { id: 'del-10-6', text: 'Final deliverables package', completed: false }
    ],
    assignedTo: ['Project Manager', 'All Teams'],
    dependencies: ['milestone-9'],
    order: 10,
    color: '#059669',
    kpis: [
      {
        id: 'kpi-10-1',
        name: 'Launch Readiness',
        target: 100,
        current: 0,
        unit: '%',
        status: 'on-track',
        trend: 'stable'
      },
      {
        id: 'kpi-10-2',
        name: 'Training Sessions',
        target: 3,
        current: 0,
        unit: 'sessions',
        status: 'on-track',
        trend: 'stable'
      }
    ]
  }
];

export const neurosenseTasks: ProjectTask[] = [
  // Phase 1 Tasks
  {
    id: 'task-1-1',
    milestoneId: 'milestone-1',
    name: 'Setup Supabase Database',
    description: 'Configure Supabase tables and relationships',
    status: 'pending',
    priority: 'high',
    startDate: new Date('2025-11-01'),
    endDate: new Date('2025-11-04'),
    progress: 0,
    assignedTo: ['Backend Team'],
    estimatedHours: 8
  },
  {
    id: 'task-1-2',
    milestoneId: 'milestone-1',
    name: 'Implement Authentication System',
    description: 'Setup multi-role authentication with Supabase Auth',
    status: 'pending',
    priority: 'critical',
    startDate: new Date('2025-11-05'),
    endDate: new Date('2025-11-07'),
    progress: 0,
    assignedTo: ['Backend Team'],
    estimatedHours: 16
  },
  {
    id: 'task-1-3',
    milestoneId: 'milestone-1',
    name: 'Create Core API Structure',
    description: 'Design and implement RESTful API endpoints',
    status: 'pending',
    priority: 'high',
    startDate: new Date('2025-11-08'),
    endDate: new Date('2025-11-10'),
    progress: 0,
    assignedTo: ['Backend Team'],
    estimatedHours: 12
  },
  // Phase 2 Tasks
  {
    id: 'task-2-1',
    milestoneId: 'milestone-2',
    name: 'Design Landing Page',
    description: 'Create UI/UX design for landing page',
    status: 'pending',
    priority: 'high',
    startDate: new Date('2025-11-11'),
    endDate: new Date('2025-11-13'),
    progress: 0,
    assignedTo: ['UI/UX Designer'],
    estimatedHours: 16
  },
  {
    id: 'task-2-2',
    milestoneId: 'milestone-2',
    name: 'Implement Clinic Locator',
    description: 'Build clinic locator with auto-detection',
    status: 'pending',
    priority: 'medium',
    startDate: new Date('2025-11-14'),
    endDate: new Date('2025-11-17'),
    progress: 0,
    assignedTo: ['Frontend Team'],
    estimatedHours: 12
  }
];

export const projectOverview = {
  id: 'neurosense-mvp',
  name: 'NeuroSense360 MVP Development',
  description: 'Web application for EEG-based brain health insights and clinic management',
  client: 'Limitless Brain Wellness (LBW)',
  startDate: new Date('2025-11-01'),
  endDate: new Date('2026-01-24'),
  status: 'active' as const,
  milestones: sampleProjectMilestones,
  tasks: neurosenseTasks,
  team: [
    { id: '1', name: 'Project Manager', email: 'pm@bettroi.com', role: 'Project Management', allocation: 100 },
    { id: '2', name: 'Backend Team', email: 'backend@bettroi.com', role: 'Backend Development', allocation: 100 },
    { id: '3', name: 'Frontend Team', email: 'frontend@bettroi.com', role: 'Frontend Development', allocation: 100 },
    { id: '4', name: 'UI/UX Designer', email: 'design@bettroi.com', role: 'Design', allocation: 50 },
    { id: '5', name: 'Data Science Team', email: 'ds@bettroi.com', role: 'Algorithm Development', allocation: 75 },
    { id: '6', name: 'QA Team', email: 'qa@bettroi.com', role: 'Quality Assurance', allocation: 50 },
    { id: '7', name: 'DevOps', email: 'devops@bettroi.com', role: 'Infrastructure', allocation: 50 }
  ],
  overallProgress: 0,
  budget: {
    total: 150000,
    spent: 0,
    currency: 'AED'
  },
  risks: [
    {
      id: 'risk-1',
      title: 'Third-party AI Integration',
      description: 'Integration with third-party AI application for qEEG Pro Reports',
      impact: 'high',
      likelihood: 'medium',
      mitigation: 'Early API testing and fallback mechanisms',
      status: 'identified',
      owner: 'Backend Team'
    },
    {
      id: 'risk-2',
      title: 'Algorithm Complexity',
      description: 'NeuroSense algorithms implementation complexity',
      impact: 'high',
      likelihood: 'low',
      mitigation: 'Close collaboration with NeuroSense data science team',
      status: 'identified',
      owner: 'Data Science Team'
    }
  ]
};