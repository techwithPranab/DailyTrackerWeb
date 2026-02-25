'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/Layout/ProtectedLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ActivityCard from '@/components/Activities/ActivityCard';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [todayActivities, setTodayActivities] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [activitiesRes, remindersRes] = await Promise.all([
        api.get('/activities/today'),
        api.get('/reminders?upcoming=true')
      ]);

      const activities = activitiesRes.data.data;
      setTodayActivities(activities);
      setUpcomingReminders(remindersRes.data.data);

      // Calculate stats
      const statsData = {
        total: activities.length,
        completed: activities.filter(a => a.status === 'Completed').length,
        inProgress: activities.filter(a => a.status === 'In Progress').length,
        notStarted: activities.filter(a => a.status === 'Not Started').length
      };
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Here's what's happening with your activities today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Activities</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">In Progress</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="text-2xl sm:text-3xl font-bold text-gray-600">{stats.notStarted}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Not Started</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Link href="/activities" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow p-4 sm:p-6 hover:from-blue-600 hover:to-blue-700 transition-all">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-base sm:text-lg font-semibold">Manage Activities</div>
            <div className="text-xs sm:text-sm opacity-90 mt-1">Add, edit, or view activities</div>
          </Link>
          <Link href="/calendar" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow p-4 sm:p-6 hover:from-purple-600 hover:to-purple-700 transition-all">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-base sm:text-lg font-semibold">View Calendar</div>
            <div className="text-xs sm:text-sm opacity-90 mt-1">Monthly/Weekly view</div>
          </Link>
          <Link href="/milestones" className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow p-4 sm:p-6 hover:from-green-600 hover:to-green-700 transition-all">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-base sm:text-lg font-semibold">Track Milestones</div>
            <div className="text-xs sm:text-sm opacity-90 mt-1">Set and achieve goals</div>
          </Link>
        </div>

        {/* Today's Activities */}
        <div className="mt-6 sm:mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Today's Activities
            </h2>
            <Link href="/activities" className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
          {todayActivities.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {todayActivities.map((activity) => (
                <ActivityCard 
                  key={activity._id} 
                  activity={activity} 
                  onUpdate={fetchDashboardData}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-base sm:text-lg">No activities scheduled for today</p>
              <Link href="/activities" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base">
                Add Activity
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Upcoming Reminders ⏰
          </h2>
          {upcomingReminders.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {upcomingReminders.slice(0, 5).map((reminder) => (
                  <li key={reminder._id} className="px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {reminder.activityId?.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {reminder.message}
                        </p>
                      </div>
                      <div className="sm:ml-4 flex-shrink-0">
                        <span className="text-xs sm:text-sm text-gray-500">
                          {format(new Date(reminder.reminderTime), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              No upcoming reminders
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
