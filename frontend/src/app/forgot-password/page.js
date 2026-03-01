'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users/forgot', { email });
      setSent(true);
      toast.success('If that email is registered, instructions have been sent');
    } catch (err) {
      // still show success message to avoid leaking info
      setSent(true);
      toast.success('If that email is registered, instructions have been sent');
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
            <span className="text-6xl">🔑</span>
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Forgot Password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {sent ? (
            <p className="text-sm text-green-600 text-center">
              Instructions sent. Please check your inbox.
            </p>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </div>

              <p className="text-center text-sm text-gray-600">
                Remembered your password?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
