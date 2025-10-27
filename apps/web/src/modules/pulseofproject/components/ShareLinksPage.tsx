import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Copy, CheckCircle, ExternalLink, Star,
  Calendar, Users, TrendingUp, Filter, Search,
  Download, Mail, QrCode, FileSpreadsheet,
  CheckSquare, Square, BarChart3, X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Papa from 'papaparse';
import { projects, Project } from '../data/projects';

// Generate share token if not exists
const generateShareToken = (project: Project): string => {
  if (project.shareToken) return project.shareToken;

  const shortName = project.id.substring(0, 10);
  const randomChars = Math.random().toString(36).substring(2, 7);
  return `${shortName}-${randomChars}`;
};

// Get the base URL for sharing (update this with your actual domain)
const getShareUrl = (shareToken: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/client/${shareToken}`;
};

// Track link analytics
const trackLinkClick = (projectId: string, action: string) => {
  const analytics = {
    projectId,
    action,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };

  // Store in localStorage for now (can be replaced with API call)
  const existing = JSON.parse(localStorage.getItem('sharelink-analytics') || '[]');
  existing.push(analytics);
  localStorage.setItem('sharelink-analytics', JSON.stringify(existing));

  console.log('📊 Analytics tracked:', analytics);
};

const ShareLinksPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [projectsWithTokens, setProjectsWithTokens] = useState<Array<Project & { generatedToken: string }>>([]);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [showQRModal, setShowQRModal] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    // Generate tokens for all projects
    const enhanced = projects.map(project => ({
      ...project,
      generatedToken: generateShareToken(project)
    }));
    setProjectsWithTokens(enhanced);
  }, []);

  const filteredProjects = projectsWithTokens.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === null || project.priority === selectedPriority;
    const matchesStatus = selectedStatus === null || project.status === selectedStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const copyToClipboard = async (shareToken: string, projectId: string) => {
    const shareUrl = getShareUrl(shareToken);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToken(shareToken);
      setTimeout(() => setCopiedToken(null), 2000);
      trackLinkClick(projectId, 'copy');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const data = filteredProjects.map(p => ({
      'Project Name': p.name,
      'Client': p.client,
      'Status': p.status,
      'Priority': `P${p.priority}`,
      'Progress': `${p.progress}%`,
      'Deadline': new Date(p.deadline).toLocaleDateString(),
      'Category': p.category,
      'Team Size': p.team,
      'Share Link': getShareUrl(p.generatedToken),
      'Live URL': p.url || 'N/A'
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `project-sharelinks-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    trackLinkClick('all', 'export-csv');
  };

  // Export to Excel-friendly format
  const exportToExcel = () => {
    const data = filteredProjects.map(p => ({
      'Project Name': p.name,
      'Client': p.client,
      'Status': p.status,
      'Priority': p.priority,
      'Progress %': p.progress,
      'Deadline': new Date(p.deadline).toLocaleDateString(),
      'Category': p.category,
      'Team Size': p.team,
      'Description': p.description || '',
      'Share Link': getShareUrl(p.generatedToken),
      'Live URL': p.url || ''
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `project-sharelinks-${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    trackLinkClick('all', 'export-excel');
  };

  // Bulk copy links
  const copyBulkLinks = async () => {
    const selectedProjectsList = filteredProjects.filter(p => selectedProjects.has(p.id));
    const links = selectedProjectsList.map(p =>
      `${p.name}: ${getShareUrl(p.generatedToken)}`
    ).join('\n');

    try {
      await navigator.clipboard.writeText(links);
      alert(`Copied ${selectedProjects.size} project links!`);
      trackLinkClick('bulk', 'copy-multiple');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Toggle project selection
  const toggleProjectSelection = (projectId: string) => {
    const newSelection = new Set(selectedProjects);
    if (newSelection.has(projectId)) {
      newSelection.delete(projectId);
    } else {
      newSelection.add(projectId);
    }
    setSelectedProjects(newSelection);
  };

  // Select all filtered projects
  const selectAll = () => {
    if (selectedProjects.size === filteredProjects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(filteredProjects.map(p => p.id)));
    }
  };

  // Email share link
  const emailShareLink = (project: Project & { generatedToken: string }) => {
    const shareUrl = getShareUrl(project.generatedToken);
    const subject = encodeURIComponent(`Project Portal Access: ${project.name}`);
    const body = encodeURIComponent(`Hi,

Here's your access link for the ${project.name} project portal:

${shareUrl}

Project Details:
- Client: ${project.client}
- Status: ${project.status}
- Progress: ${project.progress}%
- Deadline: ${new Date(project.deadline).toLocaleDateString()}

You can track project progress, view milestones, and collaborate with the team through this portal.

Best regards,
BettRoi Team`);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    trackLinkClick(project.id, 'email');
  };

  // Get analytics summary
  const getAnalytics = () => {
    const data = JSON.parse(localStorage.getItem('sharelink-analytics') || '[]');
    return data;
  };

  const getPriorityBadge = (priority: number) => {
    const colors = {
      1: 'bg-red-100 text-red-700 border-red-300',
      2: 'bg-orange-100 text-orange-700 border-orange-300',
      3: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      4: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[priority as keyof typeof colors] || colors[4];
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-700 border-green-300',
      'planning': 'bg-blue-100 text-blue-700 border-blue-300',
      'completed': 'bg-purple-100 text-purple-700 border-purple-300',
      'on-hold': 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[status as keyof typeof colors] || colors['on-hold'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Project Share Links</h1>
                <p className="text-gray-500 mt-1">All client portal access links for BettRoi projects</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Export CSV</span>
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="text-sm">Export Excel</span>
              </button>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Analytics</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="text-blue-600 text-sm font-medium">Total Projects</div>
              <div className="text-3xl font-bold text-blue-900">{projects.length}</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="text-green-600 text-sm font-medium">Active Projects</div>
              <div className="text-3xl font-bold text-green-900">
                {projects.filter(p => p.status === 'active').length}
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="text-orange-600 text-sm font-medium">Priority 1</div>
              <div className="text-3xl font-bold text-orange-900">
                {projects.filter(p => p.priority === 1).length}
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="text-purple-600 text-sm font-medium">Selected</div>
              <div className="text-3xl font-bold text-purple-900">{selectedProjects.size}</div>
            </div>
          </div>
        </motion.div>

        {/* Filters & Bulk Actions */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects or clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              {[1, 2, 3, 4].map(priority => (
                <button
                  key={priority}
                  onClick={() => setSelectedPriority(selectedPriority === priority ? null : priority)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedPriority === priority
                      ? getPriorityBadge(priority)
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  P{priority}
                </button>
              ))}
            </div>

            <select
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {filteredProjects.length > 0 && (
            <div className="flex items-center gap-3 pt-4 border-t">
              <button
                onClick={selectAll}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {selectedProjects.size === filteredProjects.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>Select All ({filteredProjects.length})</span>
              </button>

              {selectedProjects.size > 0 && (
                <>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={copyBulkLinks}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy {selectedProjects.size} Links
                  </button>
                  <button
                    onClick={() => setSelectedProjects(new Set())}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm"
                  >
                    Clear Selection
                  </button>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* Projects Grid */}
        <div className="grid gap-4">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 ${
                selectedProjects.has(project.id) ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Selection Checkbox */}
                  <button
                    onClick={() => toggleProjectSelection(project.id)}
                    className="mt-1"
                  >
                    {selectedProjects.has(project.id) ? (
                      <CheckSquare className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {project.starred && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                      <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                      <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getPriorityBadge(project.priority)}`}>
                        Priority {project.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusBadge(project.status)}`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{project.client}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>{project.progress}% Complete</span>
                      </div>
                      <div className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {project.category}
                      </div>
                    </div>

                    {project.description && (
                      <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                    )}

                    <div className="flex items-center gap-3">
                      {/* Share Link */}
                      <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                        <Share2 className="w-4 h-4 text-gray-500" />
                        <code className="flex-1 text-sm text-gray-700 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                          {getShareUrl(project.generatedToken)}
                        </code>
                        <button
                          onClick={() => copyToClipboard(project.generatedToken, project.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
                        >
                          {copiedToken === project.generatedToken ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span className="text-xs">Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* QR Code Button */}
                      <button
                        onClick={() => setShowQRModal(project.id)}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        title="Show QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                        <span className="text-xs">QR</span>
                      </button>

                      {/* Email Button */}
                      <button
                        onClick={() => emailShareLink(project)}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        title="Email Share Link"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="text-xs">Email</span>
                      </button>

                      {/* External Link if exists */}
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                          onClick={() => trackLinkClick(project.id, 'visit-site')}
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-xs">Visit</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">No projects found matching your filters</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>BettRoi Project Management System</p>
          <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const project = projectsWithTokens.find(p => p.id === showQRModal);
                if (!project) return null;
                const shareUrl = getShareUrl(project.generatedToken);

                return (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-900">QR Code</h3>
                      <button
                        onClick={() => setShowQRModal(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">{project.name}</h4>
                      <p className="text-sm text-gray-600">{project.client}</p>
                    </div>

                    <div className="flex justify-center mb-6 p-4 bg-white border-2 border-gray-200 rounded-xl">
                      <QRCodeSVG
                        value={shareUrl}
                        size={256}
                        level="H"
                        includeMargin={true}
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-4 break-all">{shareUrl}</p>
                      <button
                        onClick={() => {
                          const svg = document.querySelector('svg');
                          if (svg) {
                            const svgData = new XMLSerializer().serializeToString(svg);
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            const img = new Image();
                            img.onload = () => {
                              canvas.width = img.width;
                              canvas.height = img.height;
                              ctx?.drawImage(img, 0, 0);
                              const pngFile = canvas.toDataURL('image/png');
                              const downloadLink = document.createElement('a');
                              downloadLink.download = `qr-${project.id}.png`;
                              downloadLink.href = pngFile;
                              downloadLink.click();
                            };
                            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                          }
                          trackLinkClick(project.id, 'download-qr');
                        }}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                      >
                        Download QR Code
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Modal */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAnalytics(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Share Link Analytics</h3>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {getAnalytics().length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No analytics data yet. Start sharing links!</p>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-blue-600 text-sm font-medium">Total Actions</div>
                        <div className="text-2xl font-bold text-blue-900">{getAnalytics().length}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-green-600 text-sm font-medium">Copies</div>
                        <div className="text-2xl font-bold text-green-900">
                          {getAnalytics().filter((a: any) => a.action === 'copy').length}
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-purple-600 text-sm font-medium">Emails</div>
                        <div className="text-2xl font-bold text-purple-900">
                          {getAnalytics().filter((a: any) => a.action === 'email').length}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {getAnalytics().slice(-20).reverse().map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">{item.action}</span>
                            <span className="text-gray-500 text-sm ml-2">{item.projectId}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareLinksPage;
