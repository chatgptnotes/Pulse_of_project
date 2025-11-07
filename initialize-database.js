// Database Initialization Script
// This script initializes your Supabase database with sample project data

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.VITE_BUGTRACKING_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_BUGTRACKING_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample project data
const projects = [
  {
    id: 'neurosense-mvp',
    name: 'NeuroSense360 MVP',
    description: 'Full-stack NeuroSense360 application with clinic management, patient portal, and LBW Brain Wellness features',
    client: 'Dr. Murali BK',
    start_date: '2025-11-01',
    end_date: '2026-01-24',
    status: 'active',
    overall_progress: 0
  },
  {
    id: 'neurosense-360',
    name: 'Neurosense Mvp',
    description: 'Full-stack NeuroSense360 application',
    client: 'Dr. Murali BK',
    start_date: '2025-11-01',
    end_date: '2026-01-24',
    status: 'active',
    overall_progress: 0
  },
  {
    id: '4csecure-full-stack',
    name: '4CSecure Full Stack',
    description: 'Enterprise security management platform',
    client: '4CSecure',
    start_date: '2025-11-01',
    end_date: '2026-01-24',
    status: 'active',
    overall_progress: 99
  },
  {
    id: 'linkist-mvp',
    name: 'Linkist MVP',
    description: 'Social link management platform',
    client: 'Linkist',
    start_date: '2025-11-01',
    end_date: '2026-01-24',
    status: 'active',
    overall_progress: 0
  }
];

// Sample milestones for NeuroSense360
const neurosenseMilestones = [
  {
    id: 'milestone-1',
    project_id: 'neurosense-mvp',
    name: 'Phase 1: Foundation & Infrastructure',
    description: 'Setup core infrastructure, database schema, and authentication system',
    status: 'pending',
    start_date: '2025-11-01',
    end_date: '2025-11-10',
    progress: 0,
    deliverables: [
      { id: 'del-1-1', text: 'Signed LOC', completed: false },
      { id: 'del-1-2', text: 'Receipt of advance payment', completed: false },
      { id: 'del-1-3', text: 'Supabase database setup', completed: false },
      { id: 'del-1-4', text: 'Authentication system (Super Admin, Clinic Admin, Patient)', completed: false },
      { id: 'del-1-5', text: 'Core API structure', completed: false },
      { id: 'del-1-6', text: 'Basic routing and navigation', completed: false }
    ],
    assigned_to: ['Backend Team', 'DevOps'],
    dependencies: [],
    order: 1,
    color: '#4F46E5'
  },
  {
    id: 'milestone-2',
    project_id: 'neurosense-mvp',
    name: 'Phase 2: Landing Page & Marketing',
    description: 'Develop public-facing landing page with clinic locator and information',
    status: 'pending',
    start_date: '2025-11-11',
    end_date: '2025-11-17',
    progress: 0,
    deliverables: [
      { id: 'del-2-1', text: 'Landing page similar to biomesight', completed: false },
      { id: 'del-2-2', text: 'Clinic locator with auto-detection', completed: false },
      { id: 'del-2-3', text: 'Enquiry form integration', completed: false },
      { id: 'del-2-4', text: 'YouTube video integration', completed: false },
      { id: 'del-2-5', text: 'Brain health articles section', completed: false }
    ],
    assigned_to: ['Frontend Team', 'UI/UX Designer'],
    dependencies: ['milestone-1'],
    order: 2,
    color: '#10B981'
  },
  {
    id: 'milestone-3',
    project_id: 'neurosense-mvp',
    name: 'Phase 3: Super Admin Dashboard',
    description: 'Complete super admin functionality for multi-clinic management',
    status: 'pending',
    start_date: '2025-11-18',
    end_date: '2025-11-24',
    progress: 0,
    deliverables: [
      { id: 'del-3-1', text: 'Clinic management (CRUD)', completed: false },
      { id: 'del-3-2', text: 'Package creation and pricing', completed: false },
      { id: 'del-3-3', text: 'Session type management', completed: false },
      { id: 'del-3-4', text: 'Brain map management', completed: false },
      { id: 'del-3-5', text: 'Analytics dashboard', completed: false }
    ],
    assigned_to: ['Full Stack Team'],
    dependencies: ['milestone-1'],
    order: 3,
    color: '#F59E0B'
  },
  {
    id: 'milestone-4',
    project_id: 'neurosense-mvp',
    name: 'Phase 4: Clinic Admin Portal',
    description: 'Clinic-level administration and patient management',
    status: 'pending',
    start_date: '2025-11-25',
    end_date: '2025-12-01',
    progress: 0,
    deliverables: [
      { id: 'del-4-1', text: 'Patient registration & management', completed: false },
      { id: 'del-4-2', text: 'Session scheduling calendar', completed: false },
      { id: 'del-4-3', text: 'Appointment booking system', completed: false },
      { id: 'del-4-4', text: 'Payment processing (Razorpay)', completed: false },
      { id: 'del-4-5', text: 'Invoice generation', completed: false }
    ],
    assigned_to: ['Full Stack Team'],
    dependencies: ['milestone-3'],
    order: 4,
    color: '#8B5CF6'
  },
  {
    id: 'milestone-5',
    project_id: 'neurosense-mvp',
    name: 'Phase 5: Patient Portal',
    description: 'Patient-facing application for session tracking and reports',
    status: 'pending',
    start_date: '2025-12-02',
    end_date: '2025-12-08',
    progress: 0,
    deliverables: [
      { id: 'del-5-1', text: 'Patient dashboard', completed: false },
      { id: 'del-5-2', text: 'Session history & upcoming sessions', completed: false },
      { id: 'del-5-3', text: 'Report viewing (brain maps, session notes)', completed: false },
      { id: 'del-5-4', text: 'Payment history', completed: false },
      { id: 'del-5-5', text: 'Profile management', completed: false }
    ],
    assigned_to: ['Frontend Team'],
    dependencies: ['milestone-4'],
    order: 5,
    color: '#EC4899'
  }
];

// Milestones for neurosense-360 (same structure as neurosense-mvp)
const neurosense360Milestones = neurosenseMilestones.map(m => ({
  ...m,
  id: m.id.replace('milestone-', 'ns360-milestone-'),
  project_id: 'neurosense-360',
  deliverables: m.deliverables.map(d => ({
    ...d,
    id: d.id.replace('del-', 'ns360-del-')
  }))
}));

// Generic milestones for other projects
const generateGenericMilestones = (projectId, projectName, overallProgress) => {
  const totalMilestones = 10;
  const completedCount = Math.floor((overallProgress / 100) * totalMilestones);

  return Array.from({ length: totalMilestones }, (_, i) => {
    const milestoneNumber = i + 1;
    const phases = [
      'Foundation', 'Development', 'Integration', 'Testing',
      'Polish', 'Deployment', 'Launch', 'Optimization', 'Scale', 'Completion'
    ];

    let status = 'pending';
    let progress = 0;

    if (milestoneNumber <= completedCount) {
      status = 'completed';
      progress = 100;
    } else if (milestoneNumber === completedCount + 1 && overallProgress < 100) {
      status = 'in-progress';
      progress = ((overallProgress % 10) || 10) * 10;
    }

    return {
      id: `${projectId}-milestone-${milestoneNumber}`,
      project_id: projectId,
      name: `Phase ${milestoneNumber}: ${phases[i]}`,
      description: `Phase ${milestoneNumber} of project development`,
      status,
      start_date: new Date(Date.now() + (i * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      end_date: new Date(Date.now() + ((i + 1) * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      progress,
      deliverables: [
        { id: `${projectId}-del-${milestoneNumber}-1`, text: `Complete core functionality`, completed: status === 'completed' },
        { id: `${projectId}-del-${milestoneNumber}-2`, text: `Write documentation`, completed: status === 'completed' },
        { id: `${projectId}-del-${milestoneNumber}-3`, text: `Pass quality checks`, completed: status === 'completed' }
      ],
      assigned_to: ['Development Team'],
      dependencies: i > 0 ? [`${projectId}-milestone-${i}`] : [],
      order: milestoneNumber,
      color: '#4F46E5'
    };
  });
};

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...\n');

  try {
    // Step 1: Create/Update Projects
    console.log('📋 Creating projects...');
    for (const project of projects) {
      // Check if project exists
      const { data: existing, error: checkError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', project.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Project doesn't exist, create it
        const { error: insertError } = await supabase
          .from('projects')
          .insert(project);

        if (insertError) {
          console.error(`  ❌ Error creating project ${project.name}:`, insertError.message);
        } else {
          console.log(`  ✅ Created project: ${project.name}`);
        }
      } else if (existing) {
        // Project exists, update it
        const { error: updateError } = await supabase
          .from('projects')
          .update(project)
          .eq('id', project.id);

        if (updateError) {
          console.error(`  ❌ Error updating project ${project.name}:`, updateError.message);
        } else {
          console.log(`  ✅ Updated project: ${project.name}`);
        }
      }
    }

    // Step 2: Create/Update Milestones
    console.log('\n🎯 Creating milestones...');

    // NeuroSense milestones
    console.log('  NeuroSense360 MVP:');
    for (const milestone of neurosenseMilestones) {
      const { data: existing, error: checkError } = await supabase
        .from('project_milestones')
        .select('id')
        .eq('id', milestone.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('project_milestones')
          .insert(milestone);

        if (insertError) {
          console.error(`    ❌ ${milestone.name}:`, insertError.message);
        } else {
          console.log(`    ✅ ${milestone.name}`);
        }
      } else if (existing) {
        const { error: updateError } = await supabase
          .from('project_milestones')
          .update(milestone)
          .eq('id', milestone.id);

        if (updateError) {
          console.error(`    ❌ ${milestone.name}:`, updateError.message);
        } else {
          console.log(`    ✅ ${milestone.name} (updated)`);
        }
      }
    }

    // Neurosense-360 milestones
    console.log('  Neurosense 360:');
    for (const milestone of neurosense360Milestones) {
      const { data: existing, error: checkError } = await supabase
        .from('project_milestones')
        .select('id')
        .eq('id', milestone.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('project_milestones')
          .insert(milestone);

        if (insertError) {
          console.error(`    ❌ ${milestone.name}:`, insertError.message);
        } else {
          console.log(`    ✅ ${milestone.name}`);
        }
      } else if (existing) {
        const { error: updateError } = await supabase
          .from('project_milestones')
          .update(milestone)
          .eq('id', milestone.id);

        if (updateError) {
          console.error(`    ❌ ${milestone.name}:`, updateError.message);
        } else {
          console.log(`    ✅ ${milestone.name} (updated)`);
        }
      }
    }

    // 4CSecure milestones
    console.log('  4CSecure:');
    const fourCSecureMilestones = generateGenericMilestones('4csecure-full-stack', '4CSecure', 99);
    for (const milestone of fourCSecureMilestones) {
      const { data: existing } = await supabase
        .from('project_milestones')
        .select('id')
        .eq('id', milestone.id)
        .single();

      if (!existing) {
        await supabase.from('project_milestones').insert(milestone);
        console.log(`    ✅ ${milestone.name}`);
      }
    }

    // Linkist milestones
    console.log('  Linkist:');
    const linkistMilestones = generateGenericMilestones('linkist-mvp', 'Linkist MVP', 0);
    for (const milestone of linkistMilestones) {
      const { data: existing } = await supabase
        .from('project_milestones')
        .select('id')
        .eq('id', milestone.id)
        .single();

      if (!existing) {
        await supabase.from('project_milestones').insert(milestone);
        console.log(`    ✅ ${milestone.name}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Database initialization complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Restart your dev server: pnpm dev');
    console.log('2. Navigate to the project tracking page');
    console.log('3. Click on a deliverable checkbox');
    console.log('4. It should now work without errors!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Fatal error during initialization:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
