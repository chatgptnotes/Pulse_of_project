import React, { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import EditableMilestone from './components/EditableMilestone';
import GanttChart from './components/GanttChart';
import KPIDashboard from './components/KPIDashboard';
import ClientCollaboration from './components/ClientCollaboration';
import { projectOverview as defaultProjectData } from './data/sample-project-milestones';
import { ProjectData, ProjectComment, ProjectUpdate, ProjectMilestone, ProjectTask } from './types';
import {
  Edit, Save, Download, Upload, Share2, RefreshCw,
  Lock, Unlock, Users, Clock, Cloud, CloudOff,
  GitBranch, FileJson, AlertCircle, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'neurosense-project-data';
const LAST_SAVED_KEY = 'neurosense-last-saved';
const EDIT_LOCK_KEY = 'neurosense-edit-lock';

interface EditLock {
  userId: string;
  userName: string;
  timestamp: number;
}

const EditableProjectDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'gantt' | 'kpi' | 'collaboration'>('overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData>(defaultProjectData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [editLock, setEditLock] = useState<EditLock | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved data on mount
  useEffect(() => {
    loadProjectData();
    checkEditLock();

    // Check online status
    setIsOnline(navigator.onLine);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    // Auto-save every 30 seconds if there are changes
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges) {
        saveProjectData();
      }
    }, 30000);

    return () => {
      clearInterval(autoSaveInterval);
      releaseEditLock();
    };
  }, []);

  const loadProjectData = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedTimestamp = localStorage.getItem(LAST_SAVED_KEY);

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Convert date strings back to Date objects
        parsedData.startDate = new Date(parsedData.startDate);
        parsedData.endDate = new Date(parsedData.endDate);
        parsedData.milestones = parsedData.milestones.map((m: any) => ({
          ...m,
          startDate: new Date(m.startDate),
          endDate: new Date(m.endDate)
        }));
        parsedData.tasks = parsedData.tasks.map((t: any) => ({
          ...t,
          startDate: new Date(t.startDate),
          endDate: new Date(t.endDate)
        }));

        // Check if this is old data (starts before Nov 1, 2025)
        if (parsedData.startDate < new Date('2025-11-01')) {
          toast.info('Detected old timeline. Click the red reset button to update to Nov 1 start date.');
        }

        setProjectData(parsedData);
        toast.success('Project data loaded from local storage');
      } else {
        // No saved data, use default which starts Nov 1
        setProjectData(defaultProjectData);
        toast.info('Loaded default project timeline (Nov 1, 2025 - Jan 10, 2026)');
      }

      if (savedTimestamp) {
        setLastSaved(new Date(savedTimestamp));
      }
    } catch (error) {
      console.error('Failed to load project data:', error);
      toast.error('Failed to load saved data');
    }
  };

  const saveProjectData = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projectData));
      const now = new Date();
      localStorage.setItem(LAST_SAVED_KEY, now.toISOString());
      setLastSaved(now);
      setHasUnsavedChanges(false);
      toast.success('Project data saved successfully');

      // Create an update entry
      const update: ProjectUpdate = {
        id: `update-${Date.now()}`,
        projectId: projectData.id,
        userId: getCurrentUserId(),
        userName: getCurrentUserName(),
        type: 'general',
        title: 'Project Data Updated',
        description: `Project data has been updated and saved`,
        timestamp: now
      };
      setUpdates(prev => [update, ...prev]);
    } catch (error) {
      console.error('Failed to save project data:', error);
      toast.error('Failed to save data');
    }
  };

  const checkEditLock = () => {
    const lockData = localStorage.getItem(EDIT_LOCK_KEY);
    if (lockData) {
      const lock: EditLock = JSON.parse(lockData);
      // Check if lock is still valid (less than 5 minutes old)
      if (Date.now() - lock.timestamp < 5 * 60 * 1000) {
        setEditLock(lock);
      } else {
        localStorage.removeItem(EDIT_LOCK_KEY);
      }
    }
  };

  const acquireEditLock = () => {
    const lock: EditLock = {
      userId: getCurrentUserId(),
      userName: getCurrentUserName(),
      timestamp: Date.now()
    };
    localStorage.setItem(EDIT_LOCK_KEY, JSON.stringify(lock));
    setEditLock(lock);
    setIsEditMode(true);
    toast.success('Edit mode enabled');
  };

  const releaseEditLock = () => {
    if (editLock && editLock.userId === getCurrentUserId()) {
      localStorage.removeItem(EDIT_LOCK_KEY);
      setEditLock(null);
      setIsEditMode(false);
    }
  };

  const getCurrentUserId = () => {
    // Get from auth context or use dev mode
    const auth = localStorage.getItem('neuro360-auth');
    if (auth) {
      const { user } = JSON.parse(auth);
      return user.id;
    }
    return 'dev-user-' + Math.random().toString(36).substr(2, 9);
  };

  const getCurrentUserName = () => {
    const auth = localStorage.getItem('neuro360-auth');
    if (auth) {
      const { user } = JSON.parse(auth);
      return user.name;
    }
    return 'Developer';
  };

  const handleMilestoneUpdate = (updatedMilestone: ProjectMilestone) => {
    const updatedMilestones = projectData.milestones.map(m =>
      m.id === updatedMilestone.id ? updatedMilestone : m
    );

    // Recalculate overall progress
    const totalProgress = updatedMilestones.reduce((sum, m) => sum + m.progress, 0) / updatedMilestones.length;

    setProjectData({
      ...projectData,
      milestones: updatedMilestones,
      overallProgress: Math.round(totalProgress)
    });
    setHasUnsavedChanges(true);
  };

  const handleAddTask = (task: Omit<ProjectTask, 'id'>) => {
    const newTask: ProjectTask = {
      ...task,
      id: `task-${Date.now()}`
    };
    setProjectData({
      ...projectData,
      tasks: [...projectData.tasks, newTask]
    });
    setHasUnsavedChanges(true);
    toast.success('Task added');
  };

  const handleUpdateTask = (updatedTask: ProjectTask) => {
    const updatedTasks = projectData.tasks.map(t =>
      t.id === updatedTask.id ? updatedTask : t
    );
    setProjectData({
      ...projectData,
      tasks: updatedTasks
    });
    setHasUnsavedChanges(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setProjectData({
      ...projectData,
      tasks: projectData.tasks.filter(t => t.id !== taskId)
    });
    setHasUnsavedChanges(true);
    toast.success('Task deleted');
  };

  const exportProjectData = () => {
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `neurosense-project-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success('Project data exported');
  };

  const importProjectData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          // Convert date strings
          imported.startDate = new Date(imported.startDate);
          imported.endDate = new Date(imported.endDate);
          imported.milestones = imported.milestones.map((m: any) => ({
            ...m,
            startDate: new Date(m.startDate),
            endDate: new Date(m.endDate)
          }));
          imported.tasks = imported.tasks.map((t: any) => ({
            ...t,
            startDate: new Date(t.startDate),
            endDate: new Date(t.endDate)
          }));

          setProjectData(imported);
          setHasUnsavedChanges(true);
          toast.success('Project data imported successfully');
        } catch (error) {
          toast.error('Failed to import file');
        }
      };
      reader.readAsText(file);
    }
  };

  const shareProject = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Project link copied to clipboard');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Floating Edit Mode Button (Alternative/Additional) */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <button
            onClick={() => {
              if (isEditMode) {
                if (hasUnsavedChanges) {
                  saveProjectData();
                }
                releaseEditLock();
              } else {
                acquireEditLock();
              }
            }}
            disabled={editLock && editLock.userId !== getCurrentUserId()}
            className={`group flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl transition-all transform hover:scale-105 ${
              editLock && editLock.userId !== getCurrentUserId()
                ? 'bg-gray-400 cursor-not-allowed'
                : isEditMode
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white font-medium`}
            title={editLock && editLock.userId !== getCurrentUserId()
              ? `Currently being edited by ${editLock.userName}`
              : isEditMode
              ? 'Click to exit edit mode'
              : 'Click to enable edit mode'}
          >
            {isEditMode ? (
              <>
                <Unlock className="w-5 h-5" />
                <span>Exit Edit Mode</span>
                {hasUnsavedChanges && (
                  <span className="ml-2 w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                )}
              </>
            ) : (
              <>
                <Edit className="w-5 h-5" />
                <span>Enable Edit Mode</span>
              </>
            )}
          </button>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          {/* Header with Edit Controls */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6 mb-6"
          >
            {/* Old Timeline Warning Banner */}
            {projectData.startDate < new Date('2025-11-01') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    You're viewing an old timeline (Oct 21 start). The project now starts Nov 1, 2025.
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Reset to the updated November 1st timeline? Your current changes will be lost.')) {
                      localStorage.removeItem(STORAGE_KEY);
                      localStorage.removeItem(LAST_SAVED_KEY);
                      setProjectData(defaultProjectData);
                      setHasUnsavedChanges(false);
                      toast.success('Updated to new timeline: Nov 1, 2025 - Jan 10, 2026');
                    }
                  }}
                  className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium"
                >
                  Update to Nov 1 Timeline
                </button>
              </div>
            )}

            {/* Edit Mode Banner */}
            {isEditMode && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Edit Mode Active - Changes will be saved automatically
                  </span>
                </div>
                {hasUnsavedChanges && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Unsaved changes
                  </span>
                )}
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{projectData.name}</h1>
                <p className="text-gray-600 mt-2">{projectData.description}</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className={`text-sm px-3 py-1 rounded-full flex items-center gap-2 ${
                    isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {isOnline ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                  {lastSaved && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                  {hasUnsavedChanges && (
                    <span className="text-sm text-yellow-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Unsaved changes
                    </span>
                  )}
                  {editLock && editLock.userId !== getCurrentUserId() && (
                    <span className="text-sm text-orange-600 flex items-center gap-1">
                      <Lock className="w-4 h-4" />
                      Being edited by {editLock.userName}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 items-center">
                {/* Edit Mode Toggle Switch */}
                <div className={`flex items-center gap-3 px-5 py-3 rounded-lg border-2 transition-all ${
                  isEditMode
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <span className={`text-sm font-semibold ${
                    isEditMode ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    Edit Mode
                  </span>
                  <button
                    onClick={() => {
                      if (isEditMode) {
                        if (hasUnsavedChanges) {
                          saveProjectData();
                        }
                        releaseEditLock();
                      } else {
                        acquireEditLock();
                      }
                    }}
                    disabled={editLock && editLock.userId !== getCurrentUserId()}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      editLock && editLock.userId !== getCurrentUserId()
                        ? 'bg-gray-300 cursor-not-allowed'
                        : isEditMode
                        ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                        : 'bg-gray-400 hover:bg-gray-500 focus:ring-gray-500'
                    }`}
                    title={editLock && editLock.userId !== getCurrentUserId()
                      ? `Currently being edited by ${editLock.userName}`
                      : isEditMode
                      ? 'Click to exit edit mode'
                      : 'Click to enable edit mode'}
                  >
                    <span className="sr-only">Toggle edit mode</span>
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                        isEditMode ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  {isEditMode ? (
                    <div className="flex items-center gap-1">
                      <Unlock className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Lock className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-500">Locked</span>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                {isEditMode && hasUnsavedChanges && (
                  <button
                    onClick={saveProjectData}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                )}

                {/* Export/Import */}
                <button
                  onClick={exportProjectData}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Download className="w-5 h-5" />
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Upload className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={importProjectData}
                  className="hidden"
                />

                <button
                  onClick={shareProject}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                <button
                  onClick={loadProjectData}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  title="Reload saved data"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    if (confirm('Reset to default project data? This will clear all your changes.')) {
                      localStorage.removeItem(STORAGE_KEY);
                      localStorage.removeItem(LAST_SAVED_KEY);
                      setProjectData(defaultProjectData);
                      setHasUnsavedChanges(false);
                      toast.success('Reset to default project timeline (Nov 1, 2025 start)');
                    }
                  }}
                  className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                  title="Reset to default timeline"
                >
                  <RefreshCw className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex gap-2 mt-6 border-t pt-4">
              {(['overview', 'gantt', 'kpi', 'collaboration'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    activeView === view
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Main Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeView === 'overview' && (
                <div className="space-y-4">
                  {/* Progress Overview */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Project Progress</h2>
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Overall Completion</span>
                        <span className="text-sm font-bold">{projectData.overallProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-500 h-4 rounded-full transition-all"
                          style={{ width: `${projectData.overallProgress}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-500">
                          {projectData.milestones.filter(m => m.status === 'completed').length}
                        </div>
                        <div className="text-sm text-gray-600">Completed Milestones</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-500">
                          {projectData.milestones.filter(m => m.status === 'in-progress').length}
                        </div>
                        <div className="text-sm text-gray-600">In Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-500">
                          {projectData.milestones.filter(m => m.status === 'pending').length}
                        </div>
                        <div className="text-sm text-gray-600">Pending</div>
                      </div>
                    </div>
                  </div>

                  {/* Editable Milestones */}
                  <div className="space-y-4">
                    {projectData.milestones.map(milestone => (
                      <EditableMilestone
                        key={milestone.id}
                        milestone={milestone}
                        tasks={projectData.tasks.filter(t => t.milestoneId === milestone.id)}
                        onUpdate={handleMilestoneUpdate}
                        onAddTask={handleAddTask}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                        isEditMode={isEditMode}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeView === 'gantt' && (
                <GanttChart
                  data={{
                    milestones: projectData.milestones,
                    tasks: projectData.tasks,
                    startDate: projectData.startDate,
                    endDate: projectData.endDate,
                    viewMode: 'month'
                  }}
                  showTasks={true}
                  interactive={true}
                />
              )}

              {activeView === 'kpi' && (
                <KPIDashboard projectData={projectData} />
              )}

              {activeView === 'collaboration' && (
                <ClientCollaboration
                  projectId={projectData.id}
                  comments={comments}
                  updates={updates}
                  onSendComment={(comment) => {
                    const newComment: ProjectComment = {
                      ...comment,
                      id: `comment-${Date.now()}`,
                      timestamp: new Date()
                    };
                    setComments(prev => [...prev, newComment]);
                  }}
                  currentUserId={getCurrentUserId()}
                  currentUserName={getCurrentUserName()}
                  currentUserRole="team"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Collaboration Status Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-white rounded-lg shadow-md p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">
                  Collaborative editing enabled • Auto-save every 30 seconds
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isEditMode ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    Editing
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    View Only
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DndProvider>
  );
};

export default EditableProjectDashboard;