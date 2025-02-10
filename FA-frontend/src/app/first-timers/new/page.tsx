'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';

interface FirstTimerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'prefer_not_to_say';
  postalCode: string;
  isStudent: boolean;
  studentDetails?: string;
  isBornAgain: boolean;
  bornAgainDate?: string;
  isWaterBaptized: boolean;
  waterBaptismDate?: string;
  prayerRequest: string;
  serviceDate: string;
  notes: string;
}

export default function NewFirstTimerPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FirstTimerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'prefer_not_to_say',
    postalCode: '',
    isStudent: false,
    studentDetails: '',
    isBornAgain: false,
    bornAgainDate: '',
    isWaterBaptized: false,
    waterBaptismDate: '',
    prayerRequest: '',
    serviceDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/first-timers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create first timer');
      }

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg';
      successMessage.textContent = 'First timer added successfully!';
      document.body.appendChild(successMessage);
      
      // Remove message after 3 seconds
      setTimeout(() => {
        successMessage.remove();
      }, 3000);

      // Navigate back to first timers list
      router.push('/first-timers');
      router.refresh(); // Force refresh the page data
    } catch (error) {
      console.error('Error creating first timer:', error);
      setError('Failed to create first timer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">New First Timer</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Add information about a new first-time visitor.
                </p>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <form onSubmit={handleSubmit}>
                <div className="shadow sm:overflow-hidden sm:rounded-md">
                  <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{error}</div>
                      </div>
                    )}

                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          First name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Last name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email address
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                          Gender
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="prefer_not_to_say">Prefer not to say</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6">
                        <div className="flex items-center">
                          <input
                            id="isStudent"
                            name="isStudent"
                            type="checkbox"
                            checked={formData.isStudent}
                            onChange={(e) => handleChange({
                              target: {
                                name: 'isStudent',
                                value: e.target.checked
                              }
                            } as any)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="isStudent" className="ml-2 block text-sm text-gray-700">
                            Are you a student?
                          </label>
                        </div>
                      </div>

                      {formData.isStudent && (
                        <div className="col-span-6">
                          <label htmlFor="studentDetails" className="block text-sm font-medium text-gray-700">
                            Student Details
                          </label>
                          <input
                            type="text"
                            name="studentDetails"
                            id="studentDetails"
                            value={formData.studentDetails}
                            onChange={handleChange}
                            placeholder="School/Institution and Course"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      )}

                      <div className="col-span-6 sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Are you born again?
                        </label>
                        <div className="mt-1 space-y-2">
                          <select
                            name="isBornAgain"
                            value={formData.isBornAgain.toString()}
                            onChange={(e) => handleChange({
                              target: {
                                name: 'isBornAgain',
                                value: e.target.value === 'true'
                              }
                            } as any)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                          </select>
                          
                          {formData.isBornAgain && (
                            <div className="mt-2">
                              <label htmlFor="bornAgainDate" className="block text-sm font-medium text-gray-700">
                                When did you get born again?
                              </label>
                              <input
                                type="date"
                                name="bornAgainDate"
                                id="bornAgainDate"
                                value={formData.bornAgainDate}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Are you baptized in water?
                        </label>
                        <div className="mt-1 space-y-2">
                          <select
                            name="isWaterBaptized"
                            value={formData.isWaterBaptized.toString()}
                            onChange={(e) => handleChange({
                              target: {
                                name: 'isWaterBaptized',
                                value: e.target.value === 'true'
                              }
                            } as any)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                          </select>
                          
                          {formData.isWaterBaptized && (
                            <div className="mt-2">
                              <label htmlFor="waterBaptismDate" className="block text-sm font-medium text-gray-700">
                                When were you baptized?
                              </label>
                              <input
                                type="date"
                                name="waterBaptismDate"
                                id="waterBaptismDate"
                                value={formData.waterBaptismDate}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-span-6">
                        <label htmlFor="prayerRequest" className="block text-sm font-medium text-gray-700">
                          Prayer Request
                        </label>
                        <textarea
                          name="prayerRequest"
                          id="prayerRequest"
                          rows={3}
                          value={formData.prayerRequest}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Share your prayer request..."
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="serviceDate" className="block text-sm font-medium text-gray-700">
                          Service Date
                        </label>
                        <input
                          type="date"
                          name="serviceDate"
                          id="serviceDate"
                          required
                          value={formData.serviceDate}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                          Notes
                        </label>
                        <textarea
                          name="notes"
                          id="notes"
                          rows={3}
                          value={formData.notes}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
} 