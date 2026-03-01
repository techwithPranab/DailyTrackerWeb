'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      toast.error('Passwords must match');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/users/reset/${token}`, { password: formData.password });
      toast.success('Password reset! Please log in.');
      router.push('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-3xl mr-2">📊</span>
              <span className="text-xl font-bold text-gray-900">TrakIO</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
          <div className="text-center">
            <span className="text-6xl">🔒</span>
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Reset Password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter a new password for your account.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="New password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm password"
                  value={formData.confirm}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {loading ? 'Saving…' : 'Reset Password'}
              </button>
            </div>

            <p className="text-center text-sm text-gray-600">
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Back to login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
