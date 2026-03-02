'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function WeeklyActivityTable() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  // Value capture state: { activityId, date, metric }
  const [pendingComplete, setPendingComplete] = useState(null);
  const [pendingValue,    setPendingValue]    = useState('');

  useEffect(() => {
    fetchWeeklyActivities();
  }, [weekStart]);

  const fetchWeeklyActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/activities/weekly', {
        params: { weekStart: weekStart.toISOString() }
      });
      setWeeklyData(response.data.data);
    } catch (error) {
      toast.error('Failed to load weekly activities');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (activityId, date, isCompleted, metric) => {
    if (isCompleted) {
      // Unmark immediately — no value prompt needed
      try {
        await api.post(`/activities/${activityId}/uncomplete`, { date });
        toast.success('Marked as incomplete');
        fetchWeeklyActivities();
      } catch (error) {
        toast.error('Failed to update activity');
        console.error(error);
      }
      return;
    }
    // Marking complete — ask for value if activity uses a measurable metric
    if (metric && metric !== 'occurrences') {
      setPendingComplete({ activityId, date, metric });
      setPendingValue('');
    } else {
      // No metric — mark complete directly
      try {
        await api.post(`/activities/${activityId}/complete`, { date, value: 0 });
        toast.success('Marked as complete! 🎉');
        fetchWeeklyActivities();
      } catch (error) {
        toast.error('Failed to update activity');
        console.error(error);
      }
    }
  };

  const confirmComplete = async () => {
    if (!pendingComplete) return;
    const { activityId, date } = pendingComplete;
    try {
      await api.post(`/activities/${activityId}/complete`, {
        date,
        value: pendingValue !== '' ? Number(pendingValue) : 0
      });
      toast.success('Marked as complete! 🎉');
      fetchWeeklyActivities();
    } catch (error) {
      toast.error('Failed to update activity');
      console.error(error);
    } finally {
      setPendingComplete(null);
      setPendingValue('');
    }
  };

  const goToPreviousWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };

  const goToNextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };

  const goToCurrentWeek = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!weeklyData) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryEmoji = (category) => {
    switch (category) {
      case 'Chores': return '🧹';
      case 'School': return '📚';
      case 'Fitness': return '💪';
      case 'Hobby': return '🎨';
      default: return '📋';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
      {/* Value capture modal */}
      {pendingComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Log your value</h3>
            <p className="text-sm text-gray-500 mb-4">
              How much {pendingComplete.metric} did you complete?
            </p>
            <div className="flex gap-2 mb-5">
              <input
                type="number"
                min="0"
                value={pendingValue}
                onChange={e => setPendingValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirmComplete()}
                placeholder="0"
                autoFocus
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="flex items-center text-sm text-gray-600 font-medium">{pendingComplete.metric}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmComplete}
                className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700"
              >
                Save & Complete
              </button>
              <button
                onClick={() => { setPendingComplete(null); setPendingValue(''); }}
                className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header with navigation */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Weekly Activity Tracker</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {format(weeklyData.weekStart, 'MMM d')} - {format(weeklyData.weekEnd, 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousWeek}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm sm:text-base"
          >
            <span className="hidden sm:inline">← Previous</span>
            <span className="sm:hidden">←</span>
          </button>
          <button
            onClick={goToCurrentWeek}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm sm:text-base"
          >
            <span className="hidden sm:inline">This Week</span>
            <span className="sm:hidden">Today</span>
          </button>
          <button
            onClick={goToNextWeek}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Next →</span>
            <span className="sm:hidden">→</span>
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {(() => {
          const allActivities = new Map();
          weeklyData.schedule.forEach(day => {
            day.activities.forEach(activity => {
              if (!allActivities.has(activity._id)) {
                allActivities.set(activity._id, activity);
              }
            });
          });
          
          return Array.from(allActivities.values()).map(activity => (
            <div key={activity._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start mb-3">
                <span className="text-2xl mr-3">{getCategoryEmoji(activity.category)}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {activity.name}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(activity.priority)}`}>
                      {activity.priority}
                    </span>
                    {activity.isRecurring && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-600">
                        🔄 {activity.recurrencePattern}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {weeklyData.schedule.map((day, dayIndex) => {
                  const dayActivity = day.activities.find(a => a._id === activity._id);
                  const isScheduled = !!dayActivity;
                  const isCompleted = dayActivity?.completionStatus?.completed || false;
                  const isToday = format(new Date(day.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  
                  return (
                    <div key={dayIndex} className="flex flex-col items-center">
                      <div className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                        {day.dayName.substring(0, 1)}
                      </div>
                      <div className={`text-xs mb-1 ${isToday ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                        {format(new Date(day.date), 'd')}
                      </div>
                      {isScheduled ? (
                        <button
                          onClick={() => handleToggleComplete(activity._id, day.date, isCompleted, activity.metric)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-sm ${
                            isCompleted
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-500'
                          } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
                          title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {isCompleted ? '✓' : '○'}
                        </button>
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center text-gray-300">-</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                Activity
              </th>
              {weeklyData.schedule.map((day, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    format(new Date(day.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500'
                  }`}
                >
                  <div>{day.dayName.substring(0, 3)}</div>
                  <div className="text-lg font-bold mt-1">
                    {format(new Date(day.date), 'd')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Get unique activities */}
            {(() => {
              const allActivities = new Map();
              weeklyData.schedule.forEach(day => {
                day.activities.forEach(activity => {
                  if (!allActivities.has(activity._id)) {
                    allActivities.set(activity._id, activity);
                  }
                });
              });
              
              return Array.from(allActivities.values()).map(activity => (
                <tr key={activity._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getCategoryEmoji(activity.category)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {activity.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(activity.priority)}`}>
                            {activity.priority}
                          </span>
                          {activity.isRecurring && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-600">
                              🔄 {activity.recurrencePattern}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  {weeklyData.schedule.map((day, dayIndex) => {
                    const dayActivity = day.activities.find(a => a._id === activity._id);
                    const isScheduled = !!dayActivity;
                    const isCompleted = dayActivity?.completionStatus?.completed || false;
                    
                    return (
                      <td
                        key={dayIndex}
                        className={`px-4 py-4 text-center ${
                          format(new Date(day.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                            ? 'bg-blue-50'
                            : ''
                        }`}
                      >
                        {isScheduled ? (
                          <button
                            onClick={() => handleToggleComplete(activity._id, day.date, isCompleted, activity.metric)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-500'
                            }`}
                            title={isCompleted ? 'Click to mark incomplete' : 'Click to mark complete'}
                          >
                            {isCompleted ? '✓' : '○'}
                          </button>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {weeklyData.schedule.reduce((total, day) => total + day.activities.length, 0)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total Activities</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {weeklyData.schedule.reduce((total, day) => 
                total + day.activities.filter(a => a.completionStatus?.completed).length, 0
              )}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {weeklyData.schedule.reduce((total, day) => 
                total + day.activities.filter(a => a.completionStatus?.completed).length, 0
              ) > 0
                ? Math.round(
                    (weeklyData.schedule.reduce((total, day) => 
                      total + day.activities.filter(a => a.completionStatus?.completed).length, 0
                    ) / weeklyData.schedule.reduce((total, day) => total + day.activities.length, 0)) * 100
                  )
                : 0}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
