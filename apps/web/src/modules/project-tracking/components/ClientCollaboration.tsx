import React, { useState } from 'react';
import {
  MessageSquare, Send, Paperclip, Bell, Download,
  FileText, CheckCircle, AlertCircle, Info, Users,
  Calendar, Clock, Edit, Trash2, Reply
} from 'lucide-react';
import { ProjectComment, ProjectUpdate, ProjectMilestone } from '../types';
import { format, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface ClientCollaborationProps {
  projectId: string;
  comments: ProjectComment[];
  updates: ProjectUpdate[];
  onSendComment: (comment: Omit<ProjectComment, 'id' | 'timestamp'>) => void;
  onDeleteComment?: (commentId: string) => void;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'client' | 'team' | 'admin';
}

const ClientCollaboration: React.FC<ClientCollaborationProps> = ({
  projectId,
  comments,
  updates,
  onSendComment,
  onDeleteComment,
  currentUserId,
  currentUserName,
  currentUserRole
}) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'updates' | 'documents'>('comments');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'milestone' | 'task' | 'general'>('all');
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleSendComment = () => {
    if (newComment.trim()) {
      onSendComment({
        userId: currentUserId,
        userName: currentUserName,
        message: newComment,
        milestoneId: replyingTo || undefined,
        attachments: attachments.map(f => f.name)
      });
      setNewComment('');
      setReplyingTo(null);
      setAttachments([]);
    }
  };

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'task': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'kpi': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredUpdates = filterType === 'all'
    ? updates
    : updates.filter(u => u.type === filterType);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Project Communication</h2>
        <div className="flex gap-2">
          <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <Bell className="w-5 h-5 text-blue-600" />
          </button>
          <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {(['comments', 'updates', 'documents'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium capitalize transition-all ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
            {tab === 'comments' && (
              <span className="ml-2 bg-gray-200 text-xs px-2 py-1 rounded-full">
                {comments.length}
              </span>
            )}
            {tab === 'updates' && (
              <span className="ml-2 bg-gray-200 text-xs px-2 py-1 rounded-full">
                {updates.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <motion.div
            key="comments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Comment Input */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {currentUserName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileAttachment}
                          className="hidden"
                        />
                        <div className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          <Paperclip className="w-5 h-5 text-gray-600" />
                        </div>
                      </label>
                      {attachments.length > 0 && (
                        <span className="text-sm text-gray-600">
                          {attachments.length} file(s) attached
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleSendComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map(comment => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {comment.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{comment.userName}</span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1">{comment.message}</p>
                          {comment.attachments && comment.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {comment.attachments.map((file, idx) => (
                                <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  <Paperclip className="w-3 h-3 inline mr-1" />
                                  {file}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setReplyingTo(comment.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Reply className="w-4 h-4 text-gray-600" />
                          </button>
                          {comment.userId === currentUserId && onDeleteComment && (
                            <button
                              onClick={() => onDeleteComment(comment.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Updates Tab */}
        {activeTab === 'updates' && (
          <motion.div
            key="updates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Filter */}
            <div className="flex gap-2 mb-4">
              {(['all', 'milestone', 'task', 'kpi', 'general'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-lg text-sm capitalize transition-colors ${
                    filterType === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Updates List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredUpdates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Info className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No updates in this category</p>
                </div>
              ) : (
                filteredUpdates.map(update => (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 p-4 border-l-4 bg-gray-50 rounded-lg"
                    style={{
                      borderLeftColor:
                        update.type === 'milestone' ? '#10B981' :
                        update.type === 'task' ? '#3B82F6' :
                        update.type === 'kpi' ? '#F59E0B' :
                        '#6B7280'
                    }}
                  >
                    <div className="flex-shrink-0">
                      {getUpdateIcon(update.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{update.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{update.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {update.userName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(update.timestamp, 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(update.timestamp, 'HH:mm')}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          update.type === 'milestone' ? 'bg-green-100 text-green-700' :
                          update.type === 'task' ? 'bg-blue-100 text-blue-700' :
                          update.type === 'kpi' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {update.type}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <motion.div
            key="documents"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sample Documents */}
              {[
                { name: 'Project Proposal.pdf', size: '2.3 MB', date: new Date('2025-10-18') },
                { name: 'Technical Specifications.docx', size: '1.5 MB', date: new Date('2025-10-20') },
                { name: 'Gantt Chart.xlsx', size: '450 KB', date: new Date('2025-10-21') },
                { name: 'Milestone Report.pdf', size: '3.1 MB', date: new Date('2025-10-23') }
              ].map((doc, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <h4 className="font-semibold text-sm truncate">{doc.name}</h4>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{doc.size}</span>
                    <span>{format(doc.date, 'MMM dd')}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientCollaboration;