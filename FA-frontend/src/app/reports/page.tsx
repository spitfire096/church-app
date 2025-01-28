'use strict';

'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ReportData {
  firstTimerTrends: {
    labels: string[];
    data: number[];
  };
  followUpStats: {
    labels: string[];
    data: number[];
  };
  serviceAttendance: {
    labels: string[];
    data: number[];
  };
  conversionRate: {
    labels: string[];
    data: number[];
  };
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('month'); // month, quarter, year

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      const response = await api.get('/reports', {
        params: { range: dateRange }
      });
      setReportData(response.data);
    } catch (error) {
      setError('Failed to fetch report data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white h-80 rounded-lg shadow"></div>
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
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
            <p className="mt-2 text-sm text-gray-700">
              Detailed insights and statistics about first-time visitors and follow-ups.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {reportData && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">First Timer Trends</h3>
                <div className="h-80">
                  <Line
                    data={{
                      labels: reportData.firstTimerTrends.labels,
                      datasets: [
                        {
                          label: 'First Time Visitors',
                          data: reportData.firstTimerTrends.data,
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Follow-up Status Distribution</h3>
                <div className="h-80">
                  <Pie
                    data={{
                      labels: reportData.followUpStats.labels,
                      datasets: [
                        {
                          data: reportData.followUpStats.data,
                          backgroundColor: [
                            'rgba(239, 68, 68, 0.5)',
                            'rgba(245, 158, 11, 0.5)',
                            'rgba(34, 197, 94, 0.5)',
                          ],
                          borderColor: [
                            'rgb(239, 68, 68)',
                            'rgb(245, 158, 11)',
                            'rgb(34, 197, 94)',
                          ],
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Service Attendance</h3>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: reportData.serviceAttendance.labels,
                      datasets: [
                        {
                          label: 'Attendance',
                          data: reportData.serviceAttendance.data,
                          backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">First Timer to Regular Conversion</h3>
                <div className="h-80">
                  <Line
                    data={{
                      labels: reportData.conversionRate.labels,
                      datasets: [
                        {
                          label: 'Conversion Rate',
                          data: reportData.conversionRate.data,
                          borderColor: 'rgb(34, 197, 94)',
                          backgroundColor: 'rgba(34, 197, 94, 0.5)',
                        },
                      ],
                    }}
                    options={{
                      ...chartOptions,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            callback: (value) => `${value}%`,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 