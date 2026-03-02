'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import SubActivityList from './SubActivityList';

export default function ActivityCard({ activity, onUpdate }) {
  const [expanded, setExpanded] = useState(false);

  const statusColors = {
    'Not Started': 'bg-gray-100 text-gray-800',
    'In Progress':  'bg-yellow-100 text-yellow-800',
    'Completed':    'bg-green-100 text-green-800'
  };

  const priorityColors = {
    'Low':    'bg-blue-100 text-blue-800',
    'Medium': 'bg-orange-100 text-orange-800',
    'High':   'bg-red-100 text-red-800'
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/activities/${activity._id}`, { status: newStatus });
      toast.success('Activity updated successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to update activity');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        await api.delete(`/activities/${activity._id}`);
        toast.success('Activity deleted successfully');
        if (onUpdate) onUpdate();
      } catch (error) {
        toast.error('Failed to delete activity');
        console.error(error);
      }
    }
  };

  const scheduledCount = activity.scheduledDates?.length ?? 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{activity.name}</h3>
          <div className="flex gap-2 flex-wrap justify-end">
            <span className={`px-2 py-1 text-xs rounded-full ${statusColors[activity.status]}`}>
              {activity.status}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[activity.priority]}`}>
              {activity.priority}
            </span>
          </div>
        </div>

        {activity.description && (
          <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
        )}

        <div className="space-y-1.5 text-sm text-gray-500 mb-4">
          <p>📅 {activity.startDate ? format(new Date(activity.startDate), 'MMM dd, yyyy') : '—'}</p>
          {activity.isRecurring && (
            <div className="flex items-center gap-2">
              <p>🔄 {activity.recurrencePattern}
                {activity.recurrencePattern === 'monthly' && activity.recurrenceMonthDay
                  ? ` · day ${activity.recurrenceMonthDay}` : ''}
              </p>
              {scheduledCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                  {scheduledCount} day{scheduledCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
          {activity.duration > 0 && <p>⏱️ Duration: {activity.duration} minutes</p>}
          <p>🏷️ Category: {activity.category}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          {activity.status !== 'Completed' && (
            <button
              onClick={() => handleStatusChange('Completed')}
              className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
            >
              ✓ Complete
            </button>
          )}
          {activity.status === 'Not Started' && (
            <button
              onClick={() => handleStatusChange('In Progress')}
              className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded text-sm hover:bg-yellow-600"
            >
              ▶ Start
            </button>
          )}
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
          >
            🗑️
          </button>

          {/* Expand sub-activities */}
          {scheduledCount > 0 && (
            <button
              onClick={() => setExpanded(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-colors ${
                expanded
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📋 {expanded ? '▲ Hide days' : `▼ ${scheduledCount} day${scheduledCount !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>

      {/* Expandable sub-activity panel */}
      {expanded && (
        <div className="border-t border-gray-100 px-6 pb-5 pt-3">
          <SubActivityList
            activityId={activity._id}
            activityName={activity.name}
            activityMetric={activity.metric}
          />
        </div>
      )}
    </div>
  );
}
