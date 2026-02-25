'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/Layout/ProtectedLayout';
import ActivityTable from '@/components/Activities/ActivityTable';
import ActivityForm from '@/components/Activities/ActivityForm';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activities, filters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/activities');
      setActivities(data.data);
    } catch (error) {
      toast.error('Failed to load activities');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    if (filters.status) {
      filtered = filtered.filter(a => a.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(a => a.priority === filters.priority);
    }
    if (filters.category) {
      filtered = filtered.filter(a => a.category === filters.category);
    }

    setFilteredActivities(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingActivity(null);
    fetchActivities();
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setShowForm(true);
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewActivity = () => {
    setEditingActivity(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingActivity(null);
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
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Activities 📝</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">Manage your daily activities and tasks</p>
          </div>
          <button
            onClick={handleNewActivity}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base"
          >
            {showForm ? 'Cancel' : '+ New Activity'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">
              {editingActivity ? 'Edit Activity' : 'Create New Activity'}
            </h2>
            <ActivityForm 
              activity={editingActivity}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelForm}
            />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
              >
                <option value="">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
              >
                <option value="">All Categories</option>
                <option value="Chores">Chores</option>
                <option value="School">School</option>
                <option value="Fitness">Fitness</option>
                <option value="Hobby">Hobby</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activities Table */}
        <ActivityTable 
          activities={filteredActivities}
          onUpdate={fetchActivities}
          onEdit={handleEdit}
        />
      </div>
    </ProtectedLayout>
  );
}
