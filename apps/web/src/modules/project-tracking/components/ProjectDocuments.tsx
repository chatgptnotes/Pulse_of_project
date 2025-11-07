import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, Upload, Download, Trash2, File,
  FolderGit2, User, Calendar, Search, Loader2, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import documentStorageService, { DocumentMetadata } from '../../../services/documentStorageService';

interface Document {
  id: string;
  name: string;
  type: 'git' | 'uploaded';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load documents from Supabase on mount
  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const supabaseDocs = await documentStorageService.getProjectDocuments(projectId);

      // Convert Supabase documents to our Document interface
      const uploadedDocs: Document[] = supabaseDocs.map(doc => ({
        id: doc.id || '',
        name: doc.filename,
        type: 'uploaded' as const,
        uploadedBy: doc.uploaded_by,
        uploadedAt: doc.uploaded_at ? new Date(doc.uploaded_at) : undefined,
        size: doc.file_size,
        mimeType: doc.mime_type,
        file_path: doc.file_path,
        file_type: doc.file_type,
        description: doc.description,
        tags: doc.tags,
        is_public: doc.is_public
      }));

      // Only show uploaded documents (no Git documents)
      setDocuments(uploadedDocs);

    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const fileArray = Array.from(files);
      const uploadedBy = 'Current User'; // TODO: Get from auth context

      toast.loading(`Uploading ${fileArray.length} file(s)...`, { id: 'upload' });

      // Upload files to Supabase
      const results = await documentStorageService.uploadMultipleDocuments(
        fileArray,
        projectId,
        uploadedBy,
        {
          description: '',
          tags: [],
          isPublic: false
        }
      );

      // Check results
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        toast.success(`Successfully uploaded ${successful.length} file(s)`, { id: 'upload' });

        // Reload documents
        await loadDocuments();
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

        if (selectedDoc?.id === docId) {
          setSelectedDoc(null);
          setViewingContent(null);
        }
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

        {isEditMode && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Document
              </>
            )}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".md,.txt,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.zip"
          onChange={handleFileUpload}
          className="hidden"
        />
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
                  ) : (
                    <File className="w-5 h-5 text-blue-500 mt-1" />
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>

                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      {doc.type === 'git' ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                          Git Repository
                        </span>
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
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  {doc.type === 'uploaded' && (
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
    </div>
  );
};

export default ProjectDocuments;
