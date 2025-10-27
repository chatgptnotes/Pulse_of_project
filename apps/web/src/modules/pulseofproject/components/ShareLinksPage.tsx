import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Share2, Copy, CheckCircle, ExternalLink, Star,
  Calendar, Users, TrendingUp, Filter, Search
} from 'lucide-react';
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

const ShareLinksPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [projectsWithTokens, setProjectsWithTokens] = useState<Array<Project & { generatedToken: string }>>([]);

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

  const copyToClipboard = async (shareToken: string) => {
    const shareUrl = getShareUrl(shareToken);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToken(shareToken);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
              <Share2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Project Share Links</h1>
              <p className="text-gray-500 mt-1">All client portal access links for BettRoi projects</p>
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
              <div className="text-purple-600 text-sm font-medium">With Share Links</div>
              <div className="text-3xl font-bold text-purple-900">{projectsWithTokens.length}</div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <div className="flex items-center gap-4">
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
        </motion.div>

        {/* Projects Grid */}
        <div className="grid gap-4">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
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

                  <div className="flex items-center gap-4">
                    {/* Share Link */}
                    <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                      <Share2 className="w-4 h-4 text-gray-500" />
                      <code className="flex-1 text-sm text-gray-700 font-mono">
                        {getShareUrl(project.generatedToken)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(project.generatedToken)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
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

                    {/* External Link if exists */}
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-xs">Visit Site</span>
                      </a>
                    )}
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
    </div>
  );
};

export default ShareLinksPage;
