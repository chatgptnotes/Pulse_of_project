import React, { useState } from 'react';
import { Link2, Copy, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const ShareProjectLink = ({ shareToken, projectName }) => {
  const [copied, setCopied] = useState(false);

  if (!shareToken) {
    return null; // Don't show component if no share token
  }

  // Generate the full share URL
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/client/${shareToken}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Share link copied to clipboard!');

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    }
  };

  const openInNewTab = () => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-900">
          Client Share Link
        </h3>
      </div>

      {/* Project Name */}
      {projectName && (
        <p className="text-xs text-gray-600 mb-2">
          Share <span className="font-medium">{projectName}</span> with your client
        </p>
      )}

      {/* Share URL Display */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm text-gray-700 font-mono truncate">
            {shareUrl}
          </code>

          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
            title="Copy link"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {/* Open in New Tab Button */}
          <button
            onClick={openInNewTab}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden md:inline">Preview</span>
          </button>
        </div>
      </div>

      {/* Info Text */}
      <div className="flex items-start gap-2 text-xs text-gray-600">
        <svg className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          This link provides read-only access to this project.
          No login required. Share it with your client via email or messaging.
        </p>
      </div>

      {/* Optional: QR Code section (can be added later) */}
      {/* <div className="mt-3 pt-3 border-t border-gray-200">
        <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
          Generate QR Code
        </button>
      </div> */}
    </div>
  );
};

export default ShareProjectLink;
