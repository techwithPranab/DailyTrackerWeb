'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import ProtectedLayout from '@/components/Layout/ProtectedLayout';
import UtilityForm from '@/components/HomeUtility/UtilityForm';
import ServiceForm from '@/components/HomeUtility/ServiceForm';
import DocumentUpload from '@/components/HomeUtility/DocumentUpload';
import api from '@/lib/axios';

const CATEGORY_ICONS = {
  Appliance:  '🏠', Plumbing: '🔧', Electrical: '⚡',
  HVAC: '❄️', Vehicle: '🚗', Other: '📦'
};

const STATUS_BADGE = {
  Upcoming:  'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Missed:    'bg-red-100 text-red-700'
};

const UTILITY_STATUS_BADGE = {
  Active:   'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-600',
  Disposed: 'bg-red-100 text-red-600'
};

export default function UtilityDetailPage() {
  const { id } = useParams();
  const router  = useRouter();

  const [utility, setUtility]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // edit utility modal
  const [showEditUtil, setShowEditUtil]   = useState(false);
  const [savingUtil, setSavingUtil]       = useState(false);

  // service form modal
  const [showServiceForm, setShowServiceForm]     = useState(false);
  const [editingService, setEditingService]       = useState(null); // null = add, obj = edit
  const [savingService, setSavingService]         = useState(false);

  const fetchUtility = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/utilities/${id}`);
      setUtility(data.data);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not load utility.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchUtility(); }, [fetchUtility]);

  /* ── Utility CRUD ──────────────────────────────────── */
  const handleUpdateUtility = async (payload) => {
    setSavingUtil(true);
    try {
      const { data } = await api.put(`/utilities/${id}`, payload);
      setUtility(data.data);
      setShowEditUtil(false);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Update failed.');
    } finally {
      setSavingUtil(false);
    }
  };

  const handleDeleteUtility = async () => {
    if (!confirm('Delete this utility and all its documents? This cannot be undone.')) return;
    try {
      await api.delete(`/utilities/${id}`);
      router.push('/utilities');
    } catch (err) {
      setError('Could not delete utility.');
    }
  };

  /* ── Service schedule ──────────────────────────────── */
  const openAddService  = () => { setEditingService(null); setShowServiceForm(true); };
  const openEditService = (s) => { setEditingService(s); setShowServiceForm(true); };

  const handleSaveService = async (payload) => {
    setSavingService(true);
    try {
      if (editingService) {
        const { data } = await api.put(`/utilities/${id}/services/${editingService._id}`, payload);
        setUtility(data.data);
      } else {
        const { data } = await api.post(`/utilities/${id}/services`, payload);
        setUtility(data.data);
      }
      setShowServiceForm(false);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not save service entry.');
    } finally {
      setSavingService(false);
    }
  };

  const handleDeleteService = async (sid) => {
    if (!confirm('Remove this service entry?')) return;
    try {
      const { data } = await api.delete(`/utilities/${id}/services/${sid}`);
      setUtility(data.data);
    } catch (err) {
      setError('Could not delete service entry.');
    }
  };

  const handleCompleteService = async (s) => {
    try {
      const { data } = await api.put(`/utilities/${id}/services/${s._id}`, {
        ...s,
        status: 'Completed',
        completedDate: new Date().toISOString().slice(0, 10)
      });
      setUtility(data.data);
    } catch (err) {
      setError('Could not mark as completed.');
    }
  };

  /* ── Render ────────────────────────────────────────── */
  if (loading) {
    return (
      <ProtectedLayout>
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      </ProtectedLayout>
    );
  }

  if (!utility) {
    return (
      <ProtectedLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-lg font-medium text-gray-500">Utility not found.</p>
          <button onClick={() => router.push('/utilities')}
            className="mt-4 text-blue-600 hover:underline text-sm">← Back to Utilities</button>
        </div>
      </ProtectedLayout>
    );
  }

  const sorted = [...(utility.serviceSchedule ?? [])].sort(
    (a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate)
  );

  return (
    <ProtectedLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* ── Back link ── */}
        <button onClick={() => router.push('/utilities')}
          className="text-sm text-blue-600 hover:underline">← Back to Utilities</button>

        {/* ── Error banner ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError('')} className="ml-3 underline text-xs">Dismiss</button>
          </div>
        )}

        {/* ── Header card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-4xl">{CATEGORY_ICONS[utility.category] ?? '📦'}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900">{utility.name}</h1>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${UTILITY_STATUS_BADGE[utility.status]}`}>
                    {utility.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {[utility.category, utility.brand, utility.modelNumber].filter(Boolean).join(' · ')}
                </p>
                {utility.location && <p className="text-xs text-gray-400 mt-1">📍 {utility.location}</p>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setShowEditUtil(true)}
                className="text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg font-medium">
                ✏️ Edit
              </button>
              <button onClick={handleDeleteUtility}
                className="text-sm border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium">
                🗑 Delete
              </button>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
            {utility.purchaseDate && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Purchase Date</p>
                <p className="text-sm font-medium text-gray-700">{format(new Date(utility.purchaseDate), 'MMM d, yyyy')}</p>
              </div>
            )}
            {utility.warrantyExpiryDate && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Warranty Expiry</p>
                <p className="text-sm font-medium text-gray-700">{format(new Date(utility.warrantyExpiryDate), 'MMM d, yyyy')}</p>
              </div>
            )}
            {utility.notes && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Notes</p>
                <p className="text-sm text-gray-600">{utility.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Service Schedule ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">🔧 Service Schedule</h2>
            <button onClick={openAddService}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg">
              + Add Service
            </button>
          </div>

          {sorted.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8 italic">No service entries yet.</p>
          ) : (
            <>
              {/* ── Desktop table (md+) ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-100">
                      <th className="text-left pb-2 pr-3">Date</th>
                      <th className="text-left pb-2 pr-3">Type</th>
                      <th className="text-left pb-2 pr-3">Status</th>
                      <th className="text-left pb-2 pr-3">Cost</th>
                      <th className="text-left pb-2 pr-3">Technician</th>
                      <th className="text-right pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(s => (
                      <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 pr-3 whitespace-nowrap">
                          {format(new Date(s.scheduledDate), 'MMM d, yyyy')}
                          {s.completedDate && (
                            <div className="text-xs text-gray-400">Done: {format(new Date(s.completedDate), 'MMM d, yyyy')}</div>
                          )}
                        </td>
                        <td className="py-2 pr-3 font-medium text-gray-800">{s.serviceType}</td>
                        <td className="py-2 pr-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[s.status]}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-gray-600">
                          {s.cost ? `₹${Number(s.cost).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-2 pr-3 text-gray-600">{s.technician || '—'}</td>
                        <td className="py-2 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            {s.status === 'Upcoming' && (
                              <button onClick={() => handleCompleteService(s)}
                                className="text-xs font-semibold text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50 transition-colors">
                                ✔ Done
                              </button>
                            )}
                            <button onClick={() => openEditService(s)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteService(s._id)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile cards (below md) ── */}
              <div className="md:hidden space-y-3">
                {sorted.map(s => (
                  <div key={s._id} className="border border-gray-100 rounded-xl p-4 bg-gray-50 hover:bg-white transition-colors">
                    {/* Row 1: Type + Status badge */}
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{s.serviceType}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE[s.status]}`}>
                        {s.status}
                      </span>
                    </div>

                    {/* Row 2: Dates */}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 mb-2">
                      <span>📅 {format(new Date(s.scheduledDate), 'MMM d, yyyy')}</span>
                      {s.completedDate && (
                        <span>✅ Done: {format(new Date(s.completedDate), 'MMM d, yyyy')}</span>
                      )}
                    </div>

                    {/* Row 3: Cost + Technician */}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 mb-3">
                      {s.cost && <span>💰 ₹{Number(s.cost).toLocaleString('en-IN')}</span>}
                      {s.technician && <span>👤 {s.technician}</span>}
                      {s.notes && <span className="text-gray-400 italic truncate">"{s.notes}"</span>}
                    </div>

                    {/* Row 4: Action buttons — always visible */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      {s.status === 'Upcoming' && (
                        <button
                          onClick={() => handleCompleteService(s)}
                          className="flex-1 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-lg transition-colors"
                        >
                          ✔ Mark Done
                        </button>
                      )}
                      <button
                        onClick={() => openEditService(s)}
                        className="flex-1 text-xs font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteService(s._id)}
                        className="flex-1 text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Documents ── */}
        <DocumentUpload
          utilityId={utility._id}
          documents={utility.documents}
          onUpdated={(updated) => setUtility(updated)}
        />

      </div>

      {/* ── Edit Utility Modal ── */}
      {showEditUtil && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Utility</h2>
            <UtilityForm
              initial={utility}
              onSubmit={handleUpdateUtility}
              onCancel={() => setShowEditUtil(false)}
              loading={savingUtil}
            />
          </div>
        </div>
      )}

      {/* ── Service Form Modal ── */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingService ? 'Edit Service Entry' : 'Add Service Entry'}
            </h2>
            <ServiceForm
              initial={editingService}
              onSubmit={handleSaveService}
              onCancel={() => setShowServiceForm(false)}
              loading={savingService}
            />
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
