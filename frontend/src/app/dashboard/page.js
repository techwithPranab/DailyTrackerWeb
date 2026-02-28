'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import ProtectedLayout from '@/components/Layout/ProtectedLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ActivityCard from '@/components/Activities/ActivityCard';
import Link from 'next/link';

const STATUS_COLORS = {
  'Not Started': 'bg-gray-100 text-gray-700',
  'In Progress':  'bg-yellow-100 text-yellow-800',
  'Completed':    'bg-green-100 text-green-800'
};

// ── Compact today-sub-activity card ──────────────────────────────────────────
function TodaySubActivityCard({ sub, onUpdated }) {
  const [status,  setStatus]  = useState(sub.status);
  const [notes,   setNotes]   = useState(sub.notes || '');
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);

  const parent = sub.parentActivityId;

  const changeStatus = async (newStatus) => {
    setSaving(true);
    try {
      const { data } = await api.put(`/subactivities/${sub._id}`, { status: newStatus });
      setStatus(data.data.status);
      onUpdated();
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async () => {
    setSaving(true);
    try {
      await api.put(`/subactivities/${sub._id}`, { notes });
      setEditing(false);
      onUpdated();
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${
      status === 'Completed'   ? 'border-green-400'  :
      status === 'In Progress' ? 'border-yellow-400' : 'border-gray-200'
    }`}>
      {/* Activity name + category */}
      <div className="flex justify-between items-start mb-2 gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-900">{parent?.name ?? '—'}</p>
          <p className="text-xs text-gray-400">{parent?.category} · {parent?.isRecurring ? parent?.recurrencePattern : 'one-time'}</p>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[status]}`}>
          {status}
        </span>
      </div>

      {/* Status action buttons */}
      <div className="flex gap-1.5 mb-2">
        {status !== 'In Progress' && status !== 'Completed' && (
          <button
            onClick={() => changeStatus('In Progress')}
            disabled={saving}
            className="flex-1 text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md px-2 py-1.5 hover:bg-yellow-100 disabled:opacity-50 transition-colors"
          >
            ▶ Start
          </button>
        )}
        {status !== 'Completed' && (
          <button
            onClick={() => changeStatus('Completed')}
            disabled={saving}
            className="flex-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-md px-2 py-1.5 hover:bg-green-100 disabled:opacity-50 transition-colors"
          >
            ✓ Done
          </button>
        )}
        {status === 'Completed' && (
          <button
            onClick={() => changeStatus('Not Started')}
            disabled={saving}
            className="flex-1 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 rounded-md px-2 py-1.5 hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            ↩ Undo
          </button>
        )}
      </div>

      {/* Notes */}
      {editing ? (
        <div className="flex gap-1.5 items-center">
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveNotes()}
            autoFocus
            className="flex-1 text-xs border border-blue-300 rounded px-2 py-1 focus:outline-none"
            placeholder="Note for today…"
          />
          <button onClick={saveNotes} disabled={saving}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
            {saving ? '…' : 'Save'}
          </button>
          <button onClick={() => { setNotes(sub.notes || ''); setEditing(false); }}
            className="text-xs text-gray-400 hover:text-gray-700">✕</button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)}
          className="text-xs text-gray-400 hover:text-blue-600 transition-colors text-left w-full">
          {notes ? `📝 ${notes}` : '+ add note'}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const [todayActivities,    setTodayActivities]    = useState([]);
  const [todaySubActivities, setTodaySubActivities] = useState([]);
  const [upcomingReminders,  setUpcomingReminders]  = useState([]);
  const [upcomingServices,   setUpcomingServices]   = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, notStarted: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');

      const [activitiesRes, remindersRes, subActivitiesRes, servicesRes] = await Promise.all([
        api.get('/activities/today'),
        api.get('/reminders?upcoming=true'),
        api.get(`/subactivities/date/${today}`),
        api.get('/utilities/services/upcoming').catch(() => ({ data: [] }))
      ]);

      const activities = activitiesRes.data.data;
      setTodayActivities(activities);
      setUpcomingReminders(remindersRes.data.data);
      setTodaySubActivities(subActivitiesRes.data.data);
      setUpcomingServices(servicesRes.data?.services ?? servicesRes.data ?? []);

      // Stats from today's sub-activities (more accurate per-day view)
      const subs = subActivitiesRes.data.data;
      setStats({
        total:       subs.length,
        completed:   subs.filter(s => s.status === 'Completed').length,
        inProgress:  subs.filter(s => s.status === 'In Progress').length,
        notStarted:  subs.filter(s => s.status === 'Not Started').length
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      </ProtectedLayout>
    );
  }

  const subDone  = stats.completed;
  const subTotal = stats.total;
  const subPct   = subTotal === 0 ? 0 : Math.round((subDone / subTotal) * 100);

  return (
    <ProtectedLayout>
      <div className="px-4 py-6 sm:px-0">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Here's what's on your plate today — {format(new Date(), 'EEEE, MMMM d')}.
          </p>
        </div>

        {/* ── Today's Sub-Activities (per-day tasks) ─────────────────────── */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Today's Tasks
              </h2>
              {subTotal > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {subDone}/{subTotal} completed today
                </p>
              )}
            </div>
            <Link href="/activities" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              All activities →
            </Link>
          </div>

          {/* Progress bar */}
          {subTotal > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${subPct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-600">{subPct}%</span>
            </div>
          )}

          {todaySubActivities.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {todaySubActivities.map(sub => (
                <TodaySubActivityCard
                  key={sub._id}
                  sub={sub}
                  onUpdated={fetchDashboardData}
                />
              ))}
            </div>
          ) : todayActivities.length > 0 ? (
            /* Fallback: show parent activity cards when no sub-activities yet */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {todayActivities.map(activity => (
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
              <p className="text-base sm:text-lg">No tasks scheduled for today</p>
              <Link href="/activities"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                Add Activity
              </Link>
            </div>
          )}
        </div>

        {/* ── Stats Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Today's Tasks</div>
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

        {/* ── Quick Actions ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Link href="/activities"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow p-4 sm:p-6 hover:from-blue-600 hover:to-blue-700 transition-all">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-base sm:text-lg font-semibold">Manage Activities</div>
            <div className="text-xs sm:text-sm opacity-90 mt-1">Add, edit, or view activities</div>
          </Link>
          <Link href="/calendar"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow p-4 sm:p-6 hover:from-purple-600 hover:to-purple-700 transition-all">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-base sm:text-lg font-semibold">View Calendar</div>
            <div className="text-xs sm:text-sm opacity-90 mt-1">Monthly/Weekly view</div>
          </Link>
          <Link href="/milestones"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow p-4 sm:p-6 hover:from-green-600 hover:to-green-700 transition-all">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-base sm:text-lg font-semibold">Track Milestones</div>
            <div className="text-xs sm:text-sm opacity-90 mt-1">Set and achieve goals</div>
          </Link>
        </div>

        {/* ── Upcoming Services ─────────────────────────────────────────── */}
        {upcomingServices.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Upcoming Services ⚙️</h2>
              <Link href="/utilities" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                All utilities →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingServices.slice(0, 6).map((svc, idx) => {
                const days = svc.daysUntilDue ?? 0;
                const badgeColor = days <= 0   ? 'bg-red-100 text-red-700 border-red-200'
                  : days <= 3  ? 'bg-orange-100 text-orange-700 border-orange-200'
                  : days <= 7  ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  :              'bg-blue-50 text-blue-700 border-blue-200';
                return (
                  <Link key={idx} href={`/utilities/${svc.utilityId}`}
                    className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-400 hover:shadow-md transition-shadow block">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{svc.utilityName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{svc.serviceType}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${badgeColor}`}>
                        {days <= 0 ? 'Overdue' : days === 1 ? 'Tomorrow' : `${days}d`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      📅 {format(new Date(svc.scheduledDate), 'MMM d, yyyy')}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Upcoming Reminders ────────────────────────────────────────────── */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Upcoming Reminders ⏰
          </h2>
          {upcomingReminders.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {upcomingReminders.slice(0, 5).map(reminder => (
                  <li key={reminder._id} className="px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{reminder.activityId?.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{reminder.message}</p>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500 sm:ml-4 flex-shrink-0">
                        {format(new Date(reminder.reminderTime), 'MMM dd, HH:mm')}
                      </span>
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
