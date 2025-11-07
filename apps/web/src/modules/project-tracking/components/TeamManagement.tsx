import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Mail, Briefcase, Edit, Trash2,
  Save, X, Search, Filter, CheckCircle, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import teamMemberService from '../../../services/teamMemberService';

interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  team_type: 'client' | 'development';
  project_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface TeamManagementProps {
  projectName?: string;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ projectName }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'client' | 'development'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    team_type: 'development' as 'client' | 'development',
    project_name: projectName || ''
  });

  // Load team members on mount
  useEffect(() => {
    loadMembers();
  }, [projectName]);

  // Filter members based on active tab and search query
  useEffect(() => {
    let filtered = members;

    // Filter by team type
    if (activeTab !== 'all') {
      filtered = filtered.filter(m => m.team_type === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query) ||
        m.role?.toLowerCase().includes(query)
      );
    }

    setFilteredMembers(filtered);
  }, [members, activeTab, searchQuery]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await teamMemberService.getAllMembers(projectName);
      setMembers(data);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      const created = await teamMemberService.createMember({
        ...newMember,
        email: newMember.email || null,
        role: newMember.role || null,
        project_name: newMember.project_name || null
      });

      setMembers(prev => [...prev, created]);
      setNewMember({
        name: '',
        email: '',
        role: '',
        team_type: 'development',
        project_name: projectName || ''
      });
      setIsAddingMember(false);
      toast.success('Team member added successfully');
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error('Failed to add team member');
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;

    try {
      const updated = await teamMemberService.updateMember(editingMember.id, {
        name: editingMember.name,
        email: editingMember.email,
        role: editingMember.role,
        team_type: editingMember.team_type,
        project_name: editingMember.project_name
      });

      setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
      setEditingMember(null);
      toast.success('Team member updated successfully');
    } catch (error) {
      console.error('Error updating team member:', error);
      toast.error('Failed to update team member');
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      await teamMemberService.deactivateMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
      toast.success('Team member removed');
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Failed to remove team member');
    }
  };

  const getTeamStats = () => {
    return {
      total: members.length,
      client: members.filter(m => m.team_type === 'client').length,
      development: members.filter(m => m.team_type === 'development').length
    };
  };

  const stats = getTeamStats();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage client team and development team members
          </p>
        </div>
        <button
          onClick={() => setIsAddingMember(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Members</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Client Team</p>
              <p className="text-2xl font-bold text-green-900">{stats.client}</p>
            </div>
            <Users className="w-8 h-8 text-green-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Development Team</p>
              <p className="text-2xl font-bold text-purple-900">{stats.development}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex border-b-0 border border-gray-200 rounded-lg overflow-hidden">
          {(['all', 'client', 'development'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'all' ? 'All Teams' : `${tab} Team`}
            </button>
          ))}
        </div>
      </div>

      {/* Add Member Form */}
      <AnimatePresence>
        {isAddingMember && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Add New Team Member</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Frontend Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Type *
                  </label>
                  <select
                    value={newMember.team_type}
                    onChange={(e) => setNewMember({ ...newMember, team_type: e.target.value as 'client' | 'development' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="development">Development Team</option>
                    <option value="client">Client Team</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setIsAddingMember(false);
                    setNewMember({
                      name: '',
                      email: '',
                      role: '',
                      team_type: 'development',
                      project_name: projectName || ''
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Add Member
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Members List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading team members...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchQuery
              ? 'No team members found matching your search'
              : activeTab === 'all'
                ? 'No team members yet. Add your first member!'
                : `No ${activeTab} team members yet`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-all"
              >
                {editingMember?.id === member.id ? (
                  // Edit Mode
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={editingMember.name}
                          onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editingMember.email || ''}
                          onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <input
                          type="text"
                          value={editingMember.role || ''}
                          onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Team Type</label>
                        <select
                          value={editingMember.team_type}
                          onChange={(e) => setEditingMember({ ...editingMember, team_type: e.target.value as 'client' | 'development' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="development">Development Team</option>
                          <option value="client">Client Team</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingMember(null)}
                        className="px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleUpdateMember}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            member.team_type === 'client'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {member.team_type === 'client' ? 'Client Team' : 'Development Team'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          {member.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {member.email}
                            </div>
                          )}
                          {member.role && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {member.role}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingMember(member)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
