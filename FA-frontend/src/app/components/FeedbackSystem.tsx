'use strict';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';

interface Feedback {
  id: number;
  firstTimerId: number;
  rating: number;
  experience: string;
  improvements: string;
  willReturn: boolean;
  createdAt: string;
}

export default function FeedbackSystem() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalResponses: 0,
    returnRate: 0,
  });
  const { lastMessage } = useWebSocket(process.env.NEXT_PUBLIC_WS_URL!);

  useEffect(() => {
    loadFeedback();
  }, []);

  useEffect(() => {
    if (lastMessage?.type === 'feedback') {
      setFeedback(current => [lastMessage.data, ...current]);
      updateStats([lastMessage.data, ...feedback]);
    }
  }, [lastMessage]);

  const loadFeedback = async () => {
    try {
      setIsLoading(true);
      const data = await api.feedback.list();
      setFeedback(data);
      updateStats(data);
    } catch (err) {
      setError('Failed to load feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (data: Feedback[]) => {
    const totalRating = data.reduce((sum, item) => sum + item.rating, 0);
    const willReturn = data.filter(item => item.willReturn).length;

    setStats({
      averageRating: data.length ? totalRating / data.length : 0,
      totalResponses: data.length,
      returnRate: data.length ? (willReturn / data.length) * 100 : 0,
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Feedback Analysis</h2>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
          <div className="mt-2 flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">
              {stats.averageRating.toFixed(1)}
            </span>
            <span className="ml-2 text-yellow-400">★</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-sm font-medium text-gray-500">Total Responses</h3>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-900">
              {stats.totalResponses}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-sm font-medium text-gray-500">Return Rate</h3>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-900">
              {stats.returnRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {feedback.map((item) => (
              <li key={item.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`h-5 w-5 ${
                            star <= item.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-3 text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.willReturn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.willReturn ? 'Will Return' : 'May Not Return'}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-900">{item.experience}</p>
                  {item.improvements && (
                    <p className="text-sm text-gray-500">
                      <strong>Suggestions:</strong> {item.improvements}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 