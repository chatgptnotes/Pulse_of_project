-- ============================================================================
-- PROJECT TRACKING SYSTEM - DATABASE SCHEMA
-- ============================================================================
-- This script creates all tables needed for the project tracking system
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    client TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    overall_progress INTEGER DEFAULT 0,
    budget NUMERIC,
    spent NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECT MILESTONES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    progress INTEGER DEFAULT 0,
    deliverables JSONB DEFAULT '[]'::jsonb,
    assigned_to TEXT[] DEFAULT ARRAY[]::TEXT[],
    dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER DEFAULT 0,
    color TEXT DEFAULT '#4F46E5',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECT TASKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id TEXT PRIMARY KEY,
    milestone_id TEXT REFERENCES public.project_milestones(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    progress INTEGER DEFAULT 0,
    assigned_to TEXT[] DEFAULT ARRAY[]::TEXT[],
    dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MILESTONE KPIs TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.milestone_kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id TEXT NOT NULL REFERENCES public.project_milestones(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target NUMERIC NOT NULL,
    current NUMERIC DEFAULT 0,
    unit TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECT COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.project_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECT UPDATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.project_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECT TEAM MEMBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.project_team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- ============================================================================
-- PROJECT RISKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.project_risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL,
    probability TEXT NOT NULL,
    mitigation TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_status ON public.project_milestones(status);
CREATE INDEX IF NOT EXISTS idx_project_milestones_order ON public.project_milestones("order");

CREATE INDEX IF NOT EXISTS idx_project_tasks_milestone_id ON public.project_tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON public.project_tasks(status);

CREATE INDEX IF NOT EXISTS idx_milestone_kpis_milestone_id ON public.milestone_kpis(milestone_id);

CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON public.project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_timestamp ON public.project_comments(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON public.project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_timestamp ON public.project_updates(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_project_team_members_project_id ON public.project_team_members(project_id);

CREATE INDEX IF NOT EXISTS idx_project_risks_project_id ON public.project_risks(project_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_risks ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (you can restrict this later based on authentication)
CREATE POLICY "Allow public read access on projects" ON public.projects FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access on projects" ON public.projects FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update access on projects" ON public.projects FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete access on projects" ON public.projects FOR DELETE TO public USING (true);

CREATE POLICY "Allow public read access on project_milestones" ON public.project_milestones FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access on project_milestones" ON public.project_milestones FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update access on project_milestones" ON public.project_milestones FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete access on project_milestones" ON public.project_milestones FOR DELETE TO public USING (true);

CREATE POLICY "Allow public read access on project_tasks" ON public.project_tasks FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access on project_tasks" ON public.project_tasks FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update access on project_tasks" ON public.project_tasks FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete access on project_tasks" ON public.project_tasks FOR DELETE TO public USING (true);

CREATE POLICY "Allow public read access on milestone_kpis" ON public.milestone_kpis FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access on milestone_kpis" ON public.milestone_kpis FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update access on milestone_kpis" ON public.milestone_kpis FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete access on milestone_kpis" ON public.milestone_kpis FOR DELETE TO public USING (true);

CREATE POLICY "Allow public read access on project_comments" ON public.project_comments FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access on project_comments" ON public.project_comments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update access on project_comments" ON public.project_comments FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete access on project_comments" ON public.project_comments FOR DELETE TO public USING (true);

CREATE POLICY "Allow public read access on project_updates" ON public.project_updates FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access on project_updates" ON public.project_updates FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update access on project_updates" ON public.project_updates FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete access on project_updates" ON public.project_updates FOR DELETE TO public USING (true);

CREATE POLICY "Allow public read access on project_team_members" ON public.project_team_members FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access on project_team_members" ON public.project_team_members FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update access on project_team_members" ON public.project_team_members FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete access on project_team_members" ON public.project_team_members FOR DELETE TO public USING (true);

CREATE POLICY "Allow public read access on project_risks" ON public.project_risks FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access on project_risks" ON public.project_risks FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update access on project_risks" ON public.project_risks FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete access on project_risks" ON public.project_risks FOR DELETE TO public USING (true);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at column
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at BEFORE UPDATE ON public.project_milestones
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON public.project_tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_milestone_kpis_updated_at BEFORE UPDATE ON public.milestone_kpis
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_risks_updated_at BEFORE UPDATE ON public.project_risks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Project Tracking System database schema created successfully!';
    RAISE NOTICE '📊 Tables created: projects, project_milestones, project_tasks, milestone_kpis, project_comments, project_updates, project_team_members, project_risks';
    RAISE NOTICE '🔒 RLS policies enabled with public access (modify these for production security)';
    RAISE NOTICE '🚀 You can now use the deliverable checkboxes - changes will persist in Supabase!';
END $$;
