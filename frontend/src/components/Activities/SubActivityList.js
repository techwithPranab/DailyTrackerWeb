'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  'Not Started': 'bg-gray-100 text-gray-700',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Completed':   'bg-green-100 text-green-800'
};

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Completed'];

function ProgressBar({ completed, total }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
        {completed}/{total} done ({pct}%)
      </span>
    </div>
  );
}

function SubActivityRow({ sub, onUpdated, activityMetric }) {
  const [status,           setStatus]           = useState(sub.status);
  const [notes,            setNotes]             = useState(sub.notes || '');
  const [editing,          setEditing]           = useState(false);
  const [saving,           setSaving]            = useState(false);
  const [completionValue,  setCompletionValue]   = useState(sub.completionValue ?? '');
  const [editingValue,     setEditingValue]      = useState(false);

  const metric = activityMetric || 'value';

  const saveStatus = async (newStatus) => {
    setSaving(true);
    try {
      const payload = { status: newStatus };
      // Carry current completionValue when marking Completed
      if (newStatus === 'Completed') {
        payload.completionValue = completionValue !== '' ? Number(completionValue) : 0;
      }
      const { data } = await api.put(`/subactivities/${sub._id}`, payload);
      setStatus(data.data.status);
      toast.success('Status updated');
      if (newStatus === 'Completed') setEditingValue(true);
      onUpdated();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const saveValue = async () => {
    setSaving(true);
    try {
      await api.put(`/subactivities/${sub._id}`, {
        status: 'Completed',
        completionValue: completionValue !== '' ? Number(completionValue) : 0
      });
      toast.success('Value saved');
      setEditingValue(false);
      onUpdated();
    } catch {
      toast.error('Failed to save value');
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async () => {
    setSaving(true);
    try {
      await api.put(`/subactivities/${sub._id}`, { notes });
      toast.success('Notes saved');
      setEditing(false);
      onUpdated();
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      {/* Date */}
      <td className="py-2.5 px-3 text-sm text-gray-700 whitespace-nowrap font-medium">
        {format(new Date(sub.scheduledDate), 'EEE, MMM d')}
      </td>

      {/* Status pill + cycle button */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
            {status}
          </span>
          <select
            value={status}
            disabled={saving}
            onChange={(e) => saveStatus(e.target.value)}
            className="text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white text-gray-700 cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </td>

      {/* Value (shown when Completed) */}
      <td className="py-2.5 px-3 whitespace-nowrap">
        {status === 'Completed' ? (
          editingValue ? (
            <div className="flex gap-1 items-center">
              <input
                type="number"
                min="0"
                value={completionValue}
                onChange={e => setCompletionValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveValue()}
                className="w-20 text-xs border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="0"
                autoFocus
              />
              <span className="text-xs text-gray-500">{metric}</span>
              <button onClick={saveValue} disabled={saving}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50">
                {saving ? '…' : 'OK'}
              </button>
              <button onClick={() => setEditingValue(false)} className="text-xs text-gray-400 hover:text-gray-700">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setEditingValue(true)}
              className="text-xs text-blue-600 hover:underline"
            >
              {completionValue !== '' && completionValue !== 0
                ? `${completionValue} ${metric}`
                : <span className="italic text-gray-300">+ add {metric}</span>}
            </button>
          )
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>

      {/* Notes */}
      <td className="py-2.5 px-3 w-full">
        {editing ? (
          <div className="flex gap-1.5 items-center">
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveNotes()}
              className="flex-1 text-xs border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="Add a note for this day…"
              autoFocus
            />
            <button
              onClick={saveNotes}
              disabled={saving}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '…' : 'Save'}
            </button>
            <button
              onClick={() => { setNotes(sub.notes || ''); setEditing(false); }}
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-left text-gray-500 hover:text-blue-600 transition-colors"
          >
            {notes ? notes : <span className="italic text-gray-300">+ add note</span>}
          </button>
        )}
      </td>

      {/* Completed at */}
      <td className="py-2.5 px-3 text-xs text-gray-400 whitespace-nowrap hidden sm:table-cell">
        {sub.completedAt ? format(new Date(sub.completedAt), 'MMM d, HH:mm') : '—'}
      </td>
    </tr>
  );
}

export default function SubActivityList({ activityId, activityName, activityMetric }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all'); // all | Not Started | In Progress | Completed

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data: res } = await api.get(`/activities/${activityId}/subactivities`);
      setData(res);
    } catch {
      toast.error('Failed to load sub-activities');
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="ml-2 text-sm text-gray-500">Loading sub-activities…</span>
      </div>
    );
  }

  if (!data) return null;

  const { stats, data: subs } = data;

  const filtered = filter === 'all' ? subs : subs.filter(s => s.status === filter);

  return (
    <div className="mt-3 px-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
        <h4 className="text-sm font-semibold text-gray-800">
          📋 Daily Sub-activities
          <span className="ml-2 text-xs font-normal text-gray-500">
            ({stats.total} days total)
          </span>
        </h4>
        {/* Filter tabs */}
        <div className="flex gap-1 sm:ml-auto flex-wrap">
          {['all', 'Not Started', 'In Progress', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All' : f}
              {f !== 'all' && (
                <span className="ml-1 opacity-70">
                  ({f === 'Not Started' ? stats.notStarted
                    : f === 'In Progress' ? stats.inProgress
                    : stats.completed})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar completed={stats.completed} total={stats.total} />

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-2">No sub-activities match this filter.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">{activityMetric || 'Value'}</th>
                <th className="text-left px-3 py-2">Notes</th>
                <th className="text-left px-3 py-2 hidden sm:table-cell">Completed At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(sub => (
                <SubActivityRow key={sub._id} sub={sub} onUpdated={load} activityMetric={activityMetric} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
