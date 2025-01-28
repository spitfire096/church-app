'use strict';

'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  content: string;
  variables: string[];
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/email-templates');
      setTemplates(response.data.templates);
      if (response.data.templates.length > 0) {
        setSelectedTemplate(response.data.templates[0]);
      }
    } catch (error) {
      setError('Failed to fetch email templates');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.patch(`/email-templates/${selectedTemplate.id}`, {
        subject: selectedTemplate.subject,
        content: selectedTemplate.content,
      });
      setSuccess('Template updated successfully');
    } catch (error) {
      setError('Failed to update template');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!selectedTemplate) return;

    setError('');
    setSuccess('');

    try {
      await api.post(`/email-templates/${selectedTemplate.id}/test`);
      setSuccess('Test email sent successfully');
    } catch (error) {
      setError('Failed to send test email');
      console.error('Error:', error);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="p-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Email Templates</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage email notification templates.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Templates
                  </h3>
                  <nav className="space-y-1">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                          selectedTemplate?.id === template.id
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {template.name}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              {selectedTemplate && (
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                          Subject
                        </label>
                        <input
                          type="text"
                          name="subject"
                          id="subject"
                          value={selectedTemplate.subject}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            subject: e.target.value,
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available Variables
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplate.variables.map((variable) => (
                            <span
                              key={variable}
                              className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                            >
                              {variable}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content
                        </label>
                        <Editor
                          value={selectedTemplate.content}
                          onChange={(content) => setSelectedTemplate({
                            ...selectedTemplate,
                            content,
                          })}
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={handleTestEmail}
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Send Test Email
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTemplate}
                          disabled={saving}
                          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 