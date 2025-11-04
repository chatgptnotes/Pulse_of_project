-- Project Tracking Database Schema
-- This script creates tables for project tracking with deliverables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  client TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status TEXT CHECK (status IN ('planning', 'active', 'on-hold', 'completed', 'cancelled')) DEFAULT 'planning',
  overall_progress INTEGER DEFAULT 0,
  budget JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project Milestones table with deliverables as JSONB
CREATE TABLE IF NOT EXISTS project_milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in-progress', 'completed', 'delayed')) DEFAULT 'pending',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  progress INTEGER DEFAULT 0,
  deliverables JSONB DEFAULT '[]'::jsonb,  -- Array of {id, text, completed}
  assigned_to TEXT[] DEFAULT ARRAY[]::TEXT[],
  dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
  "order" INTEGER DEFAULT 0,
  color TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Milestone KPIs table
CREATE TABLE IF NOT EXISTS milestone_kpis (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  milestone_id TEXT REFERENCES project_milestones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target NUMERIC NOT NULL,
  current NUMERIC DEFAULT 0,
  unit TEXT NOT NULL,
  status TEXT CHECK (status IN ('on-track', 'at-risk', 'off-track')) DEFAULT 'on-track',
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')) DEFAULT 'stable',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project Tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id TEXT PRIMARY KEY,
  milestone_id TEXT REFERENCES project_milestones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in-progress', 'completed', 'blocked')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  progress INTEGER DEFAULT 0,
  assigned_to TEXT[] DEFAULT ARRAY[]::TEXT[],
  dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project Team Members table
CREATE TABLE IF NOT EXISTS project_team_members (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  allocation INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project Risks table
CREATE TABLE IF NOT EXISTS project_risks (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  impact TEXT CHECK (impact IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  likelihood TEXT CHECK (likelihood IN ('low', 'medium', 'high')) DEFAULT 'medium',
  mitigation TEXT,
  status TEXT CHECK (status IN ('identified', 'monitoring', 'resolved')) DEFAULT 'identified',
  owner TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project Comments table
CREATE TABLE IF NOT EXISTS project_comments (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id TEXT REFERENCES project_milestones(id) ON DELETE SET NULL,
  task_id TEXT REFERENCES project_tasks(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  mentions TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Project Updates table
CREATE TABLE IF NOT EXISTS project_updates (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  type TEXT CHECK (type IN ('milestone', 'task', 'kpi', 'general')) DEFAULT 'general',
  title TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  data JSONB
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_order ON project_milestones("order");
CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON project_tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_kpis_milestone ON milestone_kpis(milestone_id);
CREATE INDEX IF NOT EXISTS idx_comments_project ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_updates_project ON project_updates(project_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_milestones_updated_at ON project_milestones;
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON project_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON project_tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional, uncomment if needed)
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE milestone_kpis ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_risks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE project_milestones IS 'Project milestones with deliverables stored as JSONB array';
COMMENT ON COLUMN project_milestones.deliverables IS 'Array of deliverables in format: [{id: string, text: string, completed: boolean}]';
