import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TestTube, CheckCircle, XCircle, AlertCircle, Clock,
  Plus, Edit2, Trash2, Save, X, Filter, User
} from 'lucide-react';
import bugTrackingService from '../../../services/bugTrackingService';

interface TestRecord {
  id: string;
  bug_report_id: string;
  project_name: string;
  test_case_name: string;
  test_description?: string;
  expected_result?: string;
  actual_result?: string;
  test_status: 'Pass' | 'Fail' | 'Blocked' | 'Pending';
  tester_name: string;
  test_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface Bug {
  id: string;
  sno: number;
  screen: string;
  snag: string;
  severity: 'P1' | 'P2' | 'P3';
  status: string;
}

interface TestingTrackerProps {
  projectName?: string;
  bugs: Bug[];
}

const TestingTracker: React.FC<TestingTrackerProps> = ({
  projectName = 'LinkList Project',
  bugs = []
}) => {
  const [testRecords, setTestRecords] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTest, setEditingTest] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBug, setFilterBug] = useState<string>('all');

  const [newTest, setNewTest] = useState<Partial<TestRecord>>({
    test_date: new Date().toISOString().split('T')[0],
    test_status: 'Pending',
    project_name: projectName === 'LinkList Project' ? 'LinkList' : 'Neuro360',
    tester_name: 'Current Tester'
  });

  const testStatuses = ['Pending', 'Pass', 'Fail', 'Blocked'];

  // Load test records on component mount
  useEffect(() => {
    loadTestRecords();
  }, [projectName]);

  const loadTestRecords = async () => {
    try {
      setLoading(true);
      const projectNameForDB = projectName === 'LinkList Project' ? 'LinkList' : 'Neuro360';
      const fetchedTests = await bugTrackingService.getTestRecords(null, projectNameForDB);
      setTestRecords(fetchedTests);
    } catch (error) {
      console.error('Error loading test records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTest = async () => {
    if (!newTest.bug_report_id || !newTest.test_case_name || !newTest.tester_name) {
      alert('Please fill in required fields: Bug Report, Test Case Name, and Tester Name');
      return;
    }

    try {
      setSaving(true);
      const testData = {
        ...newTest,
        project_name: projectName === 'LinkList Project' ? 'LinkList' : 'Neuro360'
      };

      await bugTrackingService.createTestRecord(testData);
      await loadTestRecords();

      // Reset form
      setNewTest({
        test_date: new Date().toISOString().split('T')[0],
        test_status: 'Pending',
        project_name: projectName === 'LinkList Project' ? 'LinkList' : 'Neuro360',
        tester_name: 'Current Tester'
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving test record:', error);
      alert('Failed to save test record. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTest = async (testId: string, updates: Partial<TestRecord>) => {
    try {
      await bugTrackingService.updateTestRecord(testId, updates);
      setTestRecords(testRecords.map(test =>
        test.id === testId ? { ...test, ...updates } : test
      ));
      setEditingTest(null);
    } catch (error) {
      console.error('Error updating test record:', error);
      alert('Failed to update test record. Please try again.');
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (confirm('Are you sure you want to delete this test record?')) {
      try {
        await bugTrackingService.deleteTestRecord(testId);
        setTestRecords(testRecords.filter(test => test.id !== testId));
      } catch (error) {
        console.error('Error deleting test record:', error);
        alert('Failed to delete test record. Please try again.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pass': return 'bg-green-100 text-green-700';
      case 'Fail': return 'bg-red-100 text-red-700';
      case 'Blocked': return 'bg-orange-100 text-orange-700';
      case 'Pending': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pass': return <CheckCircle className="w-4 h-4" />;
      case 'Fail': return <XCircle className="w-4 h-4" />;
      case 'Blocked': return <AlertCircle className="w-4 h-4" />;
      case 'Pending': return <Clock className="w-4 h-4" />;
      default: return <TestTube className="w-4 h-4" />;
    }
  };

  const getBugById = (bugId: string) => {
    return bugs.find(bug => bug.id === bugId);
  };

  const filteredTests = testRecords.filter(test => {
    if (filterStatus !== 'all' && test.test_status !== filterStatus) return false;
    if (filterBug !== 'all' && test.bug_report_id !== filterBug) return false;
    return true;
  });

  const testStats = {
    total: testRecords.length,
    passed: testRecords.filter(t => t.test_status === 'Pass').length,
    failed: testRecords.filter(t => t.test_status === 'Fail').length,
    blocked: testRecords.filter(t => t.test_status === 'Blocked').length,
    pending: testRecords.filter(t => t.test_status === 'Pending').length
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TestTube className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Testing Tracker</h2>
              <p className="text-blue-100">
                {projectName} - Test Case Management
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-blue-100 text-xs">Total Tests</p>
            <p className="text-white text-2xl font-bold">{testStats.total}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-blue-100 text-xs">Passed</p>
            <p className="text-white text-2xl font-bold">{testStats.passed}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-blue-100 text-xs">Failed</p>
            <p className="text-white text-2xl font-bold">{testStats.failed}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-blue-100 text-xs">Blocked</p>
            <p className="text-white text-2xl font-bold">{testStats.blocked}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-blue-100 text-xs">Pending</p>
            <p className="text-white text-2xl font-bold">{testStats.pending}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Filters */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              {testStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={filterBug}
              onChange={(e) => setFilterBug(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Bug Reports</option>
              {bugs.map(bug => (
                <option key={bug.id} value={bug.id}>
                  Bug #{bug.sno} - {bug.screen}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Test Case
          </button>
        </div>
      </div>

      {/* Add Test Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-blue-50 border-b border-blue-200"
          >
            <h3 className="text-lg font-semibold mb-4">Add New Test Case</h3>
            <div className="grid grid-cols-3 gap-4">
              <select
                value={newTest.bug_report_id}
                onChange={(e) => setNewTest({ ...newTest, bug_report_id: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Bug Report *</option>
                {bugs.map(bug => (
                  <option key={bug.id} value={bug.id}>
                    Bug #{bug.sno} - {bug.screen}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Test Case Name *"
                value={newTest.test_case_name}
                onChange={(e) => setNewTest({ ...newTest, test_case_name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <input
                type="text"
                placeholder="Tester Name *"
                value={newTest.tester_name}
                onChange={(e) => setNewTest({ ...newTest, tester_name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <textarea
                placeholder="Test Description"
                value={newTest.test_description}
                onChange={(e) => setNewTest({ ...newTest, test_description: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />

              <textarea
                placeholder="Expected Result"
                value={newTest.expected_result}
                onChange={(e) => setNewTest({ ...newTest, expected_result: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  value={newTest.test_date}
                  onChange={(e) => setNewTest({ ...newTest, test_date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  value={newTest.test_status}
                  onChange={(e) => setNewTest({ ...newTest, test_status: e.target.value as TestRecord['test_status'] })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {testStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTest({
                      test_date: new Date().toISOString().split('T')[0],
                      test_status: 'Pending',
                      project_name: projectName === 'LinkList Project' ? 'LinkList' : 'Neuro360',
                      tester_name: 'Current Tester'
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTest}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Test Case'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading test records...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bug</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Case</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tester</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTests.map((test) => {
                const relatedBug = getBugById(test.bug_report_id);
                return (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {relatedBug ? (
                        <div>
                          <div className="font-medium">Bug #{relatedBug.sno}</div>
                          <div className="text-gray-500 text-xs">{relatedBug.screen}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unknown Bug</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {test.test_case_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <div className="truncate" title={test.test_description}>
                        {test.test_description}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <div className="truncate" title={test.expected_result}>
                        {test.expected_result}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <div className="truncate" title={test.actual_result}>
                        {test.actual_result}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {editingTest === test.id ? (
                        <select
                          value={test.test_status}
                          onChange={(e) => handleUpdateTest(test.id, { test_status: e.target.value as TestRecord['test_status'] })}
                          className="text-xs px-2 py-1 rounded border"
                        >
                          {testStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.test_status)}`}>
                          {getStatusIcon(test.test_status)}
                          {test.test_status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {test.tester_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {test.test_date}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {editingTest === test.id ? (
                          <>
                            <button
                              onClick={() => setEditingTest(null)}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingTest(null)}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingTest(test.id)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Edit Test"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTest(test.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Delete Test"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && filteredTests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <TestTube className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No test records found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestingTracker;