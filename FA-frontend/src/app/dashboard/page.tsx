'use strict';

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserGroupIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

interface DashboardStats {
  totalFirstTimers: number;
  recentFirstTimers: {
    id: number;
    firstName: string;
    lastName: string;
    serviceDate: string;
  }[];
  followUpStats: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  upcomingTasks: {
    id: number;
    notes: string;
    dueDate: string;
    firstTimer: {
      id: number;
      firstName: string;
      lastName: string;
    };
  }[];
}

const defaultStats: DashboardStats = {
  totalFirstTimers: 0,
  recentFirstTimers: [],
  followUpStats: {
    pending: 0,
    inProgress: 0,
    completed: 0
  },
  upcomingTasks: []
};

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      if (err instanceof AxiosError) {
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setError(`Error: ${err.response.data.message || 'Failed to fetch data'}`);
        } else if (err.request) {
          // The request was made but no response was received
          setError('No response received from server');
        } else {
          // Something happened in setting up the request
          setError('Error setting up the request');
        }
      } else {
        setError('An unexpected error occurred');
      }
      // Still use default stats even when there's an error
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-32 rounded-lg shadow"></div>
            ))}
          </div>
        </div>
      </div>
    );
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
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total First Timers
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats?.totalFirstTimers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Follow-ups
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats?.followUpStats.pending}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed Follow-ups
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats?.followUpStats.completed}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Recent First Timers
              </h3>
              <div className="mt-5 flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {stats?.recentFirstTimers.map((person) => (
                    <li key={person.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {person.firstName} {person.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Service Date: {new Date(person.serviceDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Link
                            href={`/first-timers/${person.id}`}
                            className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    href="/first-timers"
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View all
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Upcoming Follow-ups
              </h3>
              <div className="mt-5 flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {stats?.upcomingTasks.map((task) => (
                    <li key={task.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {task.firstTimer.firstName} {task.firstTimer.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {task.notes}
                          </p>
                        </div>
                        <div>
                          <Link
                            href={`/first-timers/${task.firstTimer.id}`}
                            className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    href="/follow-ups"
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View all
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Icons
function UserGroupIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
} 