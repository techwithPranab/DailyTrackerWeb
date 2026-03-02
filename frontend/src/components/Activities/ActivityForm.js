'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function ActivityForm({ onSuccess, onCancel, activity }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    value: 0,
    metric: 'Min',
    priority: 'Medium',
    category: 'Other',
    status: 'Not Started',
    isRecurring: false,
    recurrencePattern: 'daily',
    recurrenceDays: [],
    recurrenceMonthDay: 1,
    recurrenceEndDate: ''
  });
  const [loading, setLoading] = useState(false);
  const isEditing = !!activity;

  useEffect(() => {
    if (activity) {
      const startDate = activity.startDate
        ? new Date(activity.startDate).toISOString().slice(0, 10)
        : '';

      setFormData({
        name: activity.name || '',
        description: activity.description || '',
        startDate,
        value: activity.value ?? 0,
        metric: activity.metric || 'Min',
        priority: activity.priority || 'Medium',
        category: activity.category || 'Other',
        status: activity.status || 'Not Started',
        isRecurring: activity.isRecurring || false,
        recurrencePattern: activity.recurrencePattern || 'daily',
        recurrenceDays: activity.recurrenceDays || [],
        recurrenceMonthDay: activity.recurrenceMonthDay || 1,
        recurrenceEndDate: activity.recurrenceEndDate
          ? new Date(activity.recurrenceEndDate).toISOString().slice(0, 10)
          : ''
      });
    }
  }, [activity]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      recurrenceDays: prev.recurrenceDays.includes(day)
        ? prev.recurrenceDays.filter(d => d !== day)
        : [...prev.recurrenceDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.isRecurring && formData.recurrencePattern === 'weekly' && formData.recurrenceDays.length === 0) {
      toast.error('Please select at least one day for weekly recurrence');
      return;
    }

    setLoading(true);
    try {
      const submitData = { ...formData };

      // Clean up unused recurrence fields
      if (!formData.isRecurring) {
        delete submitData.recurrencePattern;
        delete submitData.recurrenceDays;
        delete submitData.recurrenceMonthDay;
        delete submitData.recurrenceEndDate;
      } else {
        if (formData.recurrencePattern !== 'weekly') {
          delete submitData.recurrenceDays;
        }
        if (formData.recurrencePattern !== 'monthly') {
          delete submitData.recurrenceMonthDay;
        }
        if (!submitData.recurrenceEndDate) {
          delete submitData.recurrenceEndDate;
        }
      }

      if (isEditing) {
        await api.put(`/activities/${activity._id}`, submitData);
        toast.success('Activity updated successfully!');
      } else {
        await api.post('/activities', submitData);
        toast.success('Activity created successfully!');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} activity`);
    } finally {
      setLoading(false);
    }
  };

  // Generate 1-31 ordinal options for monthly picker
  const ordinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Activity Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Activity Name *</label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
          placeholder="Morning Exercise"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
          placeholder="Describe the activity..."
        />
      </div>

      {/* Start Date + Value + Metric */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date *</label>
          <input
            type="date"
            name="startDate"
            required
            value={formData.startDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Default Value &amp; Unit</label>
          <div className="mt-1 flex gap-2">
            <input
              type="number"
              name="value"
              min="0"
              value={formData.value}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
              placeholder="0"
            />
            <select
              name="metric"
              value={formData.metric}
              onChange={handleChange}
              className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-2 py-2 border text-gray-900"
            >
              {['Min','Hr','Km','Mi','L','ml','lb','kg','reps','steps','pages','sessions','custom'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Priority + Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
          >
            <option value="Chores">Chores</option>
            <option value="School">School</option>
            <option value="Fitness">Fitness</option>
            <option value="Hobby">Hobby</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Recurring */}
      <div className="border-t pt-4">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            name="isRecurring"
            id="isRecurring"
            checked={formData.isRecurring}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isRecurring" className="ml-2 block text-sm font-medium text-gray-700">
            🔄 Make this a recurring activity
          </label>
        </div>

        {formData.isRecurring && (
          <div className="space-y-4 ml-0 sm:ml-6 p-4 bg-blue-50 rounded-lg border border-blue-100">

            {/* Pattern selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recurrence Pattern</label>
              <div className="grid grid-cols-3 gap-3">
                {['daily', 'weekly', 'monthly'].map(pattern => (
                  <button
                    key={pattern}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, recurrencePattern: pattern }))}
                    className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${
                      formData.recurrencePattern === pattern
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pattern}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily hint */}
            {formData.recurrencePattern === 'daily' && (
              <p className="text-xs text-blue-700 bg-blue-100 rounded px-3 py-2">
                ✅ This activity will be scheduled <strong>every day</strong> from the start date until the end date (or indefinitely if no end date is set).
              </p>
            )}

            {/* Weekly day picker */}
            {formData.recurrencePattern === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Days of the Week *</label>
                <div className="flex flex-wrap gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(index)}
                      className={`w-11 h-11 rounded-full text-sm font-semibold ${
                        formData.recurrenceDays.includes(index)
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {formData.recurrenceDays.length > 0 && (
                  <p className="mt-2 text-xs text-blue-700">
                    Active on: {formData.recurrenceDays.sort().map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Monthly day picker */}
            {formData.recurrencePattern === 'monthly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day of Month *</label>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, recurrenceMonthDay: day }))}
                      className={`h-9 w-full rounded text-xs font-semibold ${
                        formData.recurrenceMonthDay === day
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-blue-700">
                  Activity runs on the <strong>{ordinal(formData.recurrenceMonthDay)}</strong> of every month.
                </p>
              </div>
            )}

            {/* End date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="date"
                name="recurrenceEndDate"
                value={formData.recurrenceEndDate}
                onChange={handleChange}
                min={formData.startDate}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty to repeat indefinitely (capped at 2 years).</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? (isEditing ? 'Updating...' : 'Creating...')
            : (isEditing ? 'Update Activity' : 'Create Activity')}
        </button>
      </div>
    </form>
  );
}
