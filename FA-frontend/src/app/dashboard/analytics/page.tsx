'use strict';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { api } from '@/lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsData {
  growthMetrics: {
    weeklyGrowth: number;
    monthlyGrowth: number;
    yearlyGrowth: number;
    retentionRate: number;
  };
  demographicMetrics: {
    ageGroups: Record<string, number>;
    occupations: Record<string, number>;
    locations: Record<string, number>;
  };
  engagementMetrics: {
    averageVisits: number;
    feedbackRate: number;
    followUpResponseRate: number;
  };
  trends: {
    dates: string[];
    firstTimers: number[];
    returningVisitors: number[];
  };
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const analyticsData = await api.analytics.get(timeRange);
      setData(analyticsData);
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadAnalytics}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const trendsData = {
    labels: data.trends.dates,
    datasets: [
      {
        label: 'First Timers',
        data: data.trends.firstTimers,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
      {
        label: 'Returning Visitors',
        data: data.trends.returningVisitors,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
      },
    ],
  };

  const demographicsData = {
    labels: Object.keys(data.demographicMetrics.ageGroups),
    datasets: [{
      data: Object.values(data.demographicMetrics.ageGroups),
      backgroundColor: [
        'rgba(59, 130, 246, 0.5)',
        'rgba(16, 185, 129, 0.5)',
        'rgba(245, 158, 11, 0.5)',
        'rgba(239, 68, 68, 0.5)',
      ],
    }],
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Time Range Selector */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {/* Growth Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Weekly Growth</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {data.growthMetrics.weeklyGrowth}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Monthly Growth</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {data.growthMetrics.monthlyGrowth}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Yearly Growth</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {data.growthMetrics.yearlyGrowth}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Retention Rate</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {data.growthMetrics.retentionRate}%
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Visitor Trends</h3>
            <Line data={trendsData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Age Distribution</h3>
            <Doughnut data={demographicsData} />
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Visits</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {data.engagementMetrics.averageVisits}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Feedback Rate</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {data.engagementMetrics.feedbackRate}%
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Follow-up Response Rate</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {data.engagementMetrics.followUpResponseRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Location Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Location Distribution</h3>
          <div className="space-y-4">
            {Object.entries(data.demographicMetrics.locations).map(([location, count]) => (
              <div key={location} className="flex items-center">
                <div className="w-32 text-sm text-gray-600">{location}</div>
                <div className="flex-1">
                  <div className="relative h-4 bg-gray-200 rounded-full">
                    <div
                      className="absolute h-4 bg-blue-500 rounded-full"
                      style={{
                        width: `${(count / Math.max(...Object.values(data.demographicMetrics.locations))) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right text-sm text-gray-600">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 