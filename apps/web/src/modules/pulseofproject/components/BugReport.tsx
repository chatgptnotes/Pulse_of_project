import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bug, AlertTriangle, AlertCircle, Info, Plus, Download, Upload,
  Trash2, Edit2, Check, X, Image as ImageIcon, Calendar, Filter,
  ChevronDown, ChevronUp, ExternalLink, Save, FileText, Lightbulb, Wrench, Megaphone, Sparkles
} from 'lucide-react';
import bugTrackingService from '../../../services/bugTrackingService';
import teamMemberService from '../../../services/teamMemberService';

interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role?: string;
  team_type: 'client' | 'development';
}

interface Bug {
  id: string;
  sno: number;
  date: string;
  type: 'bug' | 'suggestion' | 'enhancement' | 'announcement' | 'feature_request';
  module: string;
  screen: string;
  snag: string;
  severity: 'P1' | 'P2' | 'P3';
  image_url?: string;
  comments: string;
  status: 'Open' | 'In Progress' | 'Testing' | 'Verified' | 'Closed' | 'Reopened';
  testing_status: 'Pending' | 'Pass' | 'Fail' | 'Blocked';
  assigned_to?: string; // UUID
  reported_by?: string; // UUID
  reporter?: TeamMember; // Populated from join
  assignee?: TeamMember; // Populated from join
  project_name?: string;
  project_version?: string;
  created_at?: string;
  updated_at?: string;
}

interface BugReportProps {
  projectName?: string;
  version?: string;
  onBugsUpdate?: (bugs: Bug[]) => void;
}

const BugReport: React.FC<BugReportProps> = ({
  projectName = 'linklist',
  version = 'v1.0.0',
  onBugsUpdate
}) => {
  // UPDATED: Now using actual project names for complete bug isolation
  // Each project gets its own bug list stored with its actual ID
  const getDBProjectName = (projectId: string): string => {
    if (!projectId || projectId === '') {
      console.warn('⚠️ No project ID provided, using default');
      return 'linklist';
    }

    console.log('✅ Using actual project name:', projectId);
    return projectId;
  };

  // FIXED: Make dbProjectName reactive to projectName changes using useMemo
  const dbProjectName = React.useMemo(() => {
    const dbName = getDBProjectName(projectName);
    console.log('💾 Database project name recalculated:', dbName, 'for projectName:', projectName);
    return dbName;
  }, [projectName]);

  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBug, setEditingBug] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Bug | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterReporter, setFilterReporter] = useState<string>('all');
  const [expandedView, setExpandedView] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);

  const [newBug, setNewBug] = useState<Partial<Bug>>({
    date: new Date().toISOString().split('T')[0],
    type: 'bug',
    module: 'E-commerce',
    screen: '',
    snag: '',
    severity: 'P3',
    comments: '',
    status: 'Open',
    testing_status: 'Pending',
    project_name: projectName,
    project_version: version,
    reported_by: undefined,
    assigned_to: undefined
  });

  // Load team members on mount
  useEffect(() => {
    loadTeamMembers();
  }, [dbProjectName]);

  // Load bugs from database on component mount
  // FIXED: Added dbProjectName to dependency array to fix closure issue
  useEffect(() => {
    loadBugs();
  }, [projectName, dbProjectName]);

  const loadTeamMembers = async () => {
    try {
      const members = await teamMemberService.getAllMembers(dbProjectName);
      setTeamMembers(members);
      console.log('✅ Loaded', members.length, 'team members');
    } catch (error) {
      console.error('❌ Error loading team members:', error);
    }
  };

  const loadBugs = async () => {
    try {
      setLoading(true);
      console.log('🐛 Loading bugs for project:', projectName, '(DB name:', dbProjectName + ')');

      if (!projectName || projectName === '') {
        console.warn('⚠️ No project name provided, skipping bug load');
        setBugs([]);
        onBugsUpdate?.([]);
        return;
      }

      // FIXED: Use simple getBugReports instead of getIssuesWithTeamMembers
      // The foreign key relationships don't exist yet, so we fetch bugs without joins
      const fetchedBugs = await bugTrackingService.getBugReports(dbProjectName);
      console.log(`✅ Loaded ${fetchedBugs.length} issues for ${projectName} (${dbProjectName})`);
      setBugs(fetchedBugs);
      onBugsUpdate?.(fetchedBugs);
    } catch (error) {
      console.error('Error loading bugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const modules = ['E-commerce', 'Profile Builder', 'Profile Viewer', 'Authentication', 'Dashboard', 'Settings'];
  const statuses = ['Open', 'In Progress', 'Testing', 'Verified', 'Closed', 'Reopened'];
  const testingStatuses = ['Pending', 'Pass', 'Fail', 'Blocked'];

  const issueTypes = [
    { value: 'bug', label: 'Bug', icon: Bug, color: 'red' },
    { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'blue' },
    { value: 'enhancement', label: 'Enhancement', icon: Wrench, color: 'green' },
    { value: 'announcement', label: 'Announcement', icon: Megaphone, color: 'orange' },
    { value: 'feature_request', label: 'Feature Request', icon: Sparkles, color: 'purple' }
  ];

  const getTypeConfig = (type: string) => {
    return issueTypes.find(t => t.value === type) || issueTypes[0];
  };

  const getTypeColor = (type: string) => {
    const config = getTypeConfig(type);
    const colors = {
      red: 'bg-red-100 text-red-700 border-red-300',
      blue: 'bg-blue-100 text-blue-700 border-blue-300',
      green: 'bg-green-100 text-green-700 border-green-300',
      orange: 'bg-orange-100 text-orange-700 border-orange-300',
      purple: 'bg-purple-100 text-purple-700 border-purple-300'
    };
    return colors[config.color as keyof typeof colors] || colors.red;
  };

  const getTypeIcon = (type: string) => {
    const config = getTypeConfig(type);
    const Icon = config.icon;
    return <Icon className="w-4 h-4" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'P1': return 'text-red-600 bg-red-100 border-red-300';
      case 'P2': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'P3': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'P1': return <AlertTriangle className="w-4 h-4" />;
      case 'P2': return <AlertCircle className="w-4 h-4" />;
      case 'P3': return <Info className="w-4 h-4" />;
      default: return <Bug className="w-4 h-4" />;
    }
  };

  const getSeverityDescription = (severity: string) => {
    switch (severity) {
      case 'P1': return 'Blocking progress of main customer journey';
      case 'P2': return 'Significant impact on customer experience';
      case 'P3': return 'UI/UX improvements (color, font, layout, text)';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Testing': return 'bg-purple-100 text-purple-700';
      case 'Verified': return 'bg-green-100 text-green-700';
      case 'Closed': return 'bg-gray-100 text-gray-700';
      case 'Reopened': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTestingStatusColor = (status: string) => {
    switch (status) {
      case 'Pass': return 'bg-green-100 text-green-700';
      case 'Fail': return 'bg-red-100 text-red-700';
      case 'Blocked': return 'bg-orange-100 text-orange-700';
      case 'Pending': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAddBug = async () => {
    if (!newBug.snag || !newBug.screen) {
      alert('Please fill in required fields: Screen and Snag description');
      return;
    }

    try {
      setSaving(true);
      console.log('🐛 Adding bug for project:', projectName, '(DB name:', dbProjectName + ')');

      const bugData = {
        project_name: dbProjectName,
        project_version: version,
        date: newBug.date || new Date().toISOString().split('T')[0],
        type: newBug.type || 'bug',
        module: newBug.module || 'E-commerce',
        screen: newBug.screen || '',
        snag: newBug.snag || '',
        severity: newBug.severity || 'P3',
        image_url: newBug.image_url,
        comments: newBug.comments || '',
        status: newBug.status || 'Open',
        testing_status: newBug.testing_status || 'Pending'
      };

      // Only add team member fields if they have values
      if (newBug.reported_by) {
        bugData.reported_by = newBug.reported_by;
      }
      if (newBug.assigned_to) {
        bugData.assigned_to = newBug.assigned_to;
      }

      console.log('📝 Bug data to save:', bugData);

      const savedBug = await bugTrackingService.createBugReport(bugData);

      // Reload bugs to get updated list with correct SNO
      await loadBugs();

      // Reset form
      setNewBug({
        date: new Date().toISOString().split('T')[0],
        type: 'bug',
        module: 'E-commerce',
        screen: '',
        snag: '',
        severity: 'P3',
        comments: '',
        status: 'Open',
        testing_status: 'Pending',
        project_name: projectName,
        project_version: version,
        reported_by: undefined,
        assigned_to: undefined
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('❌ Error saving bug:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`Failed to save bug report: ${errorMessage}\n\nPlease check the browser console for more details.`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBug = async (bugId: string, updates: Partial<Bug>) => {
    try {
      await bugTrackingService.updateBugReport(bugId, updates);
      setBugs(bugs.map(bug =>
        bug.id === bugId ? { ...bug, ...updates } : bug
      ));
      setEditingBug(null);
    } catch (error) {
      console.error('Error updating bug:', error);
      alert('Failed to update bug report. Please try again.');
    }
  };

  const handleDeleteBug = async (bugId: string) => {
    if (confirm('Are you sure you want to delete this bug report?')) {
      try {
        await bugTrackingService.deleteBugReport(bugId);
        setBugs(bugs.filter(bug => bug.id !== bugId));
      } catch (error) {
        console.error('Error deleting bug:', error);
        alert('Failed to delete bug report. Please try again.');
      }
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  const openEditModal = (bug: Bug) => {
    setEditFormData({ ...bug });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (editFormData) {
      try {
        setSaving(true);
        // Update bug in database
        await bugTrackingService.updateBugReport(editFormData.id, editFormData);

        // Update local state
        setBugs(bugs.map(bug =>
          bug.id === editFormData.id ? editFormData : bug
        ));

        setShowEditModal(false);
        setEditFormData(null);
      } catch (error) {
        console.error('Error saving bug:', error);
        alert('Failed to save changes. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, forNewBug: boolean = true) => {
    const file = e.target.files?.[0];
    if (file) {
      // For new bugs, store the file temporarily for upload after bug creation
      if (forNewBug) {
        // Store file for later upload
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewBug({ ...newBug, image_url: reader.result as string });
        };
        reader.readAsDataURL(file);
      } else {
        // For existing bugs, upload immediately
        try {
          setSaving(true);
          // Note: This would need the bug ID, so we'll implement this in the edit modal
          console.log('Image upload for existing bug - implement in edit modal');
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
        } finally {
          setSaving(false);
        }
      }
    }
  };

  const exportBugs = () => {
    const dataStr = JSON.stringify(bugs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `bug-report-${projectName}-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importBugs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setBugs(imported);
          alert('Bug reports imported successfully!');
        } catch (error) {
          alert('Failed to import bug reports. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredBugs = bugs.filter(bug => {
    if (filterSeverity !== 'all' && bug.severity !== filterSeverity) return false;
    if (filterModule !== 'all' && bug.module !== filterModule) return false;
    if (filterStatus !== 'all' && bug.status !== filterStatus) return false;
    if (filterType !== 'all' && bug.type !== filterType) return false;
    if (filterReporter !== 'all' && bug.reported_by !== filterReporter) return false;
    return true;
  });

  const bugStats = {
    total: bugs.length,
    open: bugs.filter(b => b.status === 'Open').length,
    p1: bugs.filter(b => b.severity === 'P1').length,
    p2: bugs.filter(b => b.severity === 'P2').length,
    p3: bugs.filter(b => b.severity === 'P3').length,
    passed: bugs.filter(b => b.testing_status === 'Pass').length,
    failed: bugs.filter(b => b.testing_status === 'Fail').length
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bug className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Issues & Suggestions</h2>
              <p className="text-red-100">
                {projectName} - {version} | Track bugs, suggestions, enhancements & more
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpandedView(!expandedView)}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            {expandedView ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-7 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-red-100 text-xs">Total Bugs</p>
            <p className="text-white text-2xl font-bold">{bugStats.total}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-red-100 text-xs">Open</p>
            <p className="text-white text-2xl font-bold">{bugStats.open}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-red-100 text-xs">P1 Critical</p>
            <p className="text-white text-2xl font-bold">{bugStats.p1}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-red-100 text-xs">P2 Major</p>
            <p className="text-white text-2xl font-bold">{bugStats.p2}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-red-100 text-xs">P3 Minor</p>
            <p className="text-white text-2xl font-bold">{bugStats.p3}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-red-100 text-xs">Passed</p>
            <p className="text-white text-2xl font-bold">{bugStats.passed}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-red-100 text-xs">Failed</p>
            <p className="text-white text-2xl font-bold">{bugStats.failed}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expandedView && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Filters */}
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Severities</option>
                    <option value="P1">P1 - Critical</option>
                    <option value="P2">P2 - Major</option>
                    <option value="P3">P3 - Minor</option>
                  </select>

                  <select
                    value={filterModule}
                    onChange={(e) => setFilterModule(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Modules</option>
                    {modules.map(mod => (
                      <option key={mod} value={mod}>{mod}</option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Statuses</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Types</option>
                    {issueTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>

                  <select
                    value={filterReporter}
                    onChange={(e) => setFilterReporter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Reporters</option>
                    <optgroup label="Client Team">
                      {teamMembers.filter(m => m.team_type === 'client').map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Development Team">
                      {teamMembers.filter(m => m.team_type === 'development').map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Issue
                  </button>

                  <button
                    onClick={exportBugs}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>

                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Import
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={importBugs}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Severity Legend */}
              <div className="flex items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded border text-red-600 bg-red-100 border-red-300">P1</span>
                  <span className="text-gray-600">Blocking customer journey</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded border text-orange-600 bg-orange-100 border-orange-300">P2</span>
                  <span className="text-gray-600">Significant UX impact</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded border text-yellow-600 bg-yellow-100 border-yellow-300">P3</span>
                  <span className="text-gray-600">UI improvements</span>
                </div>
              </div>
            </div>

            {/* Add Bug Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-blue-50 border-b border-blue-200"
                >
                  <h3 className="text-lg font-semibold mb-4">Add New Issue</h3>

                  {/* First row: Type, Reported By, Assigned To */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                      <select
                        value={newBug.type}
                        onChange={(e) => setNewBug({ ...newBug, type: e.target.value as Bug['type'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {issueTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                      <select
                        value={newBug.reported_by || ''}
                        onChange={(e) => setNewBug({ ...newBug, reported_by: e.target.value || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Reporter</option>
                        <optgroup label="Client Team">
                          {teamMembers.filter(m => m.team_type === 'client').map(member => (
                            <option key={member.id} value={member.id}>{member.name} - {member.role}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Development Team">
                          {teamMembers.filter(m => m.team_type === 'development').map(member => (
                            <option key={member.id} value={member.id}>{member.name} - {member.role}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                      <select
                        value={newBug.assigned_to || ''}
                        onChange={(e) => setNewBug({ ...newBug, assigned_to: e.target.value || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Unassigned</option>
                        <optgroup label="Development Team">
                          {teamMembers.filter(m => m.team_type === 'development').map(member => (
                            <option key={member.id} value={member.id}>{member.name} - {member.role}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* Second row: Date, Module, Screen, Severity */}
                  <div className="grid grid-cols-4 gap-4">
                    <input
                      type="date"
                      value={newBug.date}
                      onChange={(e) => setNewBug({ ...newBug, date: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <select
                      value={newBug.module}
                      onChange={(e) => setNewBug({ ...newBug, module: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {modules.map(mod => (
                        <option key={mod} value={mod}>{mod}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Screen/Page *"
                      value={newBug.screen}
                      onChange={(e) => setNewBug({ ...newBug, screen: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <select
                      value={newBug.severity}
                      onChange={(e) => setNewBug({ ...newBug, severity: e.target.value as 'P1' | 'P2' | 'P3' })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="P1">P1 - Critical</option>
                      <option value="P2">P2 - Major</option>
                      <option value="P3">P3 - Minor</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <textarea
                      placeholder="Bug/Snag Description *"
                      value={newBug.snag}
                      onChange={(e) => setNewBug({ ...newBug, snag: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-24"
                    />

                    <textarea
                      placeholder="Comments/Additional Info"
                      value={newBug.comments}
                      onChange={(e) => setNewBug({ ...newBug, comments: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-24"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white cursor-pointer">
                        <ImageIcon className="w-4 h-4" />
                        Upload Screenshot
                        <input
                          ref={imageUploadRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, true)}
                          className="hidden"
                        />
                      </label>
                      {newBug.image_url && (
                        <span className="text-sm text-green-600">Image uploaded</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setNewBug({
                            date: new Date().toISOString().split('T')[0],
                            type: 'bug',
                            module: 'E-commerce',
                            screen: '',
                            snag: '',
                            severity: 'P3',
                            comments: '',
                            status: 'Open',
                            testing_status: 'Pending',
                            project_name: projectName,
                            project_version: version,
                            reported_by: undefined,
                            assigned_to: undefined
                          });
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddBug}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Bug Report'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bug Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <span className="ml-2 text-gray-600">Loading bugs...</span>
                </div>
              ) : (
                <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Screen</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reporter</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBugs.map((bug) => (
                    <tr key={bug.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{bug.sno}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(bug.type || 'bug')}`}>
                          {getTypeIcon(bug.type || 'bug')}
                          {getTypeConfig(bug.type || 'bug').label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{bug.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{bug.module}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{bug.screen}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={bug.snag}>{bug.snag}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {bug.image_url ? (
                          <button
                            onClick={() => handleImageClick(bug.image_url!)}
                            className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                            title="View screenshot"
                          >
                            <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          </button>
                        ) : (
                          <span className="text-gray-300" title="No image">
                            <ImageIcon className="w-5 h-5 mx-auto" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(bug.severity)}`}>
                          {getSeverityIcon(bug.severity)}
                          {bug.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {bug.reporter ? (
                          <div>
                            <div className="font-medium text-gray-900">{bug.reporter.name}</div>
                            <div className="text-xs text-gray-500">{bug.reporter.team_type === 'client' ? 'Client' : 'Dev'} • {bug.reporter.role}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {bug.assignee ? (
                          <div>
                            <div className="font-medium text-gray-900">{bug.assignee.name}</div>
                            <div className="text-xs text-gray-500">{bug.assignee.role}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingBug === bug.id ? (
                          <select
                            value={bug.status}
                            onChange={(e) => handleUpdateBug(bug.id, { status: e.target.value as Bug['status'] })}
                            className="text-xs px-2 py-1 rounded border"
                          >
                            {statuses.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bug.status)}`}>
                            {bug.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {editingBug === bug.id ? (
                            <>
                              <button
                                onClick={() => setEditingBug(null)}
                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingBug(null)}
                                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => openEditModal(bug)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                title="Edit Bug"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBug(bug.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Delete Bug"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              )}

              {!loading && filteredBugs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Bug className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No bugs found matching your filters</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editFormData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Edit Bug Report</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
                    <select
                      value={editFormData.module}
                      onChange={(e) => setEditFormData({ ...editFormData, module: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {modules.map(mod => (
                        <option key={mod} value={mod}>{mod}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Screen/Page</label>
                    <input
                      type="text"
                      value={editFormData.screen}
                      onChange={(e) => setEditFormData({ ...editFormData, screen: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                    <select
                      value={editFormData.severity}
                      onChange={(e) => setEditFormData({ ...editFormData, severity: e.target.value as 'P1' | 'P2' | 'P3' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="P1">P1 - Critical (Blocking)</option>
                      <option value="P2">P2 - Major (Significant Impact)</option>
                      <option value="P3">P3 - Minor (UI/UX)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bug/Snag Description</label>
                  <textarea
                    value={editFormData.snag}
                    onChange={(e) => setEditFormData({ ...editFormData, snag: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                  <textarea
                    value={editFormData.comments}
                    onChange={(e) => setEditFormData({ ...editFormData, comments: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-20"
                  />
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Screenshot</label>
                  <div className="flex items-start gap-4">
                    {/* Image Preview */}
                    {editFormData.image_url && (
                      <div className="relative group">
                        <img
                          src={editFormData.image_url}
                          alt="Bug screenshot"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          onClick={() => setEditFormData({ ...editFormData, image_url: '' })}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Upload Button */}
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors">
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500 text-center px-2">
                        {editFormData.image_url ? 'Change Image' : 'Upload Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditFormData({ ...editFormData, image_url: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as Bug['status'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Testing Status</label>
                    <select
                      value={editFormData.testing_status}
                      onChange={(e) => setEditFormData({ ...editFormData, testing_status: e.target.value as Bug['testing_status'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {testingStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {isImageModalOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>

              {/* Image container */}
              <div className="flex items-center justify-center p-4">
                <img
                  src={selectedImage}
                  alt="Bug screenshot"
                  className="max-w-full max-h-[85vh] object-contain rounded"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BugReport;