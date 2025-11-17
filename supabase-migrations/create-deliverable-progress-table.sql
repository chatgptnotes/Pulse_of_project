-- Create deliverable_progress table to track individual deliverable completion status
-- This separates deliverable tracking from milestone data

CREATE TABLE IF NOT EXISTS public.deliverable_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id TEXT NOT NULL,
  deliverable_id TEXT NOT NULL,
  deliverable_text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique deliverable per project
  UNIQUE(project_id, milestone_id, deliverable_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_deliverable_progress_project
ON public.deliverable_progress(project_id);

CREATE INDEX IF NOT EXISTS idx_deliverable_progress_milestone
ON public.deliverable_progress(project_id, milestone_id);

-- Enable Row Level Security
ALTER TABLE public.deliverable_progress ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now
CREATE POLICY "Enable all operations for deliverable_progress"
ON public.deliverable_progress
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_deliverable_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deliverable_progress_updated_at
BEFORE UPDATE ON public.deliverable_progress
FOR EACH ROW
EXECUTE FUNCTION update_deliverable_progress_updated_at();

-- Comment on table
COMMENT ON TABLE public.deliverable_progress IS 'Tracks individual deliverable completion status separately from milestone data';

