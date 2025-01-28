'use strict';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      await api.auth.verifyEmail(token!);
      setStatus('success');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Verifying your email...</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800">Email verified successfully!</h3>
                <p className="mt-2 text-sm text-green-700">
                  Redirecting to login page...
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Verification failed</h3>
                <p className="mt-2 text-sm text-red-700">
                  The verification link may have expired or is invalid.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="mt-4 text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Return to login
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 