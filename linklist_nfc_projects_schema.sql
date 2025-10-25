-- LinkList NFC Projects Table Schema
-- This table stores comprehensive information about NFC projects for the LinkList platform

-- Create the main table
CREATE TABLE linklist_nfc_projects (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Project identification
    project_name VARCHAR(255) NOT NULL,
    project_description TEXT,

    -- NFC technical specifications
    nfc_tag_type VARCHAR(50) CHECK (nfc_tag_type IN ('NTAG213', 'NTAG215', 'NTAG216', 'NTAG424', 'Mifare Classic', 'Other')),
    nfc_data_format VARCHAR(50) CHECK (nfc_data_format IN ('URL', 'vCard', 'Text', 'WiFi', 'Email', 'SMS', 'Phone', 'Application', 'Custom')),
    nfc_payload JSONB DEFAULT '{}',

    -- Project management
    project_status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (project_status IN ('Draft', 'Active', 'Inactive', 'Deployed', 'Completed', 'Cancelled')),
    project_priority VARCHAR(10) DEFAULT 'Medium' CHECK (project_priority IN ('Low', 'Medium', 'High', 'Critical')),

    -- Team and assignments
    created_by VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255),
    client_name VARCHAR(255),

    -- Deployment details
    deployment_location VARCHAR(255),
    tag_quantity INTEGER DEFAULT 1 CHECK (tag_quantity > 0),

    -- Timeline
    estimated_completion_date DATE,
    actual_completion_date DATE,

    -- Financial
    project_budget DECIMAL(10,2),
    project_cost DECIMAL(10,2),

    -- Additional information
    notes TEXT,

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_linklist_nfc_projects_status ON linklist_nfc_projects(project_status);
CREATE INDEX idx_linklist_nfc_projects_priority ON linklist_nfc_projects(project_priority);
CREATE INDEX idx_linklist_nfc_projects_created_by ON linklist_nfc_projects(created_by);
CREATE INDEX idx_linklist_nfc_projects_assigned_to ON linklist_nfc_projects(assigned_to);
CREATE INDEX idx_linklist_nfc_projects_client ON linklist_nfc_projects(client_name);
CREATE INDEX idx_linklist_nfc_projects_created_at ON linklist_nfc_projects(created_at);
CREATE INDEX idx_linklist_nfc_projects_completion_date ON linklist_nfc_projects(estimated_completion_date);

-- Create a composite index for project searches
CREATE INDEX idx_linklist_nfc_projects_search ON linklist_nfc_projects(project_status, project_priority, created_by);

-- Enable Row Level Security
ALTER TABLE linklist_nfc_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow all operations for now (you can restrict this based on user roles later)
CREATE POLICY "Allow all operations on linklist_nfc_projects"
ON linklist_nfc_projects FOR ALL USING (true);

-- Create trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_linklist_nfc_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_linklist_nfc_projects_updated_at
    BEFORE UPDATE ON linklist_nfc_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_linklist_nfc_projects_updated_at();

-- Add foreign key relationship to bug_reports table for integration
-- This allows bug reports to reference NFC projects
ALTER TABLE bug_reports ADD COLUMN nfc_project_id UUID REFERENCES linklist_nfc_projects(id);

-- Create index for the foreign key
CREATE INDEX idx_bug_reports_nfc_project_id ON bug_reports(nfc_project_id);

-- Create a function to get project statistics
CREATE OR REPLACE FUNCTION get_nfc_project_stats()
RETURNS TABLE (
    total_projects BIGINT,
    active_projects BIGINT,
    completed_projects BIGINT,
    draft_projects BIGINT,
    total_tags BIGINT,
    avg_project_duration NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_projects,
        COUNT(*) FILTER (WHERE project_status = 'Active') as active_projects,
        COUNT(*) FILTER (WHERE project_status = 'Completed') as completed_projects,
        COUNT(*) FILTER (WHERE project_status = 'Draft') as draft_projects,
        COALESCE(SUM(tag_quantity), 0) as total_tags,
        AVG(EXTRACT(EPOCH FROM (actual_completion_date - created_at::date))/86400) as avg_project_duration
    FROM linklist_nfc_projects;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get projects by status
CREATE OR REPLACE FUNCTION get_nfc_projects_by_status(status_filter VARCHAR DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    project_name VARCHAR,
    project_status VARCHAR,
    project_priority VARCHAR,
    assigned_to VARCHAR,
    client_name VARCHAR,
    tag_quantity INTEGER,
    estimated_completion_date DATE,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    IF status_filter IS NULL THEN
        RETURN QUERY
        SELECT p.id, p.project_name, p.project_status, p.project_priority,
               p.assigned_to, p.client_name, p.tag_quantity,
               p.estimated_completion_date, p.created_at
        FROM linklist_nfc_projects p
        ORDER BY p.created_at DESC;
    ELSE
        RETURN QUERY
        SELECT p.id, p.project_name, p.project_status, p.project_priority,
               p.assigned_to, p.client_name, p.tag_quantity,
               p.estimated_completion_date, p.created_at
        FROM linklist_nfc_projects p
        WHERE p.project_status = status_filter
        ORDER BY p.created_at DESC;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to search projects
CREATE OR REPLACE FUNCTION search_nfc_projects(search_term VARCHAR)
RETURNS TABLE (
    id UUID,
    project_name VARCHAR,
    project_description TEXT,
    project_status VARCHAR,
    client_name VARCHAR,
    assigned_to VARCHAR,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.project_name, p.project_description, p.project_status,
           p.client_name, p.assigned_to, p.created_at
    FROM linklist_nfc_projects p
    WHERE
        p.project_name ILIKE '%' || search_term || '%' OR
        p.project_description ILIKE '%' || search_term || '%' OR
        p.client_name ILIKE '%' || search_term || '%' OR
        p.assigned_to ILIKE '%' || search_term || '%'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing (optional)
INSERT INTO linklist_nfc_projects (
    project_name,
    project_description,
    nfc_tag_type,
    nfc_data_format,
    nfc_payload,
    project_status,
    project_priority,
    created_by,
    assigned_to,
    client_name,
    deployment_location,
    tag_quantity,
    estimated_completion_date,
    project_budget,
    notes
) VALUES
(
    'Smart Business Cards - TechCorp',
    'Digital business cards with NFC technology for TechCorp executives',
    'NTAG213',
    'vCard',
    '{"name": "John Doe", "title": "CEO", "company": "TechCorp", "email": "john@techcorp.com", "phone": "+1234567890"}',
    'Active',
    'High',
    'project.manager@linklist.com',
    'developer@linklist.com',
    'TechCorp Inc.',
    'Corporate Headquarters',
    50,
    CURRENT_DATE + INTERVAL '30 days',
    5000.00,
    'Premium NFC business cards with custom branding'
),
(
    'Restaurant Menu QR/NFC Tags',
    'Contactless menu access for restaurant chain',
    'NTAG215',
    'URL',
    '{"url": "https://menu.restaurant.com", "title": "Digital Menu"}',
    'Draft',
    'Medium',
    'project.manager@linklist.com',
    'developer2@linklist.com',
    'Restaurant Chain LLC',
    'Multiple Locations',
    200,
    CURRENT_DATE + INTERVAL '45 days',
    3000.00,
    'Waterproof NFC tags for table placement'
);

-- Add comments to the table and columns for documentation
COMMENT ON TABLE linklist_nfc_projects IS 'Stores comprehensive information about NFC projects for the LinkList platform';
COMMENT ON COLUMN linklist_nfc_projects.id IS 'Unique identifier for the NFC project';
COMMENT ON COLUMN linklist_nfc_projects.project_name IS 'Human-readable name for the project';
COMMENT ON COLUMN linklist_nfc_projects.nfc_tag_type IS 'Type of NFC tag being used (NTAG213, NTAG215, etc.)';
COMMENT ON COLUMN linklist_nfc_projects.nfc_data_format IS 'Format of data stored on NFC tag (URL, vCard, etc.)';
COMMENT ON COLUMN linklist_nfc_projects.nfc_payload IS 'JSON structure containing the actual NFC data';
COMMENT ON COLUMN linklist_nfc_projects.project_status IS 'Current status of the project';
COMMENT ON COLUMN linklist_nfc_projects.tag_quantity IS 'Number of NFC tags required for this project';
COMMENT ON COLUMN linklist_nfc_projects.project_budget IS 'Allocated budget for the project';
COMMENT ON COLUMN linklist_nfc_projects.project_cost IS 'Actual cost incurred for the project';