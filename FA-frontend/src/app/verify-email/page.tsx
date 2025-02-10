"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setError('No verification token found');
        setVerifying(false);
        return;
      }

      try {
        await api.post('/auth/verify-email', { token });
        router.push('/login?verified=true');
      } catch (err) {
        setError('Failed to verify email');
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow rounded">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
        {verifying ? (
          <p className="text-center text-gray-600">
            Verifying your email...
          </p>
        ) : error ? (
          <p className="text-center text-red-600">
            {error}
          </p>
        ) : (
          <p className="text-center text-green-600">
            Email verified successfully!
          </p>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white shadow rounded">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 