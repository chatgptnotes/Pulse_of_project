import React from 'react';
import { motion } from 'framer-motion';
import {
  Github, Gitlab, Slack, Webhook, Database, Cloud,
  CheckCircle, XCircle, Loader2, Plus, Settings
} from 'lucide-react';

interface IntegrationPanelProps {
  integrations: any;
  onConnect: (service: string) => void;
}

const IntegrationPanel: React.FC<IntegrationPanelProps> = ({
  integrations,
  onConnect
}) => {
  const integrationList = [
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      description: 'Track commits, PRs, and issues',
      connected: integrations.github.connected,
      stats: { commits: 147, prs: 23, issues: 45 }
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      icon: Gitlab,
      description: 'Monitor merge requests and CI/CD',
      connected: integrations.gitlab.connected,
      stats: { mrs: 18, pipelines: 56 }
    },
    {
      id: 'jira',
      name: 'Jira',
      icon: Database,
      description: 'Sync tickets and sprints',
      connected: integrations.jira.connected,
      stats: { tickets: 89, sprints: 5 }
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: Slack,
      description: 'Send notifications and updates',
      connected: integrations.slack.connected,
      stats: { channels: 3, alerts: 124 }
    },
    {
      id: 'webhook',
      name: 'Webhooks',
      icon: Webhook,
      description: 'Custom integrations via API',
      connected: false,
      stats: { endpoints: 2, calls: 1024 }
    }
  ];

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Integrations</h2>
        <p className="text-sm text-gray-500">
          Connect your tools for automatic progress tracking
        </p>
      </div>

      {/* Connected Services */}
      <div className="space-y-3">
        {integrationList.map((integration, idx) => {
          const Icon = integration.icon;
          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-lg border transition-all ${
                integration.connected
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    integration.connected ? 'bg-green-100' : 'bg-white'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      integration.connected ? 'text-green-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{integration.name}</h3>
                    <p className="text-xs text-gray-500">{integration.description}</p>
                  </div>
                </div>

                {integration.connected ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Connected</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onConnect(integration.id)}
                    className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>

              {integration.connected && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(integration.stats).slice(0, 2).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <p className="text-lg font-semibold text-green-700">{value}</p>
                        <p className="text-xs text-green-600 capitalize">{key}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-2 py-1 text-xs text-green-700 hover:bg-green-100 rounded transition-colors">
                    Configure →
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Add Custom Integration */}
      <button className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 transition-colors group">
        <div className="flex items-center justify-center gap-2 text-gray-500 group-hover:text-indigo-600">
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add Custom Integration</span>
        </div>
      </button>

      {/* Integration Settings */}
      <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-indigo-900">Auto-Sync Settings</h3>
          <Settings className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
            <span className="text-xs text-indigo-700">Real-time updates</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
            <span className="text-xs text-indigo-700">Smart notifications</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
            <span className="text-xs text-indigo-700">Auto-complete tasks</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default IntegrationPanel;