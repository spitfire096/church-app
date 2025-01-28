'use strict';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  trigger: 'immediate' | '24h' | '1week' | '1month';
  isActive: boolean;
}

interface EmailLog {
  id: number;
  templateId: number;
  firstTimerId: number;
  recipientEmail: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt?: string;
  error?: string;
}

export default function AutomatedEmailSystem() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    loadTemplatesAndLogs();
  }, []);

  const loadTemplatesAndLogs = async () => {
    try {
      setIsLoading(true);
      const [templatesData, logsData] = await Promise.all([
        api.emails.templates.list(),
        api.emails.logs.list()
      ]);
      setTemplates(templatesData);
      setLogs(logsData);
    } catch (err) {
      setError('Failed to load email system data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateUpdate = async (template: EmailTemplate) => {
    try {
      const updated = await api.emails.templates.update(template.id, template);
      setTemplates(current =>
        current.map(t => t.id === updated.id ? updated : t)
      );
      setEditingTemplate(null);
    } catch (err) {
      alert('Failed to update template');
    }
  };

  const handleTemplateToggle = async (id: number, isActive: boolean) => {
    try {
      const updated = await api.emails.templates.toggle(id, isActive);
      setTemplates(current =>
        current.map(t => t.id === updated.id ? updated : t)
      );
    } catch (err) {
      alert('Failed to toggle template status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Automated Email System</h2>
        <button
          onClick={() => setEditingTemplate({
            id: 0,
            name: '',
            subject: '',
            body: '',
            trigger: 'immediate',
            isActive: true
          })}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Add Template
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Email Templates */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {templates.map((template) => (
                <li key={template.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">Trigger: {template.trigger}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setEditingTemplate(template)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={template.isActive}
                          onChange={(e) => handleTemplateToggle(template.id, e.target.checked)}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-600">Active</span>
                      </label>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Email Logs */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900">Recent Email Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {templates.find(t => t.id === log.templateId)?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.recipientEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          {
                            sent: 'bg-green-100 text-green-800',
                            failed: 'bg-red-100 text-red-800',
                            pending: 'bg-yellow-100 text-yellow-800',
                          }[log.status]
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.sentAt ? new Date(log.sentAt).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Template Edit Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingTemplate.id === 0 ? 'Add Template' : 'Edit Template'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleTemplateUpdate(editingTemplate);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      name: e.target.value
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      subject: e.target.value
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Body</label>
                  <textarea
                    rows={6}
                    value={editingTemplate.body}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      body: e.target.value
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trigger</label>
                  <select
                    value={editingTemplate.trigger}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      trigger: e.target.value as EmailTemplate['trigger']
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="24h">After 24 Hours</option>
                    <option value="1week">After 1 Week</option>
                    <option value="1month">After 1 Month</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 