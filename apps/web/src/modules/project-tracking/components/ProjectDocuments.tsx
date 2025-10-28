import React, { useState, useRef } from 'react';
import {
  FileText, Upload, Download, Eye, Trash2, File,
  FolderGit2, User, Calendar, Search, X
} from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

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
}

interface ProjectDocumentsProps {
  projectId: string;
  isEditMode: boolean;
}

// Git documents that are part of the repository
const GIT_DOCUMENTS = [
  { name: 'PULSEOFPROJECT_README.md', path: '/PULSEOFPROJECT_README.md' },
  { name: 'PROJECT_TRACKING_MODULE.md', path: '/PROJECT_TRACKING_MODULE.md' },
  { name: 'COLLABORATIVE_PROJECT_TRACKING_GUIDE.md', path: '/COLLABORATIVE_PROJECT_TRACKING_GUIDE.md' },
  { name: 'PULSEOFPROJECT_DEPLOYMENT.md', path: '/PULSEOFPROJECT_DEPLOYMENT.md' },
  { name: 'SETUP_GUIDE.md', path: '/SETUP_GUIDE.md' },
  { name: 'SETUP_INSTRUCTIONS.md', path: '/SETUP_INSTRUCTIONS.md' },
];

const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({ projectId, isEditMode }) => {
  const [documents, setDocuments] = useState<Document[]>([
    ...GIT_DOCUMENTS.map((doc, idx) => ({
      id: `git-${idx}`,
      name: doc.name,
      type: 'git' as const,
      path: doc.path
    }))
  ]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [viewingContent, setViewingContent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newDoc: Document = {
          id: `uploaded-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: 'uploaded',
          content,
          uploadedBy: 'Current User',
          uploadedAt: new Date(),
          size: file.size,
          mimeType: file.type
        };

        setDocuments(prev => [...prev, newDoc]);

        // Save to localStorage
        const storageKey = `project-${projectId}-documents`;
        const existingDocs = JSON.parse(localStorage.getItem(storageKey) || '[]');
        localStorage.setItem(storageKey, JSON.stringify([...existingDocs, newDoc]));
      };

      reader.readAsText(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    setDocuments(prev => prev.filter(doc => doc.id !== docId));

    // Update localStorage
    const storageKey = `project-${projectId}-documents`;
    const updatedDocs = documents.filter(doc => doc.id !== docId);
    localStorage.setItem(storageKey, JSON.stringify(updatedDocs.filter(d => d.type === 'uploaded')));

    if (selectedDoc?.id === docId) {
      setSelectedDoc(null);
      setViewingContent(null);
    }
  };

  const handleViewDocument = async (doc: Document) => {
    setSelectedDoc(doc);

    if (doc.type === 'git' && doc.path) {
      // In a real app, fetch from server or git
      // For now, we'll just show a placeholder
      setViewingContent(`# ${doc.name}\n\nThis is a Git repository document. Content would be loaded from: ${doc.path}\n\n## Features\n- Document tracking\n- Version control\n- Collaborative editing`);
    } else if (doc.content) {
      setViewingContent(doc.content);
    }
  };

  const handleDownloadDocument = (doc: Document) => {
    let content = '';
    let fileName = doc.name;

    if (doc.type === 'git') {
      content = `Git document: ${doc.name}\nPath: ${doc.path}`;
    } else if (doc.content) {
      content = doc.content;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const extractText = (doc: Document): string => {
    if (doc.content) {
      // Strip markdown formatting for plain text extraction
      return doc.content
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/`{1,3}/g, '');
    }
    return '';
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
        </h2>

        {isEditMode && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".md,.txt,.pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Documents ({filteredDocuments.length})
          </h3>

          {filteredDocuments.map(doc => (
            <div
              key={doc.id}
              className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${
                selectedDoc?.id === doc.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => handleViewDocument(doc)}
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

                <div className="flex gap-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDocument(doc);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadDocument(doc);
                    }}
                    className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {isEditMode && doc.type === 'uploaded' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id);
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
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

        {/* Document Viewer */}
        <div className="border rounded-lg">
          {selectedDoc && viewingContent ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">{selectedDoc.name}</h3>
                <button
                  onClick={() => {
                    setSelectedDoc(null);
                    setViewingContent(null);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[500px] prose prose-sm max-w-none">
                <ReactMarkdown>{viewingContent}</ReactMarkdown>
              </div>
              <div className="p-4 border-t bg-gray-50">
                <button
                  onClick={() => {
                    const text = extractText(selectedDoc);
                    navigator.clipboard.writeText(text);
                    alert('Text extracted and copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                >
                  Extract & Copy Text
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 p-12">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4" />
                <p>Select a document to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDocuments;
