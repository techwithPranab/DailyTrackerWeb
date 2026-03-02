'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/Layout/ProtectedLayout';
import PlanGate from '@/components/Subscription/PlanGate';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const METRICS = ['occurrences','Min','Hr','Km','Mi','L','ml','lb','kg','reps','steps','pages','sessions','custom'];

const EMPTY_FORM = {
  name: '',
  target: '',
  deadline: '',
  category: 'Personal',
  linkedActivityId: '',
  targetValue: '',
  metric: 'occurrences',
};

export default function MilestonesPage() {
  const [milestones,  setMilestones]  = useState([]);
  const [activities,  setActivities]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [formData,    setFormData]    = useState(EMPTY_FORM);

  useEffect(() => {
    Promise.all([fetchMilestones(), fetchActivities()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchMilestones = async () => {
    try {
      const { data } = await api.get('/milestones');
      setMilestones(data.data);
    } catch {
      toast.error('Failed to load milestones');
    }
  };

  const fetchActivities = async () => {
    try {
      const { data } = await api.get('/activities');
      setActivities(data.data);
    } catch {
      // non-fatal — activity picker just won't populate
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.linkedActivityId && !formData.targetValue) {
      toast.error('Please enter a target value for the linked activity');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name:     formData.name,
        target:   formData.target,
        deadline: formData.deadline,
        category: formData.category,
        ...(formData.linkedActivityId && {
          linkedActivityId: formData.linkedActivityId,
          targetValue:      Number(formData.targetValue),
          metric:           formData.metric,
        }),
      };
      await api.post('/milestones', payload);
      toast.success('Milestone created!');
      setShowForm(false);
      setFormData(EMPTY_FORM);
      fetchMilestones();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create milestone');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;
    try {
      await api.delete(`/milestones/${id}`);
      toast.success('Milestone deleted!');
      fetchMilestones();
    } catch {
      toast.error('Failed to delete milestone');
    }
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <PlanGate feature="milestones" fallback={undefined}>
        <div className="px-4 py-6 sm:px-0">

          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Milestones 🎯</h1>
              <p className="mt-2 text-gray-600">Track your goals and achievements</p>
            </div>
            <button
              onClick={() => { setShowForm(!showForm); setFormData(EMPTY_FORM); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : '+ New Milestone'}
            </button>
          </div>

          {/* Create form */}
          {showForm && (
            <div className="mb-6 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Create New Milestone</h2>
              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700">Milestone Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
                    placeholder="e.g. Complete 30 workouts"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Description *</label>
                  <textarea
                    required
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
                    placeholder="Describe what you want to achieve..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Deadline *</label>
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
                      {['Personal', 'Academic', 'Health', 'Family', 'Other'].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Activity linkage */}
                <div className="border border-blue-100 bg-blue-50 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-blue-800">
                    🔗 Link to an Activity <span className="text-blue-500 font-normal">(optional — auto-tracks progress)</span>
                  </p>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Select Activity</label>
                    <select
                      value={formData.linkedActivityId}
                      onChange={(e) => {
                        const id = e.target.value;
                        const act = activities.find(a => a._id === id);
                        setFormData({
                          ...formData,
                          linkedActivityId: id,
                          targetValue: '',
                          metric: act?.metric ?? 'occurrences',
                        });
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900 bg-white"
                    >
                      <option value="">— No activity (manual milestone) —</option>
                      {activities.map(a => (
                        <option key={a._id} value={a._id}>
                          {a.name}{a.category ? ` · ${a.category}` : ''}{a.metric ? ` [${a.metric}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.linkedActivityId && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Target value to reach 100%
                          </label>
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            required
                            value={formData.targetValue}
                            onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900 bg-white"
                            placeholder="e.g. 100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Unit / Metric</label>
                          <select
                            value={formData.metric}
                            onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900 bg-white"
                          >
                            {METRICS.map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formData.metric === 'occurrences'
                          ? `Progress advances by 1/${formData.targetValue || '?'} each time the activity is completed.`
                          : `Accumulated ${formData.metric} will be summed across all completions toward ${formData.targetValue || '?'} ${formData.metric}.`
                        }
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {submitting ? 'Creating…' : 'Create Milestone'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Milestones grid */}
          {milestones.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {milestones.map((ms) => {
                const isLinked  = !!ms.linkedActivityId;
                const isAchieved = ms.completionStatus === 'Achieved';
                return (
                  <div key={ms._id} className="bg-white rounded-lg shadow-md p-6 flex flex-col">
                    {/* Title row */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight">{ms.name}</h3>
                      <span className={`ml-2 shrink-0 px-2 py-1 text-xs rounded-full ${
                        isAchieved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ms.completionStatus}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">{ms.target}</p>

                    <div className="space-y-1 text-sm text-gray-500 mb-4">
                      <p>📅 Deadline: {format(new Date(ms.deadline), 'MMM dd, yyyy')}</p>
                      <p>🏷️ Category: {ms.category}</p>
                      {isLinked && (
                        <p className="text-blue-600 font-medium">
                          🔗 {ms.linkedActivityId?.name ?? 'Linked activity'}
                          {ms.targetValue != null && (
                            <span className="text-gray-400 font-normal">
                              {' '}· {ms.accumulatedValue ?? 0}/{ms.targetValue} {ms.metric === 'occurrences' ? 'completions' : ms.metric}
                            </span>
                          )}
                        </p>
                      )}
                      {ms.achievedAt && (
                        <p className="text-green-600">
                          🏆 Achieved: {format(new Date(ms.achievedAt), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>

                    {/* Progress bar — read-only for linked milestones */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span className="flex items-center gap-1">
                          Progress
                          {isLinked && (
                            <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                              auto
                            </span>
                          )}
                        </span>
                        <span className="font-semibold">{ms.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            isAchieved ? 'bg-green-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${ms.progress}%` }}
                        />
                      </div>
                      {isLinked && (
                        <p className="text-xs text-gray-400 mt-1 italic">
                          Progress updates automatically as activities are completed.
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleDelete(ms._id)}
                        className="ml-auto bg-red-50 text-red-500 border border-red-200 px-3 py-2 rounded text-sm hover:bg-red-100"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <p className="text-lg">No milestones yet</p>
              <p className="mt-2 text-sm">Create your first milestone to start tracking your goals!</p>
            </div>
          )}
        </div>
      </PlanGate>
    </ProtectedLayout>
  );
}
