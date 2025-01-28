'use strict';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface EmailProvider {
  id: string;
  name: 'Gmail' | 'Outlook' | 'SMTP';
  isConnected: boolean;
  email?: string;
  lastSyncedAt?: string;
}

interface EmailStats {
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  totalRecipients: number;
}

export default function EmailIntegration() {
  const [providers, setProviders] = useState<EmailProvider[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    loadEmailIntegrations();
  }, []);

  const loadEmailIntegrations = async () => {
    try {
      setIsLoading(true);
      const [providersData, statsData] = await Promise.all([
        api.email.providers.list(),
        api.email.stats.get()
      ]);
      setProviders(providersData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load email integrations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (providerId: string) => {
    try {
      setIsConnecting(true);
      const authUrl = await api.email.providers.getAuthUrl(providerId);
      window.location.href = authUrl;
    } catch (err) {
      alert('Failed to initiate connection');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (providerId: string) => {
    if (!confirm('Are you sure you want to disconnect this email provider?')) return;

    try {
      await api.email.providers.disconnect(providerId);
      setProviders(current =>
        current.map(p => p.id === providerId ? { ...p, isConnected: false, email: undefined } : p)
      );
    } catch (err) {
      alert('Failed to disconnect provider');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Email Integration</h2>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Email Providers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <div key={provider.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={`/images/${provider.name.toLowerCase()}-logo.svg`}
                      alt={`${provider.name} logo`}
                      className="h-8 w-8"
                    />
                    <h3 className="ml-3 text-lg font-medium text-gray-900">{provider.name}</h3>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    provider.isConnected
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {provider.isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                {provider.isConnected ? (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-500">
                      Connected as: {provider.email}
                    </p>
                    {provider.lastSyncedAt && (
                      <p className="text-sm text-gray-500">
                        Last synced: {new Date(provider.lastSyncedAt).toLocaleString()}
                      </p>
                    )}
                    <button
                      onClick={() => handleDisconnect(provider.id)}
                      className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(provider.id)}
                    disabled={isConnecting}
                    className={`mt-4 w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                      ${isConnecting
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                    {isConnecting ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Email Stats */}
          {stats && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Email Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Recipients</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {stats.totalRecipients}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Sent</p>
                  <p className="mt-1 text-2xl font-semibold text-blue-600">
                    {stats.sent}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Opened</p>
                  <p className="mt-1 text-2xl font-semibold text-green-600">
                    {stats.opened}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Clicked</p>
                  <p className="mt-1 text-2xl font-semibold text-yellow-600">
                    {stats.clicked}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Bounced</p>
                  <p className="mt-1 text-2xl font-semibold text-red-600">
                    {stats.bounced}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 