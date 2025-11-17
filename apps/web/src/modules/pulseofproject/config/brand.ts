// PulseOfProject - Real-time Project Progress Tracking Platform
// Brandable configuration for white-label deployment

export const PRODUCT_CONFIG = {
  name: 'PulseOfProject',
  tagline: 'Feel the Heartbeat of Your Projects',
  description: 'Real-time project intelligence that keeps your finger on the pulse of progress',
  version: '1.0.0',
  domain: 'pulseofproject.com',

  features: [
    'Automatic Progress Tracking',
    'Git Integration for Real-time Updates',
    'AI-Powered Progress Analysis',
    'Multi-Project Dashboard',
    'Client Portal Access',
    'Customizable Milestones & KPIs',
    'Webhook & API Integrations',
    'Real-time Collaboration',
    'Automated Reporting',
    'White-Label Customization'
  ],

  // Customizable branding
  branding: {
    primaryColor: '#4F46E5',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    logo: '/pulseofproject-logo.svg',
    favicon: '/favicon.ico',
    companyName: 'BettRoi Solutions',
    supportEmail: 'support@pulseofproject.com',
    websiteUrl: 'https://pulseofproject.com'
  },

  // Integration settings
  integrations: {
    github: {
      enabled: true,
      autoSync: true,
      syncInterval: 300000, // 5 minutes
      trackCommits: true,
      trackPullRequests: true,
      trackIssues: true,
      trackDeployments: true
    },
    gitlab: {
      enabled: true,
      autoSync: true
    },
    jira: {
      enabled: true,
      autoSync: true,
      syncInterval: 600000 // 10 minutes
    },
    slack: {
      enabled: true,
      notifications: true
    },
    webhooks: {
      enabled: true,
      endpoints: []
    }
  },

  // Auto-update rules
  autoUpdate: {
    enabled: true,
    rules: [
      {
        trigger: 'git_commit',
        action: 'update_task_progress',
        mapping: {
          'feat:': { progress: 25, status: 'in-progress' },
          'fix:': { progress: 50, status: 'in-progress' },
          'test:': { progress: 75, status: 'in-progress' },
          'docs:': { progress: 90, status: 'in-progress' },
          'release:': { progress: 100, status: 'completed' }
        }
      },
      {
        trigger: 'pr_merged',
        action: 'update_milestone_progress',
        increment: 10
      },
      {
        trigger: 'issue_closed',
        action: 'update_task_status',
        status: 'completed'
      },
      {
        trigger: 'deployment_success',
        action: 'update_phase_status',
        status: 'completed'
      }
    ]
  },

  // Client access levels
  accessLevels: {
    admin: ['all'],
    projectManager: ['view', 'edit', 'export', 'comment'],
    developer: ['view', 'update_tasks', 'comment'],
    client: ['view', 'comment', 'export'],
    stakeholder: ['view', 'export']
  },

  // Pricing tiers
  pricing: {
    starter: {
      name: 'Starter',
      price: 49,
      currency: 'USD',
      period: 'month',
      features: ['1 Project', '5 Users', 'Basic Integrations', 'Weekly Reports'],
      limits: { projects: 1, users: 5, integrations: 2 }
    },
    professional: {
      name: 'Professional',
      price: 149,
      currency: 'USD',
      period: 'month',
      features: ['5 Projects', '25 Users', 'All Integrations', 'Daily Reports', 'API Access'],
      limits: { projects: 5, users: 25, integrations: -1 }
    },
    enterprise: {
      name: 'Enterprise',
      price: 499,
      currency: 'USD',
      period: 'month',
      features: ['Unlimited Projects', 'Unlimited Users', 'White-Label', 'Custom Integrations', 'Dedicated Support'],
      limits: { projects: -1, users: -1, integrations: -1 }
    }
  }
};

// Client-specific configuration (can be overridden per deployment)
export const CLIENT_CONFIG = {
  clientId: 'lbw-neurosense',
  clientName: 'Limitless Brain Wellness',
  projectName: 'NeuroSense360',
  customBranding: {
    primaryColor: '#4F46E5',
    logo: '/client-logo.svg'
  },
  enabledFeatures: [
    'gantt_chart',
    'kpi_dashboard',
    'milestone_tracking',
    'task_management',
    'team_collaboration',
    'client_portal',
    'automated_reports'
  ],
  automationRules: [
    {
      name: 'Auto-update from Git',
      enabled: true,
      source: 'github',
      repository: 'LBW/neurosense360'
    }
  ]
};

export default PRODUCT_CONFIG;