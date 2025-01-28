'use strict';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import { Editor } from '@tinymce/tinymce-react';

// Dynamic import for the email renderer
const EmailRenderer = dynamic(() => import('./EmailRenderer'), { ssr: false });

interface TemplateVariable {
  key: string;
  label: string;
  example: string;
}

interface PreviewData {
  firstName: string;
  lastName: string;
  email: string;
  serviceDate: string;
  customFields: Record<string, string>;
}

export default function EmailTemplatePreview() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [previewData, setPreviewData] = useState<PreviewData>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    serviceDate: new Date().toISOString().split('T')[0],
    customFields: {},
  });
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableVariables, setAvailableVariables] = useState<TemplateVariable[]>([]);

  useEffect(() => {
    loadTemplateVariables();
  }, []);

  const loadTemplateVariables = async () => {
    try {
      const variables = await api.email.templates.getVariables();
      setAvailableVariables(variables);
    } catch (err) {
      console.error('Failed to load template variables:', err);
    }
  };

  const handleTemplateChange = async (templateId: string) => {
    try {
      setIsLoading(true);
      setSelectedTemplate(templateId);
      const template = await api.email.templates.get(templateId);
      setHtmlContent(template.html);
    } catch (err) {
      alert('Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setIsSaving(true);
      await api.email.templates.update(selectedTemplate, {
        html: htmlContent,
      });
      alert('Template saved successfully!');
    } catch (err) {
      alert('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewDataChange = (field: keyof PreviewData, value: string) => {
    setPreviewData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getPreviewHtml = () => {
    let preview = htmlContent;
    // Replace variables in the template
    Object.entries(previewData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return preview;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Email Template Preview</h2>
        <div className="flex items-center space-x-4">
          <select
            value={previewMode}
            onChange={(e) => setPreviewMode(e.target.value as 'desktop' | 'mobile')}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="desktop">Desktop View</option>
            <option value="mobile">Mobile View</option>
          </select>
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving || !selectedTemplate}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${isSaving || !selectedTemplate
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Section */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
              value={htmlContent}
              onEditorChange={setHtmlContent}
              init={{
                height: 500,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
              }}
            />
          </div>

          {/* Available Variables */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Available Variables</h3>
            <div className="grid grid-cols-2 gap-2">
              {availableVariables.map((variable) => (
                <div
                  key={variable.key}
                  className="text-sm p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    const editor = (window as any).tinymce.activeEditor;
                    if (editor) {
                      editor.insertContent(`{{${variable.key}}}`);
                    }
                  }}
                >
                  <span className="font-medium">{variable.label}</span>
                  <br />
                  <span className="text-gray-500 text-xs">{{variable.key}}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          {/* Preview Data Form */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Preview Data</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    value={previewData.firstName}
                    onChange={(e) => handlePreviewDataChange('firstName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    value={previewData.lastName}
                    onChange={(e) => handlePreviewDataChange('lastName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={previewData.email}
                  onChange={(e) => handlePreviewDataChange('email', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Date</label>
                <input
                  type="date"
                  value={previewData.serviceDate}
                  onChange={(e) => handlePreviewDataChange('serviceDate', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <div className={`bg-white rounded-lg shadow overflow-hidden ${
            previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
          }`}>
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="text-sm font-medium text-gray-900">Preview</h3>
            </div>
            <div className="p-4">
              <EmailRenderer html={getPreviewHtml()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 