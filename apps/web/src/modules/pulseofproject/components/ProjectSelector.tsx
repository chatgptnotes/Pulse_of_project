import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown, Plus, Search, Folder, Star,
  Calendar, Users, TrendingUp, Filter,
  AlertCircle, CheckCircle, Clock, Pause
} from 'lucide-react';
import { projects, categories, getProjectsByPriority } from '../data/projects';
import { useAuth } from '../../../contexts/AuthContext';
import userProjectsService from '../../../services/userProjectsService';

interface ProjectSelectorProps {
  selectedProject: string | null;
  onProjectChange: (projectId: string) => void;
  clientMode?: boolean;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  selectedProject,
  onProjectChange,
  clientMode = false
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [userAssignedProjects, setUserAssignedProjects] = useState<string[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Fetch user's assigned projects if not super_admin
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!user || user.role === 'super_admin') {
        // Super admin sees all projects
        console.log('👑 Super admin - showing all projects');
        setUserAssignedProjects(projects.map(p => p.id));
        return;
      }

      try {
        setIsLoadingProjects(true);
        console.log('🔐 Fetching projects for user:', user.id);

        const userProjects = await userProjectsService.getUserProjects(user.id);
        console.log('📦 User projects from DB:', userProjects);

        // Map database project names to frontend IDs
        const mappedProjects = userProjectsService.mapDatabaseProjectsToFrontend(userProjects);
        const projectIds = mappedProjects.map((p: any) => p.frontendId);

        console.log('✅ User has access to projects:', projectIds);
        setUserAssignedProjects(projectIds);
      } catch (error) {
        console.error('❌ Error fetching user projects:', error);
        // On error, show no projects (safe default)
        setUserAssignedProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchUserProjects();
  }, [user]);

  // Filter projects based on user permissions
  const availableProjects = user?.role === 'super_admin'
    ? projects  // Super admin sees all projects
    : projects.filter(p => userAssignedProjects.includes(p.id));  // Regular users see only assigned projects

  // Auto-select first accessible project for regular users
  useEffect(() => {
    if (clientMode) return;
    if (isLoadingProjects) return;
    if (!availableProjects.length) return;

    const selectedIsAccessible = selectedProject
      ? availableProjects.some(project => project.id === selectedProject)
      : false;

    if (!selectedIsAccessible) {
      const defaultProjectId = availableProjects[0].id;
      if (defaultProjectId && defaultProjectId !== selectedProject) {
        console.log('🎯 Auto-selecting accessible project for user:', defaultProjectId);
        onProjectChange(defaultProjectId);
      }
    }
  }, [availableProjects, clientMode, isLoadingProjects, onProjectChange, selectedProject]);

  const filteredProjects = availableProjects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = !filterPriority || p.priority === filterPriority;
    const matchesCategory = !filterCategory || p.category === filterCategory;
    const matchesStatus = !filterStatus || p.status === filterStatus;
    return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    // Sort by priority first, then by starred status
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.starred !== b.starred) return b.starred ? 1 : -1;
    return 0;
  });

  const currentProject = projects.find(p => p.id === selectedProject);
  const noProjectSelected = !selectedProject || !currentProject;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'planning': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'on-hold': return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-700 border-red-200';
      case 2: return 'bg-orange-100 text-orange-700 border-orange-200';
      case 3: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 4: return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Show project selection view when no project is selected
  if (noProjectSelected && !clientMode) {
    return (
      <div className="relative">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="text-center mb-6">
            <div className="inline-flex p-4 bg-indigo-100 rounded-full mb-4">
              <Folder className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Project</h2>
            <p className="text-gray-500">Choose a project to view its dashboard</p>
          </div>

          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(priority => (
                  <button
                    key={priority}
                    onClick={() => setFilterPriority(filterPriority === priority ? null : priority)}
                    className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                      filterPriority === priority
                        ? getPriorityColor(priority)
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    P{priority}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {['active', 'planning', 'on-hold'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(filterStatus === status ? null : status)}
                    className={`px-2 py-1 text-xs rounded-md border transition-colors capitalize ${
                      filterStatus === status
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Showing {filteredProjects.length} of {availableProjects.length} projects
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => onProjectChange(project.id)}
                className="w-full p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`px-2 py-0.5 text-xs rounded border ${getPriorityColor(project.priority)}`}>
                        P{project.priority}
                      </div>
                      {getStatusIcon(project.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{project.name}</p>
                        {project.starred && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        )}
                        {project.url && (
                          <span className="text-xs text-indigo-600">🔗</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500">{project.client}</p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500">{project.category}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{project.progress}%</p>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            project.progress === 100 ? 'bg-green-500' :
                            project.progress >= 70 ? 'bg-blue-500' :
                            project.progress >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Folder className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{currentProject!.name}</h2>
                {currentProject!.starred && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
                <span className={`px-2 py-1 text-xs rounded border font-medium ${getPriorityColor(currentProject!.priority)}`}>
                  Priority {currentProject!.priority}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  currentProject!.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : currentProject!.status === 'planning'
                    ? 'bg-blue-100 text-blue-700'
                    : currentProject!.status === 'on-hold'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {currentProject!.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">{currentProject!.client}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 px-4 border-l border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{currentProject!.progress}%</p>
                <p className="text-xs text-gray-500">Progress</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(currentProject!.deadline).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-xs text-gray-500">Deadline</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">{currentProject!.team}</p>
                </div>
                <p className="text-xs text-gray-500">Team</p>
              </div>
            </div>

            {!clientMode && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium">Switch Project</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Project Dropdown (hidden in client mode) */}
      {!clientMode && isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
        >
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(priority => (
                  <button
                    key={priority}
                    onClick={() => setFilterPriority(filterPriority === priority ? null : priority)}
                    className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                      filterPriority === priority
                        ? getPriorityColor(priority)
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    P{priority}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {['active', 'planning', 'on-hold'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(filterStatus === status ? null : status)}
                    className={`px-2 py-1 text-xs rounded-md border transition-colors capitalize ${
                      filterStatus === status
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Showing {filteredProjects.length} of {availableProjects.length} projects
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  onProjectChange(project.id);
                  setIsOpen(false);
                }}
                className={`w-full p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 ${
                  project.id === selectedProject ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`px-2 py-0.5 text-xs rounded border ${getPriorityColor(project.priority)}`}>
                        P{project.priority}
                      </div>
                      {getStatusIcon(project.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{project.name}</p>
                        {project.starred && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        )}
                        {project.url && (
                          <span className="text-xs text-indigo-600">🔗</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500">{project.client}</p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500">{project.category}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{project.progress}%</p>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            project.progress === 100 ? 'bg-green-500' :
                            project.progress >= 70 ? 'bg-blue-500' :
                            project.progress >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200">
            <button className="w-full flex items-center justify-center gap-2 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Create New Project</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectSelector;