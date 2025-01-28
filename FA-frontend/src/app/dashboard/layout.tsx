'use strict';

'use client';

import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <ProtectedRoute>{children}</ProtectedRoute>
          </div>
        </main>
      </div>
    </div>
  );
} 