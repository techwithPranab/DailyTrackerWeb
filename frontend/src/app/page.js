'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Footer from '@/components/Layout/Footer';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated && mounted) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold">Family Activity Tracker</h1>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-3xl mr-2">📊</span>
              <span className="text-xl font-bold text-gray-900">Family Activity Tracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              Organize Your Family's
              <span className="block text-yellow-300">Activities & Goals</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100">
              The all-in-one platform for families to track activities, achieve milestones, 
              and build better habits together. Designed for parents and children to stay organized.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-600 md:py-4 md:text-lg md:px-10 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Everything You Need to Stay Organized
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Powerful features designed for modern families
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Activity Management</h3>
              <p className="text-gray-600">
                Create, assign, and track daily activities with priorities, categories, and due dates. 
                Keep everyone on the same page.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Milestone Tracking</h3>
              <p className="text-gray-600">
                Set goals and track progress with visual progress bars. Celebrate achievements 
                and stay motivated together.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">⏰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Reminders</h3>
              <p className="text-gray-600">
                Never miss important activities with customizable reminders. Get notified 
                at the right time, every time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Progress Analytics</h3>
              <p className="text-gray-600">
                Visualize your family's progress with beautiful charts and statistics. 
                Track trends and identify patterns.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Family Dashboard</h3>
              <p className="text-gray-600">
                Parents can manage all family members, assign tasks, and monitor progress 
                from a centralized dashboard.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mobile Responsive</h3>
              <p className="text-gray-600">
                Access your family tracker from any device. Fully responsive design 
                works perfectly on phones, tablets, and desktops.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-white mb-2">10,000+</div>
              <div className="text-blue-100 text-lg">Active Families</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">50,000+</div>
              <div className="text-blue-100 text-lg">Activities Tracked</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">95%</div>
              <div className="text-blue-100 text-lg">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sign Up Free</h3>
              <p className="text-gray-600">
                Create your account in seconds and start tracking activities with your family.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Add Activities</h3>
              <p className="text-gray-600">
                Create activities, set priorities, and assign them to family members with due dates.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Track Progress</h3>
              <p className="text-gray-600">
                Monitor completion, view analytics, and celebrate achievements as a family.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of families who are already using Family Activity Tracker 
            to stay organized and achieve their goals together.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 border border-transparent text-lg font-medium rounded-md text-purple-600 bg-white hover:bg-gray-50 shadow-lg"
          >
            Start Your Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
