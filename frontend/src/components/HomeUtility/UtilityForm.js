'use client';

import { useState, useEffect } from 'react';

const CATEGORIES = ['Appliance', 'Plumbing', 'Electrical', 'HVAC', 'Vehicle', 'Other'];
const STATUSES   = ['Active', 'Inactive', 'Disposed'];

const EMPTY = {
  name: '', category: 'Appliance', brand: '', modelNumber: '',
  purchaseDate: '', warrantyExpiryDate: '', location: '', notes: '', status: 'Active'
};

export default function UtilityForm({ onSubmit, onCancel, initial, loading }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (initial) {
      setForm({
        name:               initial.name               ?? '',
        category:           initial.category           ?? 'Appliance',
        brand:              initial.brand              ?? '',
        modelNumber:        initial.modelNumber        ?? '',
        purchaseDate:       initial.purchaseDate       ? new Date(initial.purchaseDate).toISOString().slice(0, 10) : '',
        warrantyExpiryDate: initial.warrantyExpiryDate ? new Date(initial.warrantyExpiryDate).toISOString().slice(0, 10) : '',
        location:           initial.location           ?? '',
        notes:              initial.notes              ?? '',
        status:             initial.status             ?? 'Active'
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
    if (!payload.purchaseDate)       delete payload.purchaseDate;
    if (!payload.warrantyExpiryDate) delete payload.warrantyExpiryDate;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Utility Name *</label>
          <input name="name" required value={form.name} onChange={handle}
            placeholder="Samsung Split AC – Bedroom"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select name="category" value={form.category} onChange={handle}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Brand + Model */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <input name="brand" value={form.brand} onChange={handle} placeholder="Samsung"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model Number</label>
          <input name="modelNumber" value={form.modelNumber} onChange={handle} placeholder="AR18BYNZAWK"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Purchase date + Warranty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
          <input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handle}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry</label>
          <input type="date" name="warrantyExpiryDate" value={form.warrantyExpiryDate} onChange={handle}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Location + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input name="location" value={form.location} onChange={handle} placeholder="Master Bedroom"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="status" value={form.status} onChange={handle}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea name="notes" rows={3} value={form.notes} onChange={handle}
          placeholder="Any additional notes…"
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
          {loading ? 'Saving…' : (initial ? 'Update Utility' : 'Add Utility')}
        </button>
      </div>
    </form>
  );
}
