'use strict';

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CSVLink } from 'react-csv';
import { useAuth } from '../contexts/AuthContext';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ErrorBoundary from '@/components/ErrorBoundary';

interface FirstTimer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  postalCode: string;
  isStudent: boolean;
  studentDetails?: string;
  isBornAgain: boolean;
  bornAgainDate?: string;
  isWaterBaptized: boolean;
  waterBaptismDate?: string;
  prayerRequest: string;
  serviceDate: string;
  status: string;
  notes?: string;
}

interface Filters {
  search: string;
  dateFrom: string;
  dateTo: string;
  status: string;
}

interface PaginatedResponse {
  firstTimers: FirstTimer[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export default function FirstTimersPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [firstTimers, setFirstTimers] = useState<FirstTimer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>({
    search: '',
    dateFrom: '',
    dateTo: '',
    status: 'all',
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchFirstTimers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/first-timers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setFirstTimers(data);
      setError('');
    } catch (error) {
      console.error('Error fetching first timers:', error);
      setFirstTimers([]);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchFirstTimers();
  }, [isAuthenticated, router, refreshKey]);

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getExportData = () => {
    try {
      return firstTimers.map(timer => ({
        'First Name': timer.firstName,
        'Last Name': timer.lastName,
        'Email': timer.email,
        'Phone': timer.phone,
        'Service Date': new Date(timer.serviceDate).toLocaleDateString(),
        'Status': timer.status
      }));
    } catch (error) {
      console.error('Error preparing export data:', error);
      return [];
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'New';
      case 'contacted':
        return 'Contacted';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'No Status';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
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
              <h1 className="text-2xl font-semibold text-gray-900">First Timers</h1>
              <p className="mt-2 text-sm text-gray-700">
                A list of all first-time visitors and their follow-up status.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <CSVLink
                data={getExportData()}
                filename="first-timers.csv"
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Export CSV
              </CSVLink>
              <Link
                href="/first-timers/new"
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Add First Timer
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                name="search"
                id="search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Name or email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700">
                From Date
              </label>
              <input
                type="date"
                name="dateFrom"
                id="dateFrom"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700">
                To Date
              </label>
              <input
                type="date"
                name="dateTo"
                id="dateTo"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Follow-up Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="none">No Follow-up</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  {firstTimers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No first timers found matching your criteria.
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Name
                          </th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Contact
                          </th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Service Date
                          </th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Status
                          </th>
                          <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {firstTimers.map((timer) => (
                          <tr key={timer.id}>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                              {timer.firstName} {timer.lastName}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <div>{timer.email}</div>
                              <div>{timer.phone}</div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {new Date(timer.serviceDate).toLocaleDateString()}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(timer.status)}`}>
                                {getStatusText(timer.status)}
                              </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <Link
                                href={`/first-timers/${timer.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View<span className="sr-only">, {timer.firstName}</span>
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