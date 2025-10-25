-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) CHECK (status IN ('planning', 'active', 'on-hold', 'completed', 'cancelled')),
    overall_progress DECIMAL(5, 2) DEFAULT 0,
    budget_total DECIMAL(15, 2),
    budget_spent DECIMAL(15, 2) DEFAULT 0,
    budget_currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project_milestones table
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) CHECK (status IN ('pending', 'in-progress', 'completed', 'delayed')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    progress DECIMAL(5, 2) DEFAULT 0,
    deliverables JSONB DEFAULT '[]'::jsonb,
    assigned_to JSONB DEFAULT '[]'::jsonb,
    dependencies JSONB DEFAULT '[]'::jsonb,
    order_num INTEGER NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID REFERENCES project_milestones(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) CHECK (status IN ('pending', 'in-progress', 'completed', 'blocked')),
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    progress DECIMAL(5, 2) DEFAULT 0,
    assigned_to JSONB DEFAULT '[]'::jsonb,
    dependencies JSONB DEFAULT '[]'::jsonb,
    estimated_hours DECIMAL(8, 2),
    actual_hours DECIMAL(8, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create milestone_kpis table
CREATE TABLE IF NOT EXISTS milestone_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID REFERENCES project_milestones(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target DECIMAL(15, 2) NOT NULL,
    current_value DECIMAL(15, 2) DEFAULT 0,
    unit VARCHAR(50),
    status VARCHAR(20) CHECK (status IN ('on-track', 'at-risk', 'off-track')),
    trend VARCHAR(10) CHECK (trend IN ('up', 'down', 'stable')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project_team_members table
CREATE TABLE IF NOT EXISTS project_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(100),
    avatar VARCHAR(500),
    allocation DECIMAL(5, 2) DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project_risks table
CREATE TABLE IF NOT EXISTS project_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    impact VARCHAR(20) CHECK (impact IN ('low', 'medium', 'high', 'critical')),
    likelihood VARCHAR(20) CHECK (likelihood IN ('low', 'medium', 'high')),
    mitigation TEXT,
    status VARCHAR(20) CHECK (status IN ('identified', 'monitoring', 'resolved')),
    owner VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project_comments table
CREATE TABLE IF NOT EXISTS project_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES project_milestones(id) ON DELETE SET NULL,
    task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    mentions JSONB DEFAULT '[]'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project_updates table
CREATE TABLE IF NOT EXISTS project_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('milestone', 'task', 'kpi', 'general')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_project_milestones_project_id ON project_milestones(project_id);
CREATE INDEX idx_project_tasks_milestone_id ON project_tasks(milestone_id);
CREATE INDEX idx_milestone_kpis_milestone_id ON milestone_kpis(milestone_id);
CREATE INDEX idx_project_team_members_project_id ON project_team_members(project_id);
CREATE INDEX idx_project_risks_project_id ON project_risks(project_id);
CREATE INDEX idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX idx_project_comments_milestone_id ON project_comments(milestone_id);
CREATE INDEX idx_project_comments_task_id ON project_comments(task_id);
CREATE INDEX idx_project_updates_project_id ON project_updates(project_id);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp triggers
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at BEFORE UPDATE ON project_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestone_kpis_updated_at BEFORE UPDATE ON milestone_kpis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_risks_updated_at BEFORE UPDATE ON project_risks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your auth requirements)
CREATE POLICY "Allow all users to read projects"
    ON projects FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to manage projects"
    ON projects FOR ALL
    USING (auth.role() = 'authenticated');

-- Similar policies for other tables
CREATE POLICY "Allow all users to read milestones"
    ON project_milestones FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to manage milestones"
    ON project_milestones FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all users to read tasks"
    ON project_tasks FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to manage tasks"
    ON project_tasks FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all users to read comments"
    ON project_comments FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to create comments"
    ON project_comments FOR INSERT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to delete own comments"
    ON project_comments FOR DELETE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Allow all users to read updates"
    ON project_updates FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to create updates"
    ON project_updates FOR INSERT
    USING (auth.role() = 'authenticated');