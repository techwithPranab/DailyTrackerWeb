'use client';

import { format } from 'date-fns';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function ActivityTable({ activities, onUpdate, onEdit }) {
  const statusColors = {
    'Not Started': 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-green-100 text-green-800'
  };

  const priorityColors = {
    'Low': 'bg-blue-100 text-blue-800',
    'Medium': 'bg-orange-100 text-orange-800',
    'High': 'bg-red-100 text-red-800'
  };

  const handleStatusChange = async (activity, newStatus) => {
    try {
      await api.put(`/activities/${activity._id}`, { status: newStatus });
      toast.success('Activity updated successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to update activity');
      console.error(error);
    }
  };

  const handleDelete = async (activityId) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        await api.delete(`/activities/${activityId}`);
        toast.success('Activity deleted successfully');
        if (onUpdate) onUpdate();
      } catch (error) {
        toast.error('Failed to delete activity');
        console.error(error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Mobile Card View */}
      <div className="block md:hidden">
        {activities.map((activity) => (
          <div key={activity._id} className="p-4 border-b border-gray-200 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">{activity.name}</div>
                {activity.description && (
                  <div className="text-xs text-gray-500 mb-2 line-clamp-2">
                    {activity.description}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColors[activity.priority]}`}>
                {activity.priority}
              </span>
              <select
                value={activity.status}
                onChange={(e) => handleStatusChange(activity, e.target.value)}
                className={`text-xs rounded-full px-2 py-1 font-semibold border-none cursor-pointer ${statusColors[activity.status]}`}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <span className="px-2 inline-flex text-xs leading-5 text-gray-700 bg-gray-100 rounded-full">
                {activity.category}
              </span>
            </div>

            <div className="text-xs text-gray-500 mb-3 space-y-1">
              <div>📅 {activity.startDate ? format(new Date(activity.startDate), 'MMM dd, yyyy') : '—'}</div>
              {activity.isRecurring && (
                <div>🔄 {activity.recurrencePattern}{activity.recurrencePattern === 'monthly' && activity.recurrenceMonthDay ? ` · day ${activity.recurrenceMonthDay}` : ''}</div>
              )}
              {activity.duration > 0 && <div>⏱️ {activity.duration} min</div>}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(activity)}
                className="flex-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md font-medium"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(activity._id)}
                className="flex-1 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md font-medium"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No activities found</p>
            <p className="mt-2">Try adjusting your filters or create a new activity</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{activity.name}</div>
                  {activity.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {activity.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{activity.category}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {activity.startDate ? format(new Date(activity.startDate), 'MMM dd, yyyy') : '—'}
                  </div>
                  {activity.isRecurring && (
                    <div className="text-xs text-purple-600 mt-0.5">
                      🔄 {activity.recurrencePattern}
                      {activity.recurrencePattern === 'monthly' && activity.recurrenceMonthDay
                        ? ` · day ${activity.recurrenceMonthDay}` : ''}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{activity.duration} min</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColors[activity.priority]}`}>
                    {activity.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={activity.status}
                    onChange={(e) => handleStatusChange(activity, e.target.value)}
                    className={`text-xs rounded-full px-2 py-1 font-semibold border-none cursor-pointer ${statusColors[activity.status]}`}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(activity)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                    title="Edit"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(activity._id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {activities.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No activities found</p>
            <p className="mt-2">Try adjusting your filters or create a new activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
