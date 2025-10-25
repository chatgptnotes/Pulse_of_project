-- Migration: Create bug_reports table
-- Description: Table to store bug reports for LinkList and Neuro360 projects
-- Date: 2024-10-24

-- Create bug_reports table
CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name VARCHAR(100) NOT NULL CHECK (project_name IN ('LinkList', 'Neuro360')),
    project_version VARCHAR(50),
    sno INTEGER NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    module VARCHAR(255) NOT NULL,
    screen VARCHAR(255) NOT NULL,
    snag TEXT NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('P1', 'P2', 'P3')),
    image_url TEXT,
    comments TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Testing', 'Verified', 'Closed', 'Reopened')),
    testing_status VARCHAR(20) DEFAULT 'Pending' CHECK (testing_status IN ('Pending', 'Pass', 'Fail', 'Blocked')),
    assigned_to VARCHAR(255),
    reported_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Create unique constraint for project + sno combination
    CONSTRAINT unique_project_sno UNIQUE (project_name, sno)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bug_reports_project_name ON public.bug_reports(project_name);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON public.bug_reports(severity);
CREATE INDEX IF NOT EXISTS idx_bug_reports_assigned_to ON public.bug_reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_bug_reports_date ON public.bug_reports(date);
CREATE INDEX IF NOT EXISTS idx_bug_reports_module ON public.bug_reports(module);

-- Enable Row Level Security
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Allow all operations for authenticated users (you can customize this based on your auth requirements)
CREATE POLICY "Allow all operations on bug_reports for authenticated users"
ON public.bug_reports
FOR ALL
USING (true);

-- Alternative: More restrictive policies (uncomment and modify as needed)
-- CREATE POLICY "Users can view all bug reports"
-- ON public.bug_reports
-- FOR SELECT
-- USING (true);

-- CREATE POLICY "Users can insert bug reports"
-- ON public.bug_reports
-- FOR INSERT
-- WITH CHECK (true);

-- CREATE POLICY "Users can update their own bug reports or assigned ones"
-- ON public.bug_reports
-- FOR UPDATE
-- USING (reported_by = auth.email() OR assigned_to = auth.email());

-- CREATE POLICY "Admins can delete bug reports"
-- ON public.bug_reports
-- FOR DELETE
-- USING (auth.role() = 'admin');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_bug_reports_updated_at
    BEFORE UPDATE ON public.bug_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get next serial number for a project
CREATE OR REPLACE FUNCTION public.get_next_bug_sno(project_name TEXT)
RETURNS INTEGER AS $$
DECLARE
    next_sno INTEGER;
BEGIN
    SELECT COALESCE(MAX(sno), 0) + 1
    INTO next_sno
    FROM public.bug_reports
    WHERE bug_reports.project_name = get_next_bug_sno.project_name;

    RETURN next_sno;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE public.bug_reports IS 'Store bug reports for LinkList and Neuro360 projects';
COMMENT ON COLUMN public.bug_reports.project_name IS 'Project name: LinkList or Neuro360';
COMMENT ON COLUMN public.bug_reports.sno IS 'Serial number unique within each project';
COMMENT ON COLUMN public.bug_reports.severity IS 'Bug priority: P1 (High), P2 (Medium), P3 (Low)';
COMMENT ON COLUMN public.bug_reports.status IS 'Current status of the bug report';
COMMENT ON COLUMN public.bug_reports.testing_status IS 'Testing verification status';