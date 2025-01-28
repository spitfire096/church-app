'use strict';

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';

interface FirstTimer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceDate: string;
}

interface FollowUp {
  id: number;
  firstTimer: FirstTimer;
  status: string;
  notes: string;
  dueDate: string;
  assignedTo: string;
}

export default function FollowUpsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/follow-ups');
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setFollowUps(data);
      setError('');
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
      setFollowUps([]);
      setError('Failed to load follow-ups data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchFollowUps();
  }, [isAuthenticated, router]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-20 rounded-lg shadow"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Follow-ups</h1>
              <p className="mt-2 text-sm text-gray-700">
                A list of all follow-up tasks and their current status.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  {followUps.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No follow-ups found.
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            First Timer
                          </th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Due Date
                          </th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Status
                          </th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Notes
                          </th>
                          <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {followUps.map((followUp) => (
                          <tr key={followUp.id}>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                              <div>{followUp.firstTimer.firstName} {followUp.firstTimer.lastName}</div>
                              <div className="text-gray-500">{followUp.firstTimer.email}</div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {new Date(followUp.dueDate).toLocaleDateString()}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(followUp.status)}`}>
                                {followUp.status}
                              </span>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              {followUp.notes}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <Link
                                href={`/follow-ups/${followUp.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View<span className="sr-only">, {followUp.firstTimer.firstName}</span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
} 