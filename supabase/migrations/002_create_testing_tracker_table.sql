-- Migration: Create testing_tracker table
-- Description: Table to track testing activities for bug reports
-- Date: 2024-10-24

-- Create testing_tracker table
CREATE TABLE IF NOT EXISTS public.testing_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bug_report_id UUID NOT NULL REFERENCES public.bug_reports(id) ON DELETE CASCADE,
    project_name VARCHAR(100) NOT NULL CHECK (project_name IN ('LinkList', 'Neuro360')),
    test_case_name VARCHAR(255) NOT NULL,
    test_description TEXT,
    expected_result TEXT,
    actual_result TEXT,
    test_status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (test_status IN ('Pass', 'Fail', 'Blocked', 'Pending')),
    tester_name VARCHAR(255) NOT NULL,
    test_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_testing_tracker_bug_report_id ON public.testing_tracker(bug_report_id);
CREATE INDEX IF NOT EXISTS idx_testing_tracker_project_name ON public.testing_tracker(project_name);
CREATE INDEX IF NOT EXISTS idx_testing_tracker_test_status ON public.testing_tracker(test_status);
CREATE INDEX IF NOT EXISTS idx_testing_tracker_tester_name ON public.testing_tracker(tester_name);
CREATE INDEX IF NOT EXISTS idx_testing_tracker_test_date ON public.testing_tracker(test_date);

-- Enable Row Level Security
ALTER TABLE public.testing_tracker ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Allow all operations for authenticated users
CREATE POLICY "Allow all operations on testing_tracker for authenticated users"
ON public.testing_tracker
FOR ALL
USING (true);

-- Alternative: More restrictive policies (uncomment and modify as needed)
-- CREATE POLICY "Users can view all testing records"
-- ON public.testing_tracker
-- FOR SELECT
-- USING (true);

-- CREATE POLICY "Users can insert testing records"
-- ON public.testing_tracker
-- FOR INSERT
-- WITH CHECK (true);

-- CREATE POLICY "Testers can update their own testing records"
-- ON public.testing_tracker
-- FOR UPDATE
-- USING (tester_name = auth.email());

-- CREATE trigger to automatically update updated_at
CREATE TRIGGER update_testing_tracker_updated_at
    BEFORE UPDATE ON public.testing_tracker
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get testing summary for a bug report
CREATE OR REPLACE FUNCTION public.get_testing_summary(bug_id UUID)
RETURNS TABLE (
    total_tests BIGINT,
    passed_tests BIGINT,
    failed_tests BIGINT,
    blocked_tests BIGINT,
    pending_tests BIGINT,
    latest_test_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_tests,
        COUNT(*) FILTER (WHERE test_status = 'Pass') as passed_tests,
        COUNT(*) FILTER (WHERE test_status = 'Fail') as failed_tests,
        COUNT(*) FILTER (WHERE test_status = 'Blocked') as blocked_tests,
        COUNT(*) FILTER (WHERE test_status = 'Pending') as pending_tests,
        MAX(test_date) as latest_test_date
    FROM public.testing_tracker
    WHERE bug_report_id = bug_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update bug report testing status based on test results
CREATE OR REPLACE FUNCTION public.update_bug_testing_status()
RETURNS TRIGGER AS $$
DECLARE
    bug_id UUID;
    test_summary RECORD;
BEGIN
    -- Get the bug_report_id from the affected row
    IF TG_OP = 'DELETE' THEN
        bug_id := OLD.bug_report_id;
    ELSE
        bug_id := NEW.bug_report_id;
    END IF;

    -- Get testing summary for this bug
    SELECT * INTO test_summary FROM public.get_testing_summary(bug_id);

    -- Update bug report testing status based on test results
    IF test_summary.total_tests = 0 THEN
        UPDATE public.bug_reports
        SET testing_status = 'Pending'
        WHERE id = bug_id;
    ELSIF test_summary.failed_tests > 0 OR test_summary.blocked_tests > 0 THEN
        UPDATE public.bug_reports
        SET testing_status = 'Fail'
        WHERE id = bug_id;
    ELSIF test_summary.pending_tests > 0 THEN
        UPDATE public.bug_reports
        SET testing_status = 'Pending'
        WHERE id = bug_id;
    ELSE
        UPDATE public.bug_reports
        SET testing_status = 'Pass'
        WHERE id = bug_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update bug testing status
CREATE TRIGGER update_bug_testing_status_on_insert
    AFTER INSERT ON public.testing_tracker
    FOR EACH ROW
    EXECUTE FUNCTION public.update_bug_testing_status();

CREATE TRIGGER update_bug_testing_status_on_update
    AFTER UPDATE ON public.testing_tracker
    FOR EACH ROW
    EXECUTE FUNCTION public.update_bug_testing_status();

CREATE TRIGGER update_bug_testing_status_on_delete
    AFTER DELETE ON public.testing_tracker
    FOR EACH ROW
    EXECUTE FUNCTION public.update_bug_testing_status();

-- Add comments for documentation
COMMENT ON TABLE public.testing_tracker IS 'Track testing activities and results for bug reports';
COMMENT ON COLUMN public.testing_tracker.bug_report_id IS 'Reference to the bug being tested';
COMMENT ON COLUMN public.testing_tracker.test_status IS 'Result of the test: Pass, Fail, Blocked, or Pending';
COMMENT ON FUNCTION public.get_testing_summary(UUID) IS 'Get testing statistics summary for a bug report';
COMMENT ON FUNCTION public.update_bug_testing_status() IS 'Automatically update bug report testing status based on test results';