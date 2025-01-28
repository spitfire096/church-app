'use strict';

import { useState } from 'react';
import { z } from 'zod';

// Validation schema
const firstTimerSchema = z.object({
  serviceDate: z.string().min(1, 'Service date is required'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  visitingMember: z.boolean(),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Please select a gender' }),
  heardFrom: z.string().min(1, 'Please specify how you heard about us'),
  isStudent: z.boolean(),
  school: z.string().optional(),
  prayerRequest: z.string().optional()
});

type FirstTimer = z.infer<typeof firstTimerSchema>;

export default function FirstTimerForm() {
  const [formData, setFormData] = useState<FirstTimer>({
    serviceDate: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    visitingMember: false,
    gender: 'Male',
    heardFrom: '',
    isStudent: false,
    school: '',
    prayerRequest: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FirstTimer, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    try {
      firstTimerSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof FirstTimer, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof FirstTimer] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/first-timers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      
      // Clear form after successful submission
      setFormData({
        serviceDate: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
        visitingMember: false,
        gender: 'Male',
        heardFrom: '',
        isStudent: false,
        school: '',
        prayerRequest: ''
      });
      
      alert('First timer registered successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to register first timer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">First Timer Registration</h2>
      
      <div className="space-y-4">
        {/* Service Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Service Date</label>
          <input
            type="date"
            value={formData.serviceDate}
            onChange={(e) => setFormData({...formData, serviceDate: e.target.value})}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.serviceDate ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.serviceDate && (
            <p className="mt-1 text-sm text-red-500">{errors.serviceDate}</p>
          )}
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Address Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-500">{errors.city}</p>
            )}
          </div>
        </div>

        {/* Other Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value as FirstTimer['gender']})}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.gender ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">How did you hear about us?</label>
            <input
              type="text"
              value={formData.heardFrom}
              onChange={(e) => setFormData({...formData, heardFrom: e.target.value})}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.heardFrom ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.heardFrom && (
              <p className="mt-1 text-sm text-red-500">{errors.heardFrom}</p>
            )}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.visitingMember}
              onChange={(e) => setFormData({...formData, visitingMember: e.target.checked})}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Visiting Member
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isStudent}
              onChange={(e) => setFormData({...formData, isStudent: e.target.checked})}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Student
            </label>
          </div>
        </div>

        {/* Conditional School Field */}
        {formData.isStudent && (
          <div>
            <label className="block text-sm font-medium text-gray-700">School</label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => setFormData({...formData, school: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        )}

        {/* Prayer Request */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Prayer Request</label>
          <textarea
            value={formData.prayerRequest}
            onChange={(e) => setFormData({...formData, prayerRequest: e.target.value})}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isSubmitting ? 'Registering...' : 'Register First Timer'}
        </button>
      </div>
    </form>
  );
} 