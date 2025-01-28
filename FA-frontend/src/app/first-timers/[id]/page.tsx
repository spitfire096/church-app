'use strict';

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface FirstTimer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  dateOfBirth?: string;
  serviceDate: string;
  followUpTasks: FollowUpTask[];
}

interface FollowUpTask {
  id: number;
  status: 'pending' | 'in_progress' | 'completed';
  notes: string;
  dueDate: string;
  completedDate?: string;
}

export default function FirstTimerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [firstTimer, setFirstTimer] = useState<FirstTimer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState({
    notes: '',
    dueDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchFirstTimer();
  }, [params.id]);

  const fetchFirstTimer = async () => {
    try {
      const response = await api.get(`/first-timers/${params.id}`);
      setFirstTimer(response.data);
    } catch (error) {
      setError('Failed to fetch first timer details');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/first-timers/${params.id}/follow-up`, newTask);
      fetchFirstTimer();
      setNewTask({
        notes: '',
        dueDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      setError('Failed to add follow-up task');
      console.error('Error:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, status: string) => {
    try {
      await api.patch(`/follow-up-tasks/${taskId}`, { status });
      fetchFirstTimer();
    } catch (error) {
      setError('Failed to update task status');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!firstTimer) {
    return <div className="p-6">First timer not found</div>;
  }

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              {firstTimer.firstName} {firstTimer.lastName}
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Personal Information
              </h3>
              <div className="mt-5 border-t border-gray-200">
                <dl className="divide-y divide-gray-200">
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {firstTimer.email}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {firstTimer.phoneNumber}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {firstTimer.address || 'Not provided'}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Service Date</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {new Date(firstTimer.serviceDate).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Follow-up Tasks
              </h3>
              <div className="mt-5">
                <form onSubmit={handleAddTask} className="space-y-4">
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      required
                      value={newTask.notes}
                      onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                      Due Date
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      required
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Add Task
                  </button>
                </form>

                <div className="mt-6 flow-root">
                  <ul className="-my-5 divide-y divide-gray-200">
                    {firstTimer.followUpTasks.map((task) => (
                      <li key={task.id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {task.notes}
                            </p>
                            <p className="text-sm text-gray-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 