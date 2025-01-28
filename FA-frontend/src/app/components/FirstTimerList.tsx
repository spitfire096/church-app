'use strict';

import { useEffect, useState } from 'react';
import { api, type FirstTimer } from '@/lib/api';
import FirstTimerFilters from './FirstTimerFilters';
import Pagination from './Pagination';
import Link from 'next/link';

const ITEMS_PER_PAGE = 10;

interface FilterState {
  dateRange: 'all' | 'today' | 'week' | 'month';
  status: 'all' | 'visitor' | 'firstTimer';
  isStudent: 'all' | 'yes' | 'no';
}

export default function FirstTimerList() {
  const [firstTimers, setFirstTimers] = useState<FirstTimer[]>([]);
  const [filteredTimers, setFilteredTimers] = useState<FirstTimer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    status: 'all',
    isStudent: 'all'
  });

  useEffect(() => {
    loadFirstTimers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, firstTimers]);

  const loadFirstTimers = async () => {
    try {
      setIsLoading(true);
      const data = await api.firstTimers.list();
      setFirstTimers(data);
      setFilteredTimers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load first timers');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...firstTimers];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ft => 
        ft.firstName.toLowerCase().includes(query) ||
        ft.lastName.toLowerCase().includes(query) ||
        ft.email.toLowerCase().includes(query) ||
        ft.phoneNumber.includes(query)
      );
    }

    // Apply date range filter
    const now = new Date();
    switch (filters.dateRange) {
      case 'today':
        filtered = filtered.filter(ft => {
          const date = new Date(ft.serviceDate);
          return date.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = filtered.filter(ft => new Date(ft.serviceDate) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = filtered.filter(ft => new Date(ft.serviceDate) >= monthAgo);
        break;
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(ft => 
        filters.status === 'visitor' ? ft.visitingMember : !ft.visitingMember
      );
    }

    // Apply student filter
    if (filters.isStudent !== 'all') {
      filtered = filtered.filter(ft => 
        filters.isStudent === 'yes' ? ft.isStudent : !ft.isStudent
      );
    }

    setFilteredTimers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await api.firstTimers.delete(id);
      setFirstTimers(firstTimers.filter(ft => ft.id !== id));
    } catch (err) {
      alert('Failed to delete record');
      console.error(err);
    }
  };

  const paginatedTimers = filteredTimers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredTimers.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={loadFirstTimers}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FirstTimerFilters
        onSearch={setSearchQuery}
        onFilterChange={setFilters}
        filters={filters}
      />

      {filteredTimers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No first timers found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTimers.map((firstTimer) => (
                  <tr key={firstTimer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        href={`/dashboard/first-timers/${firstTimer.id}`}
                        className="group"
                      >
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                              {firstTimer.firstName} {firstTimer.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {firstTimer.email}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(firstTimer.serviceDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{firstTimer.phoneNumber}</div>
                      <div className="text-sm text-gray-500">{firstTimer.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${firstTimer.visitingMember ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {firstTimer.visitingMember ? 'Visiting Member' : 'First Timer'}
                      </span>
                      {firstTimer.isStudent && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Student
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(firstTimer.id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
} 