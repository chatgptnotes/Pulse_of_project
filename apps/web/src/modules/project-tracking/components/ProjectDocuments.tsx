import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, Upload, Download, Trash2, File,
  FolderGit2, User, Calendar, Search, Loader2, AlertCircle,
  Link as LinkIcon, X, ExternalLink, MessageSquare, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import documentStorageService, { DocumentMetadata } from '../../../services/documentStorageService';

interface Document {
  id: string;
  name: string;
  type: 'git' | 'uploaded' | 'link';
  path?: string;
  content?: string;
  uploadedBy?: string;
  uploadedAt?: Date;
  size?: number;
  mimeType?: string;
  // Supabase fields
  file_path?: string;
  file_type?: string;
  description?: string;
  tags?: string[];
  is_public?: boolean;
  external_url?: string;
  is_external_link?: boolean;
}

interface ProjectDocumentsProps {
  projectId: string;
  isEditMode: boolean;
}

// Git documents that are part of the repository - REMOVED
// Only showing uploaded documents from Supabase Storage
const GIT_DOCUMENTS: Array<{ name: string; path: string }> = [];

const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({ projectId, isEditMode }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load documents from Supabase on mount
  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  // Auto-refresh documents every 30 seconds to keep list updated
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing documents...');
      loadDocuments();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [projectId]);

  // Refresh documents when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      console.log('👀 Window focused - refreshing documents');
      loadDocuments();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [projectId]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const supabaseDocs = await documentStorageService.getProjectDocuments(projectId);

      // Convert Supabase documents to our Document interface
      const uploadedDocs: Document[] = supabaseDocs.map(doc => ({
        id: doc.id || '',
        name: doc.filename,
        type: doc.is_external_link ? 'link' as const : 'uploaded' as const,
        uploadedBy: doc.uploaded_by,
        uploadedAt: doc.uploaded_at ? new Date(doc.uploaded_at) : undefined,
        size: doc.file_size,
        mimeType: doc.mime_type,
        file_path: doc.file_path,
        file_type: doc.file_type,
        description: doc.description,
        tags: doc.tags,
        is_public: doc.is_public,
        external_url: doc.external_url,
        is_external_link: doc.is_external_link
      }));

      setDocuments(uploadedDocs);

    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    if (!description.trim()) {
      toast.error('Please provide a description for the files');
      return;
    }

    setIsUploading(true);

    try {
      const fileArray = Array.from(files);
      const uploadedBy = 'Current User'; // TODO: Get from auth context

      toast.loading(`Uploading ${fileArray.length} file(s)...`, { id: 'upload' });

      // Upload files to Supabase with description
      const results = await documentStorageService.uploadMultipleDocuments(
        fileArray,
        projectId,
        uploadedBy,
        {
          description: description.trim(),
          tags: [],
          isPublic: false
        }
      );

      // Check results
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        toast.success(`Successfully uploaded ${successful.length} file(s)`, { id: 'upload' });

        // Reload documents and close modal
        await loadDocuments();
        handleCloseModal();
      }

      if (failed.length > 0) {
        const errorMessages = failed.map(r => r.error).join(', ');
        toast.error(`Failed to upload ${failed.length} file(s): ${errorMessages}`, { id: 'upload' });
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files', { id: 'upload' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLinkSubmit = async () => {
    if (!linkUrl.trim()) {
      toast.error('Please provide a URL');
      return;
    }
    if (!linkTitle.trim()) {
      toast.error('Please provide a title for the link');
      return;
    }
    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    setIsUploading(true);

    try {
      const uploadedBy = 'Current User'; // TODO: Get from auth context

      toast.loading('Saving link...', { id: 'link-upload' });

      const result = await documentStorageService.addExternalLink(
        linkUrl.trim(),
        projectId,
        uploadedBy,
        {
          title: linkTitle.trim(),
          description: description.trim(),
          tags: [],
          isPublic: false
        }
      );

      if (result.success) {
        toast.success('Link saved successfully', { id: 'link-upload' });
        await loadDocuments();
        handleCloseModal();
      } else {
        toast.error(result.error || 'Failed to save link', { id: 'link-upload' });
      }

    } catch (error) {
      console.error('Link upload error:', error);
      toast.error('Failed to save link', { id: 'link-upload' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setUploadMode('file');
    setLinkUrl('');
    setLinkTitle('');
    setDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (uploadMode === 'file') {
      if (fileInputRef.current?.files) {
        await handleFileUpload(fileInputRef.current.files);
      }
    } else {
      await handleLinkSubmit();
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    if (doc.type === 'git') {
      toast.error('Cannot delete Git repository documents');
      return;
    }

    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      toast.loading('Deleting document...', { id: 'delete' });

      const success = await documentStorageService.deleteDocument(docId);

      if (success) {
        toast.success('Document deleted successfully', { id: 'delete' });

        // Remove from local state
        setDocuments(prev => prev.filter(d => d.id !== docId));
      } else {
        toast.error('Failed to delete document', { id: 'delete' });
      }

    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document', { id: 'delete' });
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      // Handle external links - open in new tab
      if (doc.is_external_link && doc.external_url) {
        window.open(doc.external_url, '_blank', 'noopener,noreferrer');
        return;
      }

      if (doc.type === 'git') {
        // Handle Git documents
        const content = `Git document: ${doc.name}\nPath: ${doc.path}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      // Handle Supabase storage documents
      if (doc.file_path) {
        toast.loading('Downloading...', { id: 'download' });

        const result = await documentStorageService.downloadDocument(doc.file_path);

        if (result.success && result.data) {
          const url = URL.createObjectURL(result.data);
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.name;
          a.click();
          URL.revokeObjectURL(url);

          toast.success('Download complete', { id: 'download' });
        } else {
          toast.error(result.error || 'Download failed', { id: 'download' });
        }
      }

    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-500" />
          Project Documents
          {isLoading && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
        </h2>

        {/* Upload and Refresh buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              loadDocuments();
              toast.success('Refreshing documents...');
            }}
            disabled={isLoading}
            className={`px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Refresh document list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            disabled={isUploading}
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload className="w-4 h-4" />
            Add Document / Link
          </button>
        </div>
      </div>

      {/* Storage Info Banner */}
      {isEditMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-900">
              Documents are stored securely in neuro_bucket. Maximum file size: 50MB.
            </p>
            <p className="text-blue-700 text-xs mt-1">
              Supported: PDF, Word, PowerPoint, Excel, Images, Text files, and Archives
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        {/* Document List */}
        <div className="space-y-3 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Documents ({filteredDocuments.length})
          </h3>

          {filteredDocuments.map(doc => (
            <div
              key={doc.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {doc.type === 'git' ? (
                    <FolderGit2 className="w-5 h-5 text-green-500 mt-1" />
                  ) : doc.type === 'link' ? (
                    <LinkIcon className="w-5 h-5 text-purple-500 mt-1" />
                  ) : (
                    <File className="w-5 h-5 text-blue-500 mt-1" />
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>

                    {/* Description/Comment */}
                    {doc.description && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{doc.description}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      {doc.type === 'git' ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                          Git Repository
                        </span>
                      ) : doc.type === 'link' ? (
                        <>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            External Link
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {doc.uploadedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {doc.uploadedAt && format(doc.uploadedAt, 'MMM dd, yyyy')}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {doc.uploadedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {doc.uploadedAt && format(doc.uploadedAt, 'MMM dd, yyyy')}
                          </span>
                          <span>{formatFileSize(doc.size)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadDocument(doc);
                    }}
                    className={`p-2 hover:bg-green-100 rounded-lg transition-colors ${
                      doc.type === 'link' ? 'text-purple-600' : 'text-green-600'
                    }`}
                    title={doc.type === 'link' ? 'Open Link' : 'Download'}
                  >
                    {doc.type === 'link' ? (
                      <ExternalLink className="w-5 h-5" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                  </button>
                  {/* Delete button only visible in edit mode */}
                  {(doc.type === 'uploaded' || doc.type === 'link') && isEditMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No documents found</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-blue-500 hover:text-blue-600"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">Add Document or Link</h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setUploadMode('file')}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  uploadMode === 'file'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5" />
                  <span>Upload Files</span>
                </div>
              </button>
              <button
                onClick={() => setUploadMode('link')}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  uploadMode === 'link'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  <span>Add Link</span>
                </div>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {uploadMode === 'file' ? (
                <>
                  {/* File Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Files
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".md,.txt,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.zip"
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum file size: 50MB. Supported formats: PDF, Word, Excel, PowerPoint, Images, Archives
                    </p>
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description / Comment <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what these files contain, their purpose, or any relevant notes..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This description will be visible to all users who can see this document
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Link Input Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Paste Google Docs, Google Sheets, or any website URL
                    </p>
                  </div>

                  {/* Title Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      placeholder="e.g., Project Budget Spreadsheet"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description / Comment <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what this link contains, its purpose, or any relevant notes..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This description will be visible to all users who can see this link
                    </p>
                  </div>

                  {/* Link Type Info */}
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-purple-900 font-medium mb-1">Supported Links:</p>
                        <ul className="text-purple-700 space-y-1">
                          <li>• Google Docs, Sheets, Slides</li>
                          <li>• Google Drive files</li>
                          <li>• Any website or web resource</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={handleCloseModal}
                disabled={isUploading}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                  uploadMode === 'file'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-purple-500 hover:bg-purple-600'
                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploadMode === 'file' ? 'Uploading...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    {uploadMode === 'file' ? (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Files
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4" />
                        Save Link
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDocuments;
