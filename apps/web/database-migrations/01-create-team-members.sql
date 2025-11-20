-- Migration: Create Team Members Table
-- Purpose: Manage client and development team members for project tracking
-- Date: 2025-11-07

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(100),
  team_type VARCHAR(50) NOT NULL CHECK (team_type IN ('client', 'development')),
  project_name VARCHAR(100),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_team_members_team_type ON team_members(team_type);
CREATE INDEX idx_team_members_project_name ON team_members(project_name);
CREATE INDEX idx_team_members_is_active ON team_members(is_active);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_members_updated_at();

-- Seed sample data
INSERT INTO team_members (name, email, role, team_type, project_name) VALUES
  -- Client Team
  ('John Smith', 'john@client.com', 'Product Manager', 'client', 'LinkList'),
  ('Sarah Johnson', 'sarah@client.com', 'QA Lead', 'client', 'LinkList'),
  ('Mike Chen', 'mike@client.com', 'Business Analyst', 'client', 'LinkList'),

  -- Development Team
  ('Alex Kumar', 'alex@dev.com', 'Frontend Developer', 'development', 'LinkList'),
  ('Maria Garcia', 'maria@dev.com', 'Backend Developer', 'development', 'LinkList'),
  ('David Lee', 'david@dev.com', 'UI/UX Designer', 'development', 'LinkList'),
  ('Rachel Wong', 'rachel@dev.com', 'QA Engineer', 'development', 'LinkList'),
  ('James Brown', 'james@dev.com', 'DevOps Engineer', 'development', 'LinkList')
ON CONFLICT DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE team_members IS 'Stores client and development team members for project tracking';
COMMENT ON COLUMN team_members.team_type IS 'Type of team member: client or development';
COMMENT ON COLUMN team_members.is_active IS 'Whether the team member is currently active on the project';
