'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import ProtectedLayout from '@/components/Layout/ProtectedLayout';
import UtilityCard from '@/components/HomeUtility/UtilityCard';
import UtilityForm from '@/components/HomeUtility/UtilityForm';
import api from '@/lib/axios';

const CATEGORIES = ['All', 'Appliance', 'Plumbing', 'Electrical', 'HVAC', 'Vehicle', 'Other'];
const STATUSES   = ['All', 'Active', 'Inactive', 'Disposed'];

export default function UtilitiesPage() {
  const [utilities, setUtilities]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [category, setCategory]     = useState('All');
  const [statusFilter, setStatus]   = useState('All');

  const fetchUtilities = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (category   !== 'All') params.category = category;
      if (statusFilter !== 'All') params.status  = statusFilter;
      const { data } = await api.get('/utilities', { params });
      setUtilities(data.data ?? data.utilities ?? []);
    } catch (err) {
      setError('Failed to load utilities.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, statusFilter]);

  useEffect(() => { fetchUtilities(); }, [fetchUtilities]);

  const handleCreate = async (payload) => {
    setSaving(true);
    try {
      await api.post('/utilities', payload);
      setShowForm(false);
      fetchUtilities();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not create utility.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleted = async (id) => {
    if (!confirm('Delete this utility and all its documents?')) return;
    try {
      await api.delete(`/utilities/${id}`);
      fetchUtilities();
    } catch (err) {
      setError('Could not delete utility.');
    }
  };

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🏠 Home Utilities</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track appliances, warranties &amp; service schedules</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setError(''); }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            + Add Utility
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div>
            <label className="text-xs font-medium text-gray-600 mr-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-300 outline-none">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mr-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-300 outline-none">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          {(category !== 'All' || statusFilter !== 'All') && (
            <button onClick={() => { setCategory('All'); setStatus('All'); }}
              className="text-xs text-gray-400 hover:text-gray-600 underline self-end pb-1">
              Clear filters
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : utilities.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🔧</div>
            <p className="text-lg font-medium text-gray-500">No utilities found</p>
            <p className="text-sm mt-1">Add your first appliance or home system to get started.</p>
            <button onClick={() => setShowForm(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg">
              + Add Utility
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {utilities.map(u => (
              <UtilityCard key={u._id} utility={u} onDeleted={() => handleDeleted(u._id)} />
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Utility</h2>
            <UtilityForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              loading={saving}
            />
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
