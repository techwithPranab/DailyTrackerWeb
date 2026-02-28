'use client';

import { useState, useEffect } from 'react';

const SERVICE_STATUSES = ['Upcoming', 'Completed', 'Missed'];

const EMPTY = {
  serviceType: '', scheduledDate: '', completedDate: '',
  cost: '', technician: '', notes: '', status: 'Upcoming'
};

export default function ServiceForm({ onSubmit, onCancel, initial, loading }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (initial) {
      setForm({
        serviceType:   initial.serviceType   ?? '',
        scheduledDate: initial.scheduledDate ? new Date(initial.scheduledDate).toISOString().slice(0, 10) : '',
        completedDate: initial.completedDate ? new Date(initial.completedDate).toISOString().slice(0, 10) : '',
        cost:          initial.cost          ?? '',
        technician:    initial.technician    ?? '',
        notes:         initial.notes         ?? '',
        status:        initial.status        ?? 'Upcoming'
      });
    } else {
      setForm(EMPTY);
    }
  }, [initial]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.completedDate) delete payload.completedDate;
    if (payload.cost === '')    delete payload.cost;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Service type + Scheduled date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
          <input name="serviceType" required value={form.serviceType} onChange={handle}
            placeholder="Annual Service / Filter Clean"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
          <input type="date" name="scheduledDate" required value={form.scheduledDate} onChange={handle}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Status + Cost */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="status" value={form.status} onChange={handle}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {SERVICE_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cost (₹)</label>
          <input type="number" name="cost" min="0" value={form.cost} onChange={handle}
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Technician + Completed date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
          <input name="technician" value={form.technician} onChange={handle}
            placeholder="Rajan (AC Service)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Completed Date</label>
          <input type="date" name="completedDate" value={form.completedDate} onChange={handle}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea name="notes" rows={2} value={form.notes} onChange={handle}
          placeholder="Any remarks about this service…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        )}
        <button type="submit" disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Saving…' : (initial ? 'Update Service' : 'Add Service')}
        </button>
      </div>
    </form>
  );
}
