'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/Layout/ProtectedLayout';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    activityId: '',
    reminderTime: '',
    message: '',
    type: 'In-App'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [remindersRes, activitiesRes] = await Promise.all([
        api.get('/reminders'),
        api.get('/activities')
      ]);
      setReminders(remindersRes.data.data);
      setActivities(activitiesRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reminders', formData);
      toast.success('Reminder created successfully!');
      setShowForm(false);
      setFormData({ activityId: '', reminderTime: '', message: '', type: 'In-App' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create reminder');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      try {
        await api.delete(`/reminders/${id}`);
        toast.success('Reminder deleted!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete reminder');
      }
    }
  };

  const handleMarkAsSent = async (id) => {
    try {
      await api.put(`/reminders/${id}`, { notificationSent: true });
      toast.success('Reminder marked as sent!');
      fetchData();
    } catch (error) {
      toast.error('Failed to update reminder');
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
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reminders ⏰</h1>
            <p className="mt-2 text-gray-600">Manage your activity reminders</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ New Reminder'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Create New Reminder</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Activity*</label>
                <select
                  required
                  value={formData.activityId}
                  onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
                >
                  <option value="">Choose an activity</option>
                  {activities.map((activity) => (
                    <option key={activity._id} value={activity._id}>
                      {activity.name} - {format(new Date(activity.startTime), 'MMM dd, HH:mm')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Reminder Time*</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.reminderTime}
                  onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <input
                  type="text"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
                  placeholder="Custom reminder message (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
                >
                  <option value="In-App">In-App</option>
                  <option value="Email">Email</option>
                  <option value="Push">Push</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Reminder
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reminders List */}
        {reminders.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {reminders.map((reminder) => (
                <li key={reminder._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {reminder.activityId?.name || 'Activity Deleted'}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex gap-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            reminder.notificationSent
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {reminder.notificationSent ? 'Sent' : 'Pending'}
                          </span>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {reminder.type}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{reminder.message}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>⏰ {format(new Date(reminder.reminderTime), 'MMM dd, yyyy HH:mm')}</span>
                        {reminder.activityId && (
                          <span className="ml-4">
                            📅 Activity: {format(new Date(reminder.activityId.startTime), 'MMM dd, HH:mm')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      {!reminder.notificationSent && (
                        <button
                          onClick={() => handleMarkAsSent(reminder._id)}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                          Mark Sent
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(reminder._id)}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p className="text-lg">No reminders yet</p>
            <p className="mt-2">Create a reminder to stay on top of your activities!</p>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
