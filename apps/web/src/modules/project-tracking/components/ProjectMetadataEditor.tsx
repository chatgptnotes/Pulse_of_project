import React, { useState } from 'react';
import { Calendar, FileText, User, Edit2, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { ProjectData } from '../types';

interface ProjectMetadataEditorProps {
  projectData: ProjectData;
  onUpdate: (updatedData: Partial<ProjectData>) => void;
  isEditMode: boolean;
}

const ProjectMetadataEditor: React.FC<ProjectMetadataEditorProps> = ({
  projectData,
  onUpdate,
  isEditMode
}) => {
  // Validate projectData to prevent rendering errors
  if (!projectData || typeof projectData !== 'object') {
    console.error('Invalid projectData:', projectData);
    return <div className="bg-red-100 p-4 rounded-lg">Error: Invalid project data</div>;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: String(projectData.name || ''),
    description: String(projectData.description || ''),
    client: String(projectData.client || ''),
    startDate: projectData.startDate instanceof Date ? projectData.startDate : new Date(projectData.startDate),
    endDate: projectData.endDate instanceof Date ? projectData.endDate : new Date(projectData.endDate),
    status: projectData.status
  });

  const handleSave = () => {
    onUpdate(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData({
      name: projectData.name,
      description: projectData.description,
      client: projectData.client,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      status: projectData.status
    });
    setIsEditing(false);
  };

  const statusColors = {
    'planning': 'bg-purple-100 text-purple-700',
    'active': 'bg-green-100 text-green-700',
    'on-hold': 'bg-yellow-100 text-yellow-700',
    'completed': 'bg-blue-100 text-blue-700',
    'cancelled': 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editedData.name}
              onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
              className="text-3xl font-bold w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Project Name"
            />
          ) : (
            <h1 className="text-3xl font-bold text-gray-900">{String(projectData.name)}</h1>
          )}
        </div>

        {isEditMode && (
          <div className="flex gap-2 ml-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  title="Save changes"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  title="Cancel editing"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                title="Edit project details"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-4">
        {isEditing ? (
          <textarea
            value={editedData.description}
            onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-600"
            rows={3}
            placeholder="Project description"
          />
        ) : (
          <p className="text-gray-600">{String(projectData.description)}</p>
        )}
      </div>

      {/* Project Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Client */}
        <div className="bg-gray-50 rounded-lg p-3">
          <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
            <User className="w-3 h-3" />
            Client
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.client}
              onChange={(e) => setEditedData({ ...editedData, client: e.target.value })}
              className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Client name"
            />
          ) : (
            <div className="text-sm font-medium text-gray-900">{String(projectData.client)}</div>
          )}
        </div>

        {/* Start Date */}
        <div className="bg-blue-50 rounded-lg p-3">
          <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
            <Calendar className="w-3 h-3" />
            Start Date
          </label>
          {isEditing ? (
            <input
              type="date"
              value={format(editedData.startDate, 'yyyy-MM-dd')}
              onChange={(e) => setEditedData({ ...editedData, startDate: new Date(e.target.value) })}
              className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="text-sm font-medium text-gray-900">
              {projectData.startDate instanceof Date && !isNaN(projectData.startDate.getTime())
                ? format(projectData.startDate, 'MMM dd, yyyy')
                : 'Invalid date'}
            </div>
          )}
        </div>

        {/* End Date */}
        <div className="bg-purple-50 rounded-lg p-3">
          <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
            <Calendar className="w-3 h-3" />
            End Date
          </label>
          {isEditing ? (
            <input
              type="date"
              value={format(editedData.endDate, 'yyyy-MM-dd')}
              onChange={(e) => setEditedData({ ...editedData, endDate: new Date(e.target.value) })}
              className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="text-sm font-medium text-gray-900">
              {projectData.endDate instanceof Date && !isNaN(projectData.endDate.getTime())
                ? format(projectData.endDate, 'MMM dd, yyyy')
                : 'Invalid date'}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="bg-green-50 rounded-lg p-3">
          <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
            <FileText className="w-3 h-3" />
            Status
          </label>
          {isEditing ? (
            <select
              value={editedData.status}
              onChange={(e) => setEditedData({ ...editedData, status: e.target.value as any })}
              className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          ) : (
            <div className={`text-sm font-medium px-2 py-1 rounded ${statusColors[projectData.status]}`}>
              {projectData.status.charAt(0).toUpperCase() + projectData.status.slice(1)}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="bg-yellow-50 rounded-lg p-3">
          <label className="text-xs text-gray-500 mb-1">Overall Progress</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${projectData.overallProgress}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-900">{projectData.overallProgress}%</span>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Changing the start date will automatically adjust all milestone and task dates proportionally.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectMetadataEditor;
