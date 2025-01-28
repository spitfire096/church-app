'use strict';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';

interface FollowUp {
  id: number;
  firstTimerId: number;
  firstName: string;
  lastName: string;
  status: 'pending' | 'contacted' | 'completed' | 'unreachable';
  notes: string;
  nextFollowUpDate?: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export default function FollowUpSystem() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);
  const { lastMessage } = useWebSocket(process.env.NEXT_PUBLIC_WS_URL!);

  useEffect(() => {
    loadFollowUps();
  }, []);

  useEffect(() => {
    if (lastMessage?.type === 'followUp') {
      setFollowUps(current => [...current, lastMessage.data]);
    }
  }, [lastMessage]);

  const loadFollowUps = async () => {
    try {
      setIsLoading(true);
      const data = await api.followUps.list();
      setFollowUps(data);
    } catch (err) {
      setError('Failed to load follow-ups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: FollowUp['status']) => {
    try {
      const updated = await api.followUps.updateStatus(id, status);
      setFollowUps(current =>
        current.map(fu => fu.id === id ? updated : fu)
      );
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAddNote = async (id: number, note: string) => {
    try {
      const updated = await api.followUps.addNote(id, note);
      setFollowUps(current =>
        current.map(fu => fu.id === id ? updated : fu)
      );
    } catch (err) {
      alert('Failed to add note');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Follow-up System</h2>
        <button
          onClick={loadFollowUps}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Refresh
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {followUps.map((followUp) => (
            <div
              key={followUp.id}
              className="bg-white p-4 rounded-lg shadow space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {followUp.firstName} {followUp.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Assigned to: {followUp.assignedTo}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  {
                    pending: 'bg-yellow-100 text-yellow-800',
                    contacted: 'bg-blue-100 text-blue-800',
                    completed: 'bg-green-100 text-green-800',
                    unreachable: 'bg-red-100 text-red-800',
                  }[followUp.status]
                }`}>
                  {followUp.status}
                </span>
              </div>

              <div className="space-y-2">
                <select
                  value={followUp.status}
                  onChange={(e) => handleStatusUpdate(followUp.id, e.target.value as FollowUp['status'])}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="completed">Completed</option>
                  <option value="unreachable">Unreachable</option>
                </select>

                <button
                  onClick={() => setSelectedFollowUp(followUp)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Add Note
                </button>
              </div>

              {followUp.nextFollowUpDate && (
                <p className="text-sm text-gray-500">
                  Next follow-up: {new Date(followUp.nextFollowUpDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      {selectedFollowUp && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add Note for {selectedFollowUp.firstName} {selectedFollowUp.lastName}
            </h3>
            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
              placeholder="Enter your note here..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddNote(selectedFollowUp.id, e.currentTarget.value);
                  setSelectedFollowUp(null);
                }
              }}
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedFollowUp(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const textarea = document.querySelector('textarea');
                  if (textarea) {
                    handleAddNote(selectedFollowUp.id, textarea.value);
                    setSelectedFollowUp(null);
                  }
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 