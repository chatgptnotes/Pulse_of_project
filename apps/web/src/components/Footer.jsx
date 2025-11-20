import React from 'react';

/**
 * Application Footer Component
 * Displays version, build date, and repository information
 * Automatically updates based on package.json version
 */
const Footer = () => {
  const version = import.meta.env.VITE_APP_VERSION || '1.0.0';
  const buildDate = import.meta.env.VITE_BUILD_DATE || new Date().toISOString().split('T')[0];
  const repoName = 'pulseofproject';
  const organization = 'Bettroi Solutions';

  return (
    <footer className="w-full bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
        {/* Left section - Copyright */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 dark:text-gray-500">©</span>
          <span>{new Date().getFullYear()} {organization}</span>
        </div>

        {/* Center section - Version info */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span className="text-gray-400 dark:text-gray-500">v</span>
            <span className="font-semibold text-gray-600 dark:text-gray-300">{version}</span>
          </span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className="flex items-center gap-1">
            <span className="text-gray-400 dark:text-gray-500">Updated:</span>
            <span className="text-gray-600 dark:text-gray-300">{buildDate}</span>
          </span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className="flex items-center gap-1">
            <span className="text-gray-400 dark:text-gray-500">Repo:</span>
            <span className="text-gray-600 dark:text-gray-300">{repoName}</span>
          </span>
        </div>

        {/* Right section - Additional info */}
        <div className="text-[10px] text-gray-400 dark:text-gray-500">
          PulseOfProject
        </div>
      </div>
    </footer>
  );
};

export default Footer;
