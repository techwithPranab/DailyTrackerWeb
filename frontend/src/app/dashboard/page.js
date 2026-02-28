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
import PlanUsageBar from '@/components/Subscription/PlanUsageBar';
import PlanModal from '@/components/Subscription/PlanModal';
import usePlanFeatures from '@/hooks/usePlanFeatures';

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
  const { plan, features, isLimitReached } = usePlanFeatures();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [todayActivities,    setTodayActivities]    = useState([]);
  const [todaySubActivities, setTodaySubActivities] = useState([]);
  const [upcomingReminders,  setUpcomingReminders]  = useState([]);
  const [upcomingServices,   setUpcomingServices]   = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, notStarted: 0 });
  const [allActivitiesCount, setAllActivitiesCount] = useState(0);
  const [utilitiesCount, setUtilitiesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');

      const [activitiesRes, remindersRes, subActivitiesRes, servicesRes, allActivitiesRes, utilitiesRes] = await Promise.all([
        api.get('/activities/today'),
        api.get('/reminders?upcoming=true'),
        api.get(`/subactivities/date/${today}`),
        api.get('/utilities/services/upcoming').catch(() => ({ data: [] })),
        api.get('/activities').catch(() => ({ data: { data: [] } })),
        api.get('/utilities').catch(() => ({ data: { data: [] } })),
      ]);

      const activities = activitiesRes.data.data;
      setTodayActivities(activities);
      setUpcomingReminders(remindersRes.data.data);
      setTodaySubActivities(subActivitiesRes.data.data);
      setUpcomingServices(servicesRes.data?.data ?? []);
      setAllActivitiesCount((allActivitiesRes.data?.data ?? []).length);
      setUtilitiesCount((utilitiesRes.data?.data ?? []).length);

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

        {/* ── Plan Usage widget (visible only when there are limits) ──────── */}
        {(features.activities !== -1 || features.utilities !== -1) && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Plan Usage
              </h2>
              <button
                onClick={() => setShowPlanModal(true)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Upgrade plan →
              </button>
            </div>
            <div className="space-y-3">
              {features.activities !== -1 && (
                <PlanUsageBar
                  label="Activities"
                  current={allActivitiesCount}
                  max={features.activities}
                  onUpgrade={() => setShowPlanModal(true)}
                />
              )}
              {features.utilities !== -1 && (
                <PlanUsageBar
                  label="Utilities"
                  current={utilitiesCount}
                  max={features.utilities}
                  onUpgrade={() => setShowPlanModal(true)}
                />
              )}
            </div>
          </div>
        )}

        {/* Plan upgrade modal */}
        {showPlanModal && (
          <PlanModal
            currentPlan={plan}
            onClose={() => setShowPlanModal(false)}
            onSuccess={() => setShowPlanModal(false)}
          />
        )}

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

        {/* ── Upcoming Reminders & Services ─────────────────────────────── */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Upcoming Reminders ⏰
          </h2>
          {(() => {
            // Merge activity reminders + utility service schedules into one sorted list
            const reminderItems = upcomingReminders.map(r => ({
              type: 'reminder',
              id: r._id,
              title: r.activityId?.name ?? 'Reminder',
              subtitle: r.message,
              date: new Date(r.reminderTime),
              dateLabel: format(new Date(r.reminderTime), 'MMM d, HH:mm'),
              badge: null,
            }));

            const serviceItems = upcomingServices.map(s => {
              const days = s.daysUntilDue ?? 0;
              const badgeColor = days <= 0  ? 'bg-red-100 text-red-700'
                : days <= 3  ? 'bg-orange-100 text-orange-700'
                : days <= 7  ? 'bg-yellow-100 text-yellow-700'
                :              'bg-blue-50 text-blue-700';
              return {
                type: 'service',
                id: s.serviceId,
                utilityId: s.utilityId,
                title: s.utilityName,
                subtitle: `🔧 ${s.serviceType}`,
                date: new Date(s.scheduledDate),
                dateLabel: format(new Date(s.scheduledDate), 'MMM d, yyyy'),
                badge: { label: days <= 0 ? 'Overdue' : days === 1 ? 'Tomorrow' : `${days}d`, color: badgeColor },
              };
            });

            const allItems = [...reminderItems, ...serviceItems]
              .sort((a, b) => a.date - b.date);

            if (allItems.length === 0) {
              return (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  No upcoming reminders or services
                </div>
              );
            }

            return (
              <div className="bg-white shadow overflow-hidden sm:rounded-xl divide-y divide-gray-100">
                {allItems.map(item => (
                  item.type === 'service' ? (
                    <Link key={`svc-${item.id}`} href={`/utilities/${item.utilityId}`}
                      className="flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">⚙️</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {item.badge && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.badge.color}`}>
                            {item.badge.label}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{item.dateLabel}</span>
                      </div>
                    </Link>
                  ) : (
                    <div key={`rem-${item.id}`} className="flex items-center justify-between px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">⏰</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.subtitle}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 ml-3">{item.dateLabel}</span>
                    </div>
                  )
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </ProtectedLayout>
  );
}
