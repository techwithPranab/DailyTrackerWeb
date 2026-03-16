'use client';

import { useState, useEffect } from 'react';
import {
  format, parseISO,
  startOfMonth, endOfMonth,
  startOfWeek, endOfWeek,
  addDays, addMonths, subMonths,
  addWeeks, subWeeks,
  isSameMonth, isSameDay
} from 'date-fns';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function ActivityCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('weekly');           // ← weekly by default
  const [activities, setActivities] = useState([]);
  const [subActivities, setSubActivities] = useState([]); // ← per-day task status
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [currentDate, view]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let startDate, endDate;

      if (view === 'monthly') {
        startDate = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
        endDate   = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
      } else {
        startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
        endDate   = endOfWeek(currentDate, { weekStartsOn: 0 });
      }

      // Fetch both activities and subactivities for status data
      const [activitiesRes, subActivitiesRes] = await Promise.all([
        api.get('/activities', {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        }),
        api.get('/subactivities', {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        }).catch(() => ({ data: { data: [] } })) // gracefully ignore errors
      ]);

      setActivities(activitiesRes.data.data || []);
      setSubActivities(subActivitiesRes.data.data || subActivitiesRes.data || []);
    } catch (error) {
      toast.error('Failed to load activities');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Get activities whose scheduledDates contains the given day
  // Note: Compare using only date part (YYYY-MM-DD) to avoid timezone issues
  const getActivitiesForDay = (day) => {
    // Get date string for comparison (YYYY-MM-DD format)
    const dayString = format(day, 'yyyy-MM-dd');

    return activities.filter(activity => {
      if (!activity.scheduledDates || activity.scheduledDates.length === 0) return false;
      return activity.scheduledDates.some(d => {
        // Extract date part directly from ISO string to avoid timezone conversion
        // e.g., "2024-03-06T00:00:00.000Z" -> "2024-03-06"
        const sdString = typeof d === 'string' ? d.split('T')[0] : format(new Date(d), 'yyyy-MM-dd');
        return sdString === dayString;
      });
    });
  };

  const handleDayClick = (day) => {
    const dayActivities = getActivitiesForDay(day);
    if (dayActivities.length > 0) {
      setSelectedDay({ date: day, activities: dayActivities });
      setShowPopup(true);
    }
  };

  // ── Day highlight logic ───────────────────────────────────────────────────
  // Returns 'completed' | 'missed' | 'partial' | 'upcoming'
  const getDayHighlight = (day) => {
    const dayString = format(day, 'yyyy-MM-dd');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const isPast = dayStart < today;

    // Only colour-code past days (or today) — future stays blue
    if (!isPast) return 'upcoming';

    // Filter subactivities that fall on this day
    const daySubs = subActivities.filter(sub => {
      if (!sub.scheduledDate) return false;
      const s = typeof sub.scheduledDate === 'string'
        ? sub.scheduledDate.split('T')[0]
        : format(new Date(sub.scheduledDate), 'yyyy-MM-dd');
      return s === dayString;
    });

    // No subactivities yet — fall back to parent activity status
    if (daySubs.length === 0) {
      const dayActivities = getActivitiesForDay(day);
      if (dayActivities.length === 0) return 'upcoming';
      const allDone = dayActivities.every(a => a.status === 'Completed');
      return allDone ? 'completed' : 'missed';
    }

    const completedCount = daySubs.filter(s => s.status === 'Completed').length;
    if (completedCount === daySubs.length)    return 'completed';
    if (completedCount === 0)                 return 'missed';
    return 'partial'; // some done, some not
  };

  // Badge colour for a day
  const getDayBadgeClass = (highlight) => {
    switch (highlight) {
      case 'completed': return 'bg-green-500';
      case 'missed':    return 'bg-red-500';
      case 'partial':   return 'bg-orange-400';
      default:          return 'bg-blue-500'; // upcoming / future
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const closePopup = () => {
    setShowPopup(false);
    setSelectedDay(null);
  };

  const goToPrevious = () => {
    if (view === 'monthly') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(subWeeks(currentDate, 1));
  };

  const goToNext = () => {
    if (view === 'monthly') setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addWeeks(currentDate, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd   = endOfMonth(currentDate);
    const gridStart  = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd    = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const rows = [];
    let days = [];
    let day  = gridStart;

    while (day <= gridEnd) {
      for (let i = 0; i < 7; i++) {
        const currentDay    = day;
        const dayActivities = getActivitiesForDay(currentDay);
        const isCurrentMonth = isSameMonth(currentDay, monthStart);
        const isToday = isSameDay(currentDay, new Date());
        const highlight = getDayHighlight(currentDay);
        const badgeClass = getDayBadgeClass(highlight);

        days.push(
          <div
            key={currentDay.toString()}
            onClick={() => handleDayClick(currentDay)}
            className={`min-h-20 sm:min-h-28 border border-gray-200 p-1 sm:p-2 transition-colors ${
              isCurrentMonth ? 'bg-white' : 'bg-gray-50'
            } ${dayActivities.length > 0 ? 'cursor-pointer hover:bg-blue-50' : ''}
            ${isToday ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className={`text-xs sm:text-sm font-semibold mb-1 ${
              isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
            }`}>
              {format(currentDay, 'd')}
            </div>
            {dayActivities.length > 0 && (
              <div className="space-y-1">
                <div className={`text-white text-xs rounded px-1 sm:px-2 py-0.5 sm:py-1 text-center font-medium ${badgeClass}`}>
                  {dayActivities.length} {dayActivities.length === 1 ? 'activity' : 'activities'}
                </div>
                <div className="hidden sm:block text-xs text-gray-600 truncate">
                  {dayActivities[0].isRecurring && '🔄 '}{dayActivities[0].name}
                </div>
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="space-y-0">{rows}</div>;
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayActivities = getActivitiesForDay(day);
      const isToday = isSameDay(day, new Date());
      const highlight = getDayHighlight(day);
      const badgeClass = getDayBadgeClass(highlight);

      days.push(
        <div
          key={day.toString()}
          onClick={() => handleDayClick(day)}
          className={[
            'border border-gray-200 bg-white transition-colors',
            'flex flex-row items-start gap-3 p-3',
            'sm:flex-col sm:p-4 sm:min-h-48',
            dayActivities.length > 0 ? 'cursor-pointer hover:bg-blue-50' : '',
            isToday ? 'ring-2 ring-inset ring-blue-500' : '',
          ].join(' ')}
        >
          {/* Day label — always visible on both layouts */}
          <div className={`shrink-0 sm:w-auto text-left sm:text-left font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {/* Mobile: "Sun 9" on one line */}
            <div className="sm:hidden text-sm">
              <span className="font-bold">{format(day, 'EEE')}</span>
              <span className="ml-1 text-base font-black">{format(day, 'd')}</span>
            </div>
            {/* Desktop: stacked */}
            <div className="hidden sm:block">
              <div className="text-sm">{format(day, 'EEE')}</div>
              <div className="text-2xl">{format(day, 'd')}</div>
            </div>
          </div>

          {/* Activities */}
          {dayActivities.length > 0 ? (
            <div className="flex-1 min-w-0 space-y-1 sm:space-y-2 w-full">
              <div className={`text-white text-xs sm:text-sm rounded px-2 py-1 text-center font-medium ${badgeClass}`}>
                {dayActivities.length} {dayActivities.length === 1 ? 'activity' : 'activities'}
              </div>
              <div className="space-y-1 max-h-20 sm:max-h-32 overflow-y-auto">
                {dayActivities.slice(0, 3).map((activity, idx) => (
                  <div key={idx} className="text-xs bg-gray-100 rounded p-1 truncate">
                    {activity.isRecurring && '🔄 '}{activity.name}
                  </div>
                ))}
                {dayActivities.length > 3 && (
                  <div className="text-xs text-gray-500">+{dayActivities.length - 3} more</div>
                )}
              </div>
            </div>
          ) : (
            /* Empty day: show a subtle placeholder on mobile so the row still has height */
            <div className="flex-1 flex items-center sm:hidden">
              <span className="text-xs text-gray-300 italic">No tasks</span>
            </div>
          )}
        </div>
      );
    }

    // Mobile: single column stack  |  Desktop: 7-column grid
    return <div className="grid grid-cols-1 sm:grid-cols-7 gap-0">{days}</div>;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':   return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low':    return 'bg-green-100 text-green-800';
      default:       return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':   return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      default:            return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {view === 'monthly' ? 'Monthly' : 'Weekly'} Activity Calendar
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setView('monthly')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                view === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📅 Monthly
            </button>
            <button
              onClick={() => setView('weekly')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                view === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📆 Weekly
            </button>
          </div>
        </div>

        {/* Color Legend */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-2">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span> Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span> Missed
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-orange-400"></span> Partial
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span> Upcoming
          </span>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            {view === 'monthly'
              ? format(currentDate, 'MMMM yyyy')
              : `${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d')} – ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`
            }
          </h3>
          <div className="flex gap-2">
            <button onClick={goToPrevious} className="px-2 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm sm:text-base">←</button>
            <button onClick={goToToday}    className="px-2 sm:px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm sm:text-base">Today</button>
            <button onClick={goToNext}     className="px-2 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm sm:text-base">→</button>
          </div>
        </div>
      </div>

      {/* Day Headers — hidden on mobile for weekly view (days show inline in each card) */}
      <div className={`grid grid-cols-7 mb-2 ${view === 'weekly' ? 'hidden sm:grid' : ''}`}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs sm:text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {view === 'monthly' ? renderMonthView() : renderWeekView()}

      {/* Activity Popup */}
      {showPopup && selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Activities for {format(selectedDay.date, 'MMMM d, yyyy')}
                </h3>
                <button onClick={closePopup} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                {selectedDay.activities.map((activity) => {
                  // Find the matching subactivity for this specific day
                  const dayString = format(selectedDay.date, 'yyyy-MM-dd');
                  const sub = subActivities.find(s => {
                    const sid = s.parentActivityId?._id ?? s.parentActivityId;
                    if (!sid || sid.toString() !== activity._id.toString()) return false;
                    const sd = typeof s.scheduledDate === 'string'
                      ? s.scheduledDate.split('T')[0]
                      : format(new Date(s.scheduledDate), 'yyyy-MM-dd');
                    return sd === dayString;
                  });

                  const subStatus    = sub?.status ?? null;
                  const subCompleted = subStatus === 'Completed';
                  const subValue     = sub?.completionValue ?? null;
                  const subNotes     = sub?.notes ?? '';
                  const subCompletedAt = sub?.completedAt ?? null;
                  const metric       = activity.metric || null;

                  return (
                  <div key={activity._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900">{activity.name}</h4>
                        {activity.isRecurring && (
                          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 mt-1">
                            🔄 {activity.recurrencePattern}
                            {activity.recurrencePattern === 'monthly' && activity.recurrenceMonthDay
                              ? ` · day ${activity.recurrenceMonthDay}`
                              : ''}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(activity.priority)}`}>
                          {activity.priority}
                        </span>
                        {/* Show per-day subactivity status if available, else parent status */}
                        {subStatus ? (
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(subStatus)}`}>
                            {subStatus}
                          </span>
                        ) : (
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {activity.description && (
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                    )}

                    {/* ── SubActivity completion detail ── */}
                    {sub && (
                      <div className={`rounded-lg px-3 py-2.5 mb-3 border text-sm ${
                        subCompleted
                          ? 'bg-green-50 border-green-200'
                          : subStatus === 'In Progress'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-gray-50 border-gray-200'
                      }`}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1.5 ${
                          subCompleted ? 'text-green-700' : 'text-gray-500'
                        }">
                          {subCompleted ? '✅ Completion Details' : '📋 Task Record'}
                        </p>
                        <div className="space-y-1 text-xs text-gray-700">
                          {subCompleted && subCompletedAt && (
                            <div>🕐 Completed at: <span className="font-medium">
                              {format(parseISO(subCompletedAt.split('T')[0]), 'MMM d, yyyy')}
                            </span></div>
                          )}
                          {subCompleted && metric && subValue !== null && subValue > 0 && (
                            <div>📊 {metric}: <span className="font-semibold text-green-700">{subValue}</span></div>
                          )}
                          {subCompleted && metric && (subValue === null || subValue === 0) && (
                            <div className="text-gray-400 italic">No value recorded</div>
                          )}
                          {!subCompleted && (
                            <div className="text-gray-500 italic">Not completed on this day</div>
                          )}
                          {subNotes && (
                            <div>📝 Notes: <span className="font-medium">{subNotes}</span></div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                      {activity.duration > 0 && <div>⏱️ Duration: {activity.duration} min</div>}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
