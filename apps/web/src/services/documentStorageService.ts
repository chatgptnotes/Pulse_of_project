/**
 * Document Storage Service
 *
 * Handles all document upload, download, and management operations
 * using Supabase Storage and the project_documents table.
 */

import supabaseService from './supabaseService';

const BUCKET_NAME = 'neuro_bucket';

export interface DocumentMetadata {
  id?: string;
  project_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type?: string;
  uploaded_by: string;
  uploaded_at?: string;
  updated_at?: string;
  description?: string;
  tags?: string[];
  is_public?: boolean;
  external_url?: string; // For Google Docs, Sheets, or other website links
  is_external_link?: boolean; // Flag to indicate this is an external link, not an uploaded file
}

export interface UploadResult {
  success: boolean;
  document?: DocumentMetadata;
  error?: string;
  publicUrl?: string;
}

export interface DownloadResult {
  success: boolean;
  data?: Blob;
  url?: string;
  error?: string;
}

class DocumentStorageService {
  private supabase = supabaseService.supabase;

  /**
   * Upload a file to Supabase Storage and create metadata record
   */
  async uploadDocument(
    file: File,
    projectId: string,
    uploadedBy: string,
    options?: {
      description?: string;
      tags?: string[];
      isPublic?: boolean;
    }
  ): Promise<UploadResult> {
    try {
      // Validate file size (50MB limit)
      const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: 'File size exceeds 50MB limit'
        };
      }

      // Generate unique file path: {project-id}/{timestamp}-{filename}
      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${projectId}/${timestamp}-${sanitizedFilename}`;

      console.log('📤 Uploading file to Supabase Storage:', filePath);

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        return {
          success: false,
          error: uploadError.message
        };
      }

      console.log('✅ File uploaded successfully:', uploadData);

      // Get file type from extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const fileType = this.getFileType(fileExtension);

      // Create metadata record in database
      const metadata: Omit<DocumentMetadata, 'id'> = {
        project_id: projectId,
        filename: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: fileType,
        mime_type: file.type,
        uploaded_by: uploadedBy,
        description: options?.description,
        tags: options?.tags || [],
        is_public: options?.isPublic || false
      };

      const { data: documentData, error: dbError } = await this.supabase
        .from('project_documents')
        .insert(metadata)
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database error:', dbError);

        // Clean up uploaded file if database insert fails
        await this.supabase.storage
          .from(BUCKET_NAME)
          .remove([filePath]);

        return {
          success: false,
          error: dbError.message
        };
      }

      console.log('✅ Document metadata saved to database');

      // Get public URL (even for private buckets, this generates a signed URL)
      const { data: urlData } = this.supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        success: true,
        document: documentData as DocumentMetadata,
        publicUrl: urlData.publicUrl
      };

    } catch (error) {
      console.error('❌ Upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleDocuments(
    files: File[],
    projectId: string,
    uploadedBy: string,
    options?: {
      description?: string;
      tags?: string[];
      isPublic?: boolean;
    }
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadDocument(file, projectId, uploadedBy, options);
      results.push(result);
    }

    return results;
  }

  /**
   * Add an external link (Google Docs, Sheets, or any website)
   */
  async addExternalLink(
    url: string,
    projectId: string,
    uploadedBy: string,
    options: {
      title: string;
      description: string;
      tags?: string[];
      isPublic?: boolean;
    }
  ): Promise<UploadResult> {
    try {
      // Validate URL
      try {
        new URL(url);
      } catch {
        return {
          success: false,
          error: 'Invalid URL provided'
        };
      }

      // Determine link type from URL
      let linkType = 'link';
      if (url.includes('docs.google.com/spreadsheets')) {
        linkType = 'google-sheets';
      } else if (url.includes('docs.google.com/document')) {
        linkType = 'google-docs';
      } else if (url.includes('docs.google.com/presentation')) {
        linkType = 'google-slides';
      } else if (url.includes('drive.google.com')) {
        linkType = 'google-drive';
      }

      console.log('🔗 Adding external link:', url, 'Type:', linkType);

      // Create metadata record in database (no file upload needed)
      const metadata: Omit<DocumentMetadata, 'id'> = {
        project_id: projectId,
        filename: options.title,
        file_path: url, // Store URL in file_path for external links
        file_size: 0, // No file size for links
        file_type: linkType,
        mime_type: 'text/uri-list',
        uploaded_by: uploadedBy,
        description: options.description,
        tags: options.tags || [],
        is_public: options.isPublic || false,
        external_url: url,
        is_external_link: true
      };

      const { data: documentData, error: dbError } = await this.supabase
        .from('project_documents')
        .insert(metadata)
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database error:', dbError);
        return {
          success: false,
          error: dbError.message
        };
      }

      console.log('✅ External link saved to database');

      return {
        success: true,
        document: documentData as DocumentMetadata,
        publicUrl: url
      };

    } catch (error) {
      console.error('❌ Failed to add external link:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Download a file from Supabase Storage
   */
  async downloadDocument(filePath: string): Promise<DownloadResult> {
    try {
      console.log('📥 Downloading file:', filePath);

      const { data, error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .download(filePath);

      if (error) {
        console.error('❌ Download error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      console.log('✅ File downloaded successfully');

      return {
        success: true,
        data
      };

    } catch (error) {
      console.error('❌ Download failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get a signed URL for temporary access to a file
   */
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('❌ Error creating signed URL:', error);
        return null;
      }

      return data.signedUrl;

    } catch (error) {
      console.error('❌ Failed to create signed URL:', error);
      return null;
    }
  }

  /**
   * Get public URL for a file (works for public buckets or generates preview URL)
   */
  getPublicUrl(filePath: string): string {
    const { data } = this.supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Delete a document from storage and database
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting document:', documentId);

      // Get document metadata first
      const { data: document, error: fetchError } = await this.supabase
        .from('project_documents')
        .select('file_path, is_external_link')
        .eq('id', documentId)
        .single();

      if (fetchError || !document) {
        console.error('❌ Document not found:', fetchError);
        return false;
      }

      // Only delete from storage if it's not an external link
      if (!document.is_external_link) {
        const { error: storageError } = await this.supabase.storage
          .from(BUCKET_NAME)
          .remove([document.file_path]);

        if (storageError) {
          console.error('❌ Storage deletion error:', storageError);
          // Continue to delete database record even if storage deletion fails
        }
      }

      // Delete from database
      const { error: dbError } = await this.supabase
        .from('project_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) {
        console.error('❌ Database deletion error:', dbError);
        return false;
      }

      console.log('✅ Document deleted successfully');
      return true;

    } catch (error) {
      console.error('❌ Delete failed:', error);
      return false;
    }
  }

  /**
   * Get all documents for a project
   */
  async getProjectDocuments(projectId: string): Promise<DocumentMetadata[]> {
    try {
      const { data, error } = await this.supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching documents:', error);
        return [];
      }

      return data as DocumentMetadata[];

    } catch (error) {
      console.error('❌ Failed to fetch documents:', error);
      return [];
    }
  }

  /**
   * Update document metadata
   */
  async updateDocumentMetadata(
    documentId: string,
    updates: Partial<Pick<DocumentMetadata, 'description' | 'tags' | 'is_public'>>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('project_documents')
        .update(updates)
        .eq('id', documentId);

      if (error) {
        console.error('❌ Update error:', error);
        return false;
      }

      console.log('✅ Document metadata updated');
      return true;

    } catch (error) {
      console.error('❌ Update failed:', error);
      return false;
    }
  }

  /**
   * Search documents by filename, tags, or description
   */
  async searchDocuments(projectId: string, searchTerm: string): Promise<DocumentMetadata[]> {
    try {
      const { data, error } = await this.supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .or(`filename.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('❌ Search error:', error);
        return [];
      }

      return data as DocumentMetadata[];

    } catch (error) {
      console.error('❌ Search failed:', error);
      return [];
    }
  }

  /**
   * Get documents by file type
   */
  async getDocumentsByType(projectId: string, fileType: string): Promise<DocumentMetadata[]> {
    try {
      const { data, error } = await this.supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .eq('file_type', fileType)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching documents by type:', error);
        return [];
      }

      return data as DocumentMetadata[];

    } catch (error) {
      console.error('❌ Failed to fetch documents by type:', error);
      return [];
    }
  }

  /**
   * Helper: Determine file type from extension
   */
  private getFileType(extension: string): string {
    const typeMap: Record<string, string> = {
      // Documents
      pdf: 'document',
      doc: 'document',
      docx: 'document',
      txt: 'document',
      md: 'document',

      // Spreadsheets
      xls: 'spreadsheet',
      xlsx: 'spreadsheet',
      csv: 'spreadsheet',

      // Presentations
      ppt: 'presentation',
      pptx: 'presentation',

      // Images
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
      webp: 'image',
      svg: 'image',

      // Archives
      zip: 'archive',
      rar: 'archive',
      tar: 'archive',
      gz: 'archive'
    };

    return typeMap[extension] || 'other';
  }

  /**
   * Helper: Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Helper: Get file icon based on type
   */
  getFileIcon(fileType: string): string {
    const iconMap: Record<string, string> = {
      document: '📄',
      spreadsheet: '📊',
      presentation: '📽️',
      image: '🖼️',
      archive: '📦',
      other: '📎'
    };

    return iconMap[fileType] || '📎';
  }
}

// Export singleton instance
const documentStorageService = new DocumentStorageService();
export default documentStorageService;
