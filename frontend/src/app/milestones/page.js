'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/Layout/ProtectedLayout';
import PlanGate from '@/components/Subscription/PlanGate';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    deadline: '',
    category: 'Personal',
    progress: 0
  });

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/milestones');
      setMilestones(data.data);
    } catch (error) {
      toast.error('Failed to load milestones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/milestones', formData);
      toast.success('Milestone created successfully!');
      setShowForm(false);
      setFormData({ name: '', target: '', deadline: '', category: 'Personal', progress: 0 });
      fetchMilestones();
    } catch (error) {
      toast.error('Failed to create milestone');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/milestones/${id}`, { completionStatus: status });
      toast.success('Milestone updated!');
      fetchMilestones();
    } catch (error) {
      toast.error('Failed to update milestone');
    }
  };

  const handleProgressChange = async (id, progress) => {
    try {
      await api.put(`/milestones/${id}`, { progress: parseInt(progress) });
      toast.success('Progress updated!');
      fetchMilestones();
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this milestone?')) {
      try {
        await api.delete(`/milestones/${id}`);
        toast.success('Milestone deleted!');
        fetchMilestones();
      } catch (error) {
        toast.error('Failed to delete milestone');
      }
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
      <PlanGate
        feature="milestones"
        fallback={undefined}
      >
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Milestones 🎯</h1>
            <p className="mt-2 text-gray-600">Track your goals and achievements</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ New Milestone'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Create New Milestone</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Milestone Name*</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
                  placeholder="Complete 100 activities"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Target Description*</label>
                <textarea
                  required
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
                  placeholder="Describe your goal..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deadline*</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Academic">Academic</option>
                    <option value="Health">Health</option>
                    <option value="Family">Family</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
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
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Milestones Grid */}
        {milestones.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {milestones.map((milestone) => (
              <div key={milestone._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{milestone.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    milestone.completionStatus === 'Achieved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {milestone.completionStatus}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3">{milestone.target}</p>

                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <p>📅 Deadline: {format(new Date(milestone.deadline), 'MMM dd, yyyy')}</p>
                  <p>🏷️ Category: {milestone.category}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{milestone.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${milestone.progress}%` }}
                    ></div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={milestone.progress}
                    onChange={(e) => handleProgressChange(milestone._id, e.target.value)}
                    className="w-full mt-2"
                  />
                </div>

                <div className="flex gap-2">
                  {milestone.completionStatus !== 'Achieved' && (
                    <button
                      onClick={() => handleStatusChange(milestone._id, 'Achieved')}
                      className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                    >
                      ✓ Mark Achieved
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(milestone._id)}
                    className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p className="text-lg">No milestones yet</p>
            <p className="mt-2">Create your first milestone to start tracking your goals!</p>
          </div>
        )}
      </div>
      </PlanGate>
    </ProtectedLayout>
  );
}
