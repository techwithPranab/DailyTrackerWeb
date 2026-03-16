'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

// ── Single missed-task row (no date badge — date shown in group header) ────────
function MissedCard({ sub, onUpdated }) {
  const [saving,          setSaving]          = useState(false);
  const [completionValue, setCompletionValue] = useState('');
  const [showValueInput,  setShowValueInput]  = useState(false);

  const parent = sub.parentActivityId;
  const metric = parent?.metric || 'value';

  const markComplete = async () => {
    setSaving(true);
    try {
      await api.put(`/subactivities/${sub._id}`, {
        status: 'Completed',
        completionValue: completionValue !== '' ? Number(completionValue) : 0
      });
      toast.success('Marked complete ✅');
      onUpdated();
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
      setShowValueInput(false);
    }
  };

  const markSkipped = async () => {
    setSaving(true);
    try {
      await api.put(`/subactivities/${sub._id}`, { status: 'In Progress' });
      toast('Marked as skipped', { icon: '⏭️' });
      onUpdated();
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-start gap-3 py-3 px-4 hover:bg-red-50 transition-colors border-b border-red-100 last:border-0">
      {/* Activity info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{parent?.name ?? '—'}</p>
        <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-1">
          {parent?.category && <span>{parent.category}</span>}
          {parent?.isRecurring && <span>· 🔄 {parent.recurrencePattern}</span>}
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
            sub.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
          }`}>{sub.status}</span>
        </p>

        {/* Value input when completing */}
        {showValueInput && (
          <div className="mt-2 flex flex-wrap gap-1.5 items-center">
            <input
              type="number"
              min="0"
              step="any"
              value={completionValue}
              onChange={e => setCompletionValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && markComplete()}
              placeholder="0"
              autoFocus
              className="w-24 text-xs border border-green-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-400"
            />
            <span className="text-xs text-gray-500 font-medium">{metric}</span>
            <button
              onClick={markComplete}
              disabled={saving}
              className="text-xs bg-green-600 text-white px-2.5 py-1 rounded hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {saving ? '…' : 'Save'}
            </button>
            <button
              onClick={() => setShowValueInput(false)}
              className="text-xs text-gray-400 hover:text-gray-700"
            >✕</button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!showValueInput && (
        <div className="shrink-0 flex gap-1.5">
          <button
            onClick={() => setShowValueInput(true)}
            disabled={saving}
            className="text-xs font-medium bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
          >
            ✓ Done
          </button>
          <button
            onClick={markSkipped}
            disabled={saving}
            className="text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
            title="Skip this task"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}

// ── Group tasks by YYYY-MM-DD and return sorted array of { dateStr, label, daysAgo, tasks } ──
function groupByDay(missed) {
  const map = {};
  missed.forEach(sub => {
    const dateStr = sub.scheduledDate.split('T')[0];
    if (!map[dateStr]) map[dateStr] = [];
    map[dateStr].push(sub);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Object.entries(map)
    .sort(([a], [b]) => (a < b ? 1 : -1)) // newest first
    .map(([dateStr, tasks]) => {
      const d = parseISO(dateStr);
      const daysAgo = differenceInCalendarDays(today, d);
      let label;
      if (daysAgo === 1) label = 'Yesterday';
      else if (daysAgo === 0) label = 'Today';
      else label = format(d, 'EEEE, MMM d'); // e.g. "Monday, Mar 10"
      return { dateStr, label, daysAgo, tasks };
    });
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function MissedTasksPanel({ onCountChange }) {
  const [missed,      setMissed]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [collapsed,   setCollapsed]   = useState(false);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const LIMIT = 10;

  const load = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get('/subactivities/missed', {
        params: { page: p, limit: LIMIT }
      });
      setMissed(data.data || []);
      setTotalPages(data.totalPages ?? 1);
      setTotalCount(data.totalCount ?? 0);
      setPage(p);
      if (onCountChange) onCountChange(data.totalCount ?? 0);
    } catch {
      // Silently fail — don't block the dashboard
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => { load(1); }, [load]);

  if (!loading && totalCount === 0) return null;

  const groups = groupByDay(missed);

  return (
    <div className="mb-6 sm:mb-8">
      {/* Section header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-red-700">
            ⚠️ Missed Tasks
          </h2>
          {!loading && totalCount > 0 && (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalCount}
            </span>
          )}
        </div>
        <span className="text-gray-400 group-hover:text-gray-600 text-sm select-none">
          {collapsed ? '▼ Show' : '▲ Hide'}
        </span>
      </button>

      {!collapsed && (
        <>
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 flex items-center justify-center gap-2 text-gray-400">
              <div className="animate-spin h-4 w-4 rounded-full border-2 border-red-400 border-t-transparent" />
              <span className="text-sm">Checking missed tasks…</span>
            </div>
          ) : (
            <>
              {/* Day-grouped task cards */}
              <div className="space-y-4">
                {groups.map(({ dateStr, label, daysAgo, tasks }) => (
                  <div key={dateStr} className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
                    {/* Day group header */}
                    <div className="bg-red-50 px-4 py-2.5 border-b border-red-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          {format(parseISO(dateStr), 'MMM d')}
                        </span>
                        <span className="text-sm font-semibold text-red-800">{label}</span>
                      </div>
                      <span className="text-xs text-red-500 font-medium">
                        {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                        {daysAgo > 1 ? ` · ${daysAgo}d ago` : ''}
                      </span>
                    </div>

                    {/* Task cards for this day */}
                    <div className="divide-y divide-red-50">
                      {tasks.map(sub => (
                        <MissedCard key={sub._id} sub={sub} onUpdated={() => load(page)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Pagination bar ── */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between px-1">
                  <p className="text-xs text-gray-500">
                    Page <span className="font-semibold">{page}</span> of{' '}
                    <span className="font-semibold">{totalPages}</span>
                    {' '}· {totalCount} total
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => load(1)}
                      disabled={page === 1}
                      className="px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                      title="First page"
                    >«</button>
                    <button
                      onClick={() => load(page - 1)}
                      disabled={page === 1}
                      className="px-2.5 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                    >‹ Prev</button>

                    {/* Page number pills */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === '…' ? (
                          <span key={`ellipsis-${idx}`} className="px-1 text-xs text-gray-400">…</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => load(item)}
                            className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                              item === page
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >{item}</button>
                        )
                      )
                    }

                    <button
                      onClick={() => load(page + 1)}
                      disabled={page === totalPages}
                      className="px-2.5 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                    >Next ›</button>
                    <button
                      onClick={() => load(totalPages)}
                      disabled={page === totalPages}
                      className="px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                      title="Last page"
                    >»</button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
