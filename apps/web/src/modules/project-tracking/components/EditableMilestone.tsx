import React, { useState } from 'react';
import {
  Edit2, Save, X, Calendar, Users, Target,
  AlertCircle, Plus, Trash2, Check, Clock
} from 'lucide-react';
import { ProjectMilestone, MilestoneKPI, ProjectTask } from '../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface EditableMilestoneProps {
  milestone: ProjectMilestone;
  tasks: ProjectTask[];
  onUpdate: (milestone: ProjectMilestone) => void;
  onDelete: (milestoneId: string) => void;
  onAddTask: (task: Omit<ProjectTask, 'id'>) => void;
  onUpdateTask: (task: ProjectTask) => void;
  onDeleteTask: (taskId: string) => void;
  isEditMode: boolean;
}

const EditableMilestone: React.FC<EditableMilestoneProps> = ({
  milestone,
  tasks,
  onUpdate,
  onDelete,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  isEditMode
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMilestone, setEditedMilestone] = useState(milestone);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState<Partial<ProjectTask>>({
    name: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    startDate: new Date(),
    endDate: new Date(),
    progress: 0,
    assignedTo: []
  });

  const handleSave = () => {
    onUpdate(editedMilestone);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMilestone(milestone);
    setIsEditing(false);
  };

  const handleAddDeliverable = () => {
    const newDeliverable = prompt('Enter new deliverable:');
    if (newDeliverable) {
      setEditedMilestone({
        ...editedMilestone,
        deliverables: [...editedMilestone.deliverables, newDeliverable]
      });
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    setEditedMilestone({
      ...editedMilestone,
      deliverables: editedMilestone.deliverables.filter((_, i) => i !== index)
    });
  };

  const handleAddKPI = () => {
    const newKPI: MilestoneKPI = {
      id: `kpi-${Date.now()}`,
      name: 'New KPI',
      target: 100,
      current: 0,
      unit: 'units',
      status: 'on-track',
      trend: 'stable'
    };
    setEditedMilestone({
      ...editedMilestone,
      kpis: [...(editedMilestone.kpis || []), newKPI]
    });
  };

  const handleUpdateKPI = (index: number, field: keyof MilestoneKPI, value: any) => {
    const updatedKPIs = [...(editedMilestone.kpis || [])];
    updatedKPIs[index] = { ...updatedKPIs[index], [field]: value };

    // Auto-calculate status based on progress
    const progress = (updatedKPIs[index].current / updatedKPIs[index].target) * 100;
    if (progress >= 90) updatedKPIs[index].status = 'on-track';
    else if (progress >= 70) updatedKPIs[index].status = 'at-risk';
    else updatedKPIs[index].status = 'off-track';

    setEditedMilestone({ ...editedMilestone, kpis: updatedKPIs });
  };

  const handleAddNewTask = () => {
    if (newTask.name) {
      onAddTask({
        ...newTask as Omit<ProjectTask, 'id'>,
        milestoneId: milestone.id
      });
      setNewTask({
        name: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        startDate: new Date(),
        endDate: new Date(),
        progress: 0,
        assignedTo: []
      });
      setShowTaskForm(false);
    }
  };

  const statusColors = {
    'pending': 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    'completed': 'bg-green-100 text-green-700',
    'delayed': 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      {/* Milestone Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editedMilestone.name}
              onChange={(e) => setEditedMilestone({ ...editedMilestone, name: e.target.value })}
              className="text-xl font-bold w-full px-2 py-1 border rounded"
            />
          ) : (
            <h3 className="text-xl font-bold">{milestone.name}</h3>
          )}

          {isEditing ? (
            <textarea
              value={editedMilestone.description}
              onChange={(e) => setEditedMilestone({ ...editedMilestone, description: e.target.value })}
              className="w-full mt-2 px-2 py-1 border rounded text-sm text-gray-600"
              rows={2}
            />
          ) : (
            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
          )}
        </div>

        {isEditMode && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                  title="Save changes"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                  title="Cancel editing"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  title="Edit milestone"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(milestone.id)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                  title="Delete milestone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Status and Dates */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs text-gray-500">Status</label>
          {isEditing ? (
            <select
              value={editedMilestone.status}
              onChange={(e) => setEditedMilestone({ ...editedMilestone, status: e.target.value as any })}
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
            </select>
          ) : (
            <div className={`mt-1 px-2 py-1 rounded text-sm ${statusColors[milestone.status]}`}>
              {milestone.status}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500">Start Date</label>
          {isEditing ? (
            <input
              type="date"
              value={format(editedMilestone.startDate, 'yyyy-MM-dd')}
              onChange={(e) => setEditedMilestone({ ...editedMilestone, startDate: new Date(e.target.value) })}
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
            />
          ) : (
            <div className="mt-1 text-sm flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(milestone.startDate, 'MMM dd, yyyy')}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500">End Date</label>
          {isEditing ? (
            <input
              type="date"
              value={format(editedMilestone.endDate, 'yyyy-MM-dd')}
              onChange={(e) => setEditedMilestone({ ...editedMilestone, endDate: new Date(e.target.value) })}
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
            />
          ) : (
            <div className="mt-1 text-sm flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(milestone.endDate, 'MMM dd, yyyy')}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500">Progress</label>
          {isEditing ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="range"
                min="0"
                max="100"
                value={editedMilestone.progress}
                onChange={(e) => setEditedMilestone({ ...editedMilestone, progress: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm font-semibold">{editedMilestone.progress}%</span>
            </div>
          ) : (
            <div className="mt-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{milestone.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${milestone.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deliverables */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700">Deliverables</h4>
          {isEditing && (
            <button
              onClick={handleAddDeliverable}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              <Plus className="w-3 h-3 inline mr-1" />
              Add
            </button>
          )}
        </div>
        <div className="space-y-1">
          {editedMilestone.deliverables.map((deliverable, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="w-3 h-3 text-green-500" />
              <span className="text-sm flex-1">{deliverable}</span>
              {isEditing && (
                <button
                  onClick={() => handleRemoveDeliverable(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700">KPIs</h4>
          {isEditing && (
            <button
              onClick={handleAddKPI}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              <Plus className="w-3 h-3 inline mr-1" />
              Add KPI
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {editedMilestone.kpis?.map((kpi, index) => (
            <div key={kpi.id} className="border rounded-lg p-3">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={kpi.name}
                    onChange={(e) => handleUpdateKPI(index, 'name', e.target.value)}
                    className="w-full text-sm font-medium px-1 py-0.5 border rounded"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={kpi.current}
                      onChange={(e) => handleUpdateKPI(index, 'current', parseFloat(e.target.value))}
                      className="w-20 text-sm px-1 py-0.5 border rounded"
                      placeholder="Current"
                    />
                    <span className="text-sm">/</span>
                    <input
                      type="number"
                      value={kpi.target}
                      onChange={(e) => handleUpdateKPI(index, 'target', parseFloat(e.target.value))}
                      className="w-20 text-sm px-1 py-0.5 border rounded"
                      placeholder="Target"
                    />
                    <input
                      type="text"
                      value={kpi.unit}
                      onChange={(e) => handleUpdateKPI(index, 'unit', e.target.value)}
                      className="w-20 text-sm px-1 py-0.5 border rounded"
                      placeholder="Unit"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm font-medium">{kpi.name}</div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-bold">{kpi.current}</span>
                    <span className="text-sm text-gray-500">/ {kpi.target} {kpi.unit}</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        kpi.status === 'on-track' ? 'bg-green-500' :
                        kpi.status === 'at-risk' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700">Tasks ({tasks.length})</h4>
          {isEditMode && (
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
            >
              <Plus className="w-3 h-3 inline mr-1" />
              Add Task
            </button>
          )}
        </div>

        <AnimatePresence>
          {showTaskForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 rounded p-3 mb-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Task name"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="px-2 py-1 border rounded text-sm"
                />
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddNewTask}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setShowTaskForm(false)}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'critical' ? 'bg-red-500' :
                    task.priority === 'high' ? 'bg-orange-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`} />
                  <span className="text-sm font-medium">{task.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    task.status === 'completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    task.status === 'blocked' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-500">Progress: {task.progress}%</span>
                  <span className="text-xs text-gray-500">
                    {format(task.startDate, 'MMM dd')} - {format(task.endDate, 'MMM dd')}
                  </span>
                </div>
              </div>
              {isEditMode && (
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditableMilestone;