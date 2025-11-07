-- Fix: Add function to generate next bug SNO (Serial Number)
-- This function is called by bugTrackingService when creating new bug reports

CREATE OR REPLACE FUNCTION get_next_bug_sno(project_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  next_sno INTEGER;
BEGIN
  -- Get the maximum SNO for this project and add 1
  SELECT COALESCE(MAX(sno), 0) + 1
  INTO next_sno
  FROM bug_reports
  WHERE bug_reports.project_name = get_next_bug_sno.project_name;

  RETURN next_sno;
END;
$$;

-- Test the function
SELECT get_next_bug_sno('linkist-nfc') AS next_sno_for_linkist_nfc;
SELECT get_next_bug_sno('test-project') AS next_sno_for_test_project;

COMMENT ON FUNCTION get_next_bug_sno IS 'Generates the next serial number (SNO) for bug reports in a specific project';
