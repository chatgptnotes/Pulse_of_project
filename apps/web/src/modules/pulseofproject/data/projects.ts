// PulseOfProject - Project Database
// All active projects organized by priority

export interface Project {
  id: string;
  name: string;
  client: string;
  description?: string;
  status: 'active' | 'planning' | 'completed' | 'on-hold';
  priority: 1 | 2 | 3 | 4;
  progress: number;
  starred: boolean;
  deadline: string;
  team: number;
  url?: string;
  category: string;
  shareToken?: string; // Unique token for client sharing
}

export const projects: Project[] = [
  // Priority 1 Projects
  {
    id: 'neurosense-360',
    name: 'NeuroSense360 & LBW',
    client: 'Limitless Brain Wellness',
    description: 'Combined Neuro360 and LBW platform',
    status: 'active',
    priority: 1,
    progress: 65,
    starred: true,
    deadline: '2026-01-24',
    team: 7,
    category: 'Healthcare',
    shareToken: 'lbw-share-x7k9p'
  },
  {
    id: 'call-center-betser',
    name: 'Call Center for Betser',
    client: 'Betser',
    description: 'Connect to economystic.ai',
    status: 'active',
    priority: 1,
    progress: 45,
    starred: true,
    deadline: '2026-02-15',
    team: 4,
    category: 'Business Operations',
    shareToken: 'betser-cc-m3n2q'
  },
  {
    id: 'orma',
    name: 'Orma',
    client: 'Orma',
    status: 'active',
    priority: 1,
    progress: 72,
    starred: true,
    deadline: '2026-01-31',
    team: 3,
    url: 'https://orma-eight.vercel.app/',
    category: 'Business',
    shareToken: 'orma-share-z8w4r'
  },
  {
    id: '4csecure',
    name: '4CSecure',
    client: '4CSecure',
    status: 'active',
    priority: 1,
    progress: 99,
    starred: true,
    deadline: '2026-02-10',
    team: 5,
    url: 'https://4csecure-guide-distribution.vercel.app/',
    category: 'Security',
    shareToken: '4csecure-view-p5t7k'
  },
  {
    id: 'betser-life',
    name: 'Betser Life Landing Page',
    client: 'Betser',
    description: 'AI agent Bhelp app',
    status: 'active',
    priority: 1,
    progress: 35,
    starred: true,
    deadline: '2026-02-20',
    team: 4,
    category: 'AI Assistant'
  },
  {
    id: 'headz-stylemy',
    name: 'Headz - StyleMy.hair',
    client: 'Headz',
    status: 'active',
    priority: 1,
    progress: 80,
    starred: true,
    deadline: '2026-01-15',
    team: 6,
    url: 'www.Stylemy.hair',
    category: 'Beauty & Style'
  },
  {
    id: 'linkist-nfc',
    name: 'Linkist NFC',
    client: 'Linkist',
    status: 'active',
    priority: 1,
    progress: 90,
    starred: true,
    deadline: '2025-10-16',
    team: 3,
    url: 'https://linkist-app.vercel.app/',
    category: 'Networking'
  },
  {
    id: 'economystic-ai',
    name: 'Economystic.ai',
    client: 'Betser',
    description: 'Business operations platform',
    status: 'active',
    priority: 1,
    progress: 55,
    starred: true,
    deadline: '2026-02-01',
    team: 5,
    category: 'Business Operations'
  },
  {
    id: 'pulseofpeople',
    name: 'PulseOfPeople.com',
    client: 'Political Analytics',
    description: 'Voter sentiment, ward level heat maps, feedback bot, Manifesto match AI',
    status: 'active',
    priority: 1,
    progress: 40,
    starred: true,
    deadline: '2026-03-01',
    team: 8,
    category: 'Political Tech'
  },
  {
    id: 'headz-ios',
    name: 'Headz iOS App',
    client: 'Headz',
    status: 'active',
    priority: 1,
    progress: 70,
    starred: true,
    deadline: '2026-01-20',
    team: 4,
    category: 'Mobile App'
  },
  {
    id: 'headz-android',
    name: 'Headz Android App',
    client: 'Headz',
    status: 'active',
    priority: 1,
    progress: 65,
    starred: true,
    deadline: '2026-01-25',
    team: 4,
    category: 'Mobile App'
  },
  {
    id: 'adamrit-hms',
    name: 'ADAMRIT',
    client: 'Healthcare',
    description: 'Hospital management system',
    status: 'active',
    priority: 1,
    progress: 25,
    starred: true,
    deadline: '2026-04-01',
    team: 7,
    category: 'Healthcare'
  },
  {
    id: 'proposify-ai',
    name: 'Proposify AI',
    client: 'BettRoi',
    description: 'AI generated business proposal',
    status: 'active',
    priority: 1,
    progress: 30,
    starred: true,
    deadline: '2026-02-28',
    team: 3,
    category: 'Business Tools'
  },
  {
    id: 'project-progress-dashboard',
    name: 'Project Progress Dashboard',
    client: 'BettRoi',
    description: 'PulseOfProject.com',
    status: 'active',
    priority: 1,
    progress: 85,
    starred: true,
    deadline: '2025-12-20',
    team: 2,
    category: 'Internal Tools'
  },

  // Priority 2 Projects
  {
    id: 'privata-site',
    name: 'Privata.site',
    client: 'Privata',
    status: 'active',
    priority: 2,
    progress: 48,
    starred: false,
    deadline: '2026-03-15',
    team: 4,
    url: 'www.privata.site',
    category: 'Healthcare'
  },
  {
    id: 'agentsdr-2men',
    name: 'AgentSDR - 2men.co',
    client: '2men',
    status: 'active',
    priority: 2,
    progress: 52,
    starred: false,
    deadline: '2026-02-25',
    team: 3,
    category: 'AI Sales'
  },
  {
    id: 'ddo-doctors',
    name: 'DDO - Doctors Digital Office',
    client: 'Healthcare',
    status: 'active',
    priority: 2,
    progress: 20,
    starred: false,
    deadline: '2026-05-01',
    team: 5,
    category: 'Healthcare'
  },
  {
    id: 'styleyour-hair',
    name: 'StyleYour.hair',
    client: 'BettRoi',
    description: 'Productise by BettRoi',
    status: 'planning',
    priority: 2,
    progress: 15,
    starred: false,
    deadline: '2026-04-01',
    team: 3,
    category: 'Beauty & Style'
  },
  {
    id: 'ai-shu',
    name: 'AI-Shu',
    client: 'Coaching Platform',
    description: 'AI Coaching assistant',
    status: 'planning',
    priority: 2,
    progress: 10,
    starred: false,
    deadline: '2026-04-15',
    team: 3,
    category: 'AI Assistant'
  },
  {
    id: 'cheripic',
    name: 'CheriPic',
    client: 'CheriPic',
    status: 'planning',
    priority: 2,
    progress: 5,
    starred: false,
    deadline: '2026-05-01',
    team: 4,
    category: 'Photo Management'
  },

  // Priority 3 Projects
  {
    id: 'dubai-lit-fest',
    name: 'Dubai Literature Festival',
    client: 'Dubai Lit Fest',
    status: 'planning',
    priority: 3,
    progress: 0,
    starred: false,
    deadline: '2026-06-01',
    team: 3,
    category: 'Events'
  },
  {
    id: 'pulse-of-employee',
    name: 'Pulse of Employee',
    client: 'HR Tech',
    status: 'planning',
    priority: 3,
    progress: 0,
    starred: false,
    deadline: '2026-05-15',
    team: 4,
    category: 'HR Tech'
  },
  {
    id: '2men-co',
    name: '2men.co',
    client: '2men',
    status: 'planning',
    priority: 3,
    progress: 8,
    starred: false,
    deadline: '2026-04-30',
    team: 2,
    category: 'Business'
  },
  {
    id: 'agent-sdr',
    name: 'AgentSDR',
    client: 'Sales Tech',
    status: 'planning',
    priority: 3,
    progress: 12,
    starred: false,
    deadline: '2026-05-01',
    team: 3,
    category: 'AI Sales'
  },
  {
    id: 'customer-x',
    name: 'Customer X BettRoi',
    client: 'BettRoi',
    status: 'planning',
    priority: 3,
    progress: 0,
    starred: false,
    deadline: '2026-06-01',
    team: 4,
    category: 'CRM'
  },
  {
    id: 'bettrio-bos',
    name: 'BettRio BOS',
    client: 'BettRoi',
    description: 'Business Operating System',
    status: 'planning',
    priority: 3,
    progress: 5,
    starred: false,
    deadline: '2026-07-01',
    team: 6,
    category: 'Business Operations'
  },
  {
    id: 'privata-health',
    name: 'Privata Health/OpenHealth',
    client: 'Privata',
    description: 'Open source healthcare software',
    status: 'planning',
    priority: 3,
    progress: 0,
    starred: false,
    deadline: '2026-08-01',
    team: 5,
    category: 'Healthcare'
  },
  {
    id: 'agent-x',
    name: 'Agent X BettRoi',
    client: 'BettRoi',
    status: 'planning',
    priority: 3,
    progress: 0,
    starred: false,
    deadline: '2026-06-15',
    team: 3,
    category: 'AI Agent'
  },
  {
    id: 'apx-bettroi',
    name: 'APX - BettRoi',
    client: 'BettRoi',
    description: 'Multi agent orchestrator',
    status: 'planning',
    priority: 3,
    progress: 0,
    starred: false,
    deadline: '2026-07-15',
    team: 5,
    category: 'AI Platform'
  },

  // Priority 4 Projects
  {
    id: 'naiz',
    name: 'Naiz',
    client: 'Naiz',
    status: 'on-hold',
    priority: 4,
    progress: 0,
    starred: false,
    deadline: '2026-09-01',
    team: 2,
    category: 'Other'
  },
  {
    id: 'bni-member-ai',
    name: 'BNI Member AI Assistant',
    client: 'BNI',
    status: 'on-hold',
    priority: 4,
    progress: 0,
    starred: false,
    deadline: '2026-08-01',
    team: 2,
    category: 'AI Assistant'
  },
  {
    id: 'money-wise',
    name: 'Money Wise',
    client: 'FinTech',
    status: 'on-hold',
    priority: 4,
    progress: 0,
    starred: false,
    deadline: '2026-09-01',
    team: 3,
    category: 'FinTech'
  },
  {
    id: 'adda-residential',
    name: 'Adda',
    client: 'Residential Association',
    status: 'on-hold',
    priority: 4,
    progress: 0,
    starred: false,
    deadline: '2026-10-01',
    team: 3,
    category: 'Community'
  },
  {
    id: 'privata-bettroi',
    name: 'Privata BettRoi',
    client: 'BettRoi',
    status: 'on-hold',
    priority: 4,
    progress: 0,
    starred: false,
    deadline: '2026-09-15',
    team: 2,
    category: 'Healthcare'
  },
  {
    id: 'linkmore-alumni',
    name: 'LinkMore',
    client: 'Alumni Networks',
    description: 'Alumni and focused groups',
    status: 'on-hold',
    priority: 4,
    progress: 0,
    starred: false,
    deadline: '2026-10-01',
    team: 3,
    url: 'https://first-link-introductions.lovable.app/',
    category: 'Networking'
  },
  {
    id: 'medgemma-27b',
    name: 'MedGemma 27B',
    client: 'Healthcare AI',
    status: 'on-hold',
    priority: 4,
    progress: 0,
    starred: false,
    deadline: '2026-11-01',
    team: 4,
    category: 'AI Healthcare'
  },
  {
    id: 'pulse-people-albania',
    name: 'Pulse of People - Albania',
    client: 'Political Analytics',
    status: 'on-hold',
    priority: 4,
    progress: 0,
    starred: false,
    deadline: '2026-12-01',
    team: 2,
    category: 'Political Tech'
  },
  {
    id: 'pulse-people-angola',
    name: 'Pulse of People - Angola',
    client: 'Political Analytics',
    status: 'on-hold',
    priority: 4,
    progress: 0,
    starred: false,
    deadline: '2026-12-15',
    team: 2,
    category: 'Political Tech'
  },
  {
    id: 'prewed-ai',
    name: 'PreWed.ai',
    client: 'Wedding Tech',
    status: 'on-hold',
    priority: 4,
    progress: 0,
    starred: false,
    deadline: '2026-11-01',
    team: 3,
    category: 'Wedding'
  },
  {
    id: 'pulse-of-patients',
    name: 'SDR - Pulse of Patients',
    client: 'Healthcare',
    status: 'on-hold',
    priority: 4,
    progress: 0,
    starred: false,
    deadline: '2026-10-15',
    team: 3,
    category: 'Healthcare'
  },
  {
    id: 'sales-marketing-surgeons',
    name: 'Sales & Marketing for Surgeons',
    client: 'Healthcare Marketing',
    description: 'Conversion optimization',
    status: 'on-hold',
    priority: 4,
    progress: 0,
    starred: false,
    deadline: '2026-11-15',
    team: 3,
    category: 'Healthcare Marketing'
  },
  {
    id: 'premagic-photomagic',
    name: 'PreMagic / PhotoMagic',
    client: 'Photo Tech',
    description: 'Find my photo',
    status: 'on-hold',
    priority: 4,
    progress: 0,
    starred: false,
    deadline: '2026-12-01',
    team: 3,
    category: 'Photo Management'
  },
  {
    id: 'bhashai',
    name: 'Bhashai',
    client: 'Language Tech',
    status: 'on-hold',
    priority: 4,
    progress: 0,
    starred: false,
    deadline: '2026-12-01',
    team: 2,
    category: 'Language'
  },
  {
    id: 'acad-forge',
    name: 'ACAD FORGE',
    client: 'Education Tech',
    description: 'AI Counselor',
    status: 'on-hold',
    priority: 4,
    progress: 0,
    starred: false,
    deadline: '2026-12-15',
    team: 3,
    category: 'EdTech'
  },
  {
    id: 'lindy-ai',
    name: 'Lindy.ai',
    client: 'AI Platform',
    status: 'on-hold',
    priority: 4,
    progress: 0,
    starred: false,
    deadline: '2027-01-01',
    team: 2,
    category: 'AI Platform'
  }
];

// Helper functions
export const getProjectsByPriority = (priority: number) =>
  projects.filter(p => p.priority === priority);

export const getActiveProjects = () =>
  projects.filter(p => p.status === 'active');

export const getProjectsByCategory = (category: string) =>
  projects.filter(p => p.category === category);

export const getProjectById = (id: string) =>
  projects.find(p => p.id === id);

export const getProjectByShareToken = (shareToken: string) =>
  projects.find(p => p.shareToken === shareToken);

// Categories for filtering
export const categories = [
  'Healthcare',
  'Business Operations',
  'AI Assistant',
  'AI Sales',
  'AI Platform',
  'Beauty & Style',
  'Networking',
  'Political Tech',
  'Mobile App',
  'Business Tools',
  'Internal Tools',
  'Security',
  'Photo Management',
  'Events',
  'HR Tech',
  'CRM',
  'AI Agent',
  'AI Healthcare',
  'FinTech',
  'Community',
  'Wedding',
  'Healthcare Marketing',
  'Language',
  'EdTech',
  'Other'
];