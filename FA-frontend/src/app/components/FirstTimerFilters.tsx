'use strict';

interface FilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterState) => void;
  filters: FilterState;
}

interface FilterState {
  dateRange: 'all' | 'today' | 'week' | 'month';
  status: 'all' | 'visitor' | 'firstTimer';
  isStudent: 'all' | 'yes' | 'no';
}

export default function FirstTimerFilters({ onSearch, onFilterChange, filters }: FilterProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
      {/* Search */}
      <div>
        <label htmlFor="search" className="sr-only">Search</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search by name, email, or phone..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date Range</label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ ...filters, dateRange: e.target.value as FilterState['dateRange'] })}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as FilterState['status'] })}
          >
            <option value="all">All</option>
            <option value="visitor">Visiting Member</option>
            <option value="firstTimer">First Timer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Student Status</label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={filters.isStudent}
            onChange={(e) => onFilterChange({ ...filters, isStudent: e.target.value as FilterState['isStudent'] })}
          >
            <option value="all">All</option>
            <option value="yes">Students</option>
            <option value="no">Non-Students</option>
          </select>
        </div>
      </div>
    </div>
  );
} 