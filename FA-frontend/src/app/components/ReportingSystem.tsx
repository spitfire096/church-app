'use strict';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ReportData {
  trends: {
    date: string;
    count: number;
  }[];
  demographics: {
    students: number;
    professionals: number;
    others: number;
  };
  sources: {
    [key: string]: number;
  };
  retention: {
    returned: number;
    notReturned: number;
  };
}

export default function ReportingSystem() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      const data = await api.reports.getStats(dateRange);
      setReportData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const trendsChartData = {
    labels: reportData?.trends.map(t => t.date) || [],
    datasets: [
      {
        label: 'First Timers',
        data: reportData?.trends.map(t => t.count) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  const demographicsChartData = {
    labels: ['Students', 'Professionals', 'Others'],
    datasets: [
      {
        data: reportData ? [
          reportData.demographics.students,
          reportData.demographics.professionals,
          reportData.demographics.others,
        ] : [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(245, 158, 11, 0.5)',
        ],
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={loadReportData}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-end">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Trends Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">First Timer Trends</h3>
          <Line data={trendsChartData} />
        </div>

        {/* Demographics Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Demographics</h3>
          <Pie data={demographicsChartData} />
        </div>

        {/* Source Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Source Distribution</h3>
          <div className="space-y-4">
            {reportData && Object.entries(reportData.sources).map(([source, count]) => (
              <div key={source} className="flex items-center">
                <div className="w-32 text-sm text-gray-600">{source}</div>
                <div className="flex-1">
                  <div className="relative h-4 bg-gray-200 rounded-full">
                    <div
                      className="absolute h-4 bg-blue-500 rounded-full"
                      style={{
                        width: `${(count / Object.values(reportData.sources).reduce((a, b) => a + b, 0)) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right text-sm text-gray-600">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Retention Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Retention Rate</h3>
          {reportData && (
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {Math.round((reportData.retention.returned / 
                  (reportData.retention.returned + reportData.retention.notReturned)) * 100)}%
              </div>
              <p className="text-sm text-gray-500 mt-2">Return Rate</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-semibold text-green-600">
                    {reportData.retention.returned}
                  </div>
                  <p className="text-sm text-gray-500">Returned</p>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-red-600">
                    {reportData.retention.notReturned}
                  </div>
                  <p className="text-sm text-gray-500">Not Returned</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 