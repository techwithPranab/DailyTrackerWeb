'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import ProtectedLayout from '@/components/Layout/ProtectedLayout';
import UtilityForm from '@/components/HomeUtility/UtilityForm';
import PlanUsageBar from '@/components/Subscription/PlanUsageBar';
import UpgradeBanner from '@/components/Subscription/UpgradeBanner';
import PlanModal from '@/components/Subscription/PlanModal';
import Pagination from '@/components/Layout/Pagination';
import usePlanFeatures from '@/hooks/usePlanFeatures';
import api from '@/lib/axios';

const CATEGORIES = ['All', 'Appliance', 'Plumbing', 'Electrical', 'HVAC', 'Vehicle', 'Other'];
const STATUSES   = ['All', 'Active', 'Inactive', 'Disposed'];

const CATEGORY_ICONS = {
  Appliance: '🏠', Plumbing: '🔧', Electrical: '⚡',
  HVAC: '❄️', Vehicle: '🚗', Other: '📦',
};

const STATUS_COLORS = {
  Active:   'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-600',
  Disposed: 'bg-red-100 text-red-600',
};

function getNextService(serviceSchedule) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return serviceSchedule
    ?.filter(s => s.status === 'Upcoming' && new Date(s.scheduledDate) >= todayStart)
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))[0] ?? null;
}

function ServiceBadge({ service }) {
  if (!service) return <span className="text-xs text-gray-400 italic">—</span>;
  const days = differenceInDays(new Date(service.scheduledDate), new Date());
  const color = days < 0
    ? 'bg-red-100 text-red-700 border-red-200'
    : days <= 7
    ? 'bg-orange-100 text-orange-700 border-orange-200'
    : days <= 30
    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
    : 'bg-green-50 text-green-700 border-green-200';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      {days < 0 ? '🔴' : days <= 7 ? '🟠' : '🟢'}
      {days < 0 ? 'Overdue' : days === 0 ? 'Today' : `in ${days}d`}
      <span className="font-normal opacity-75">· {service.serviceType}</span>
    </span>
  );
}

export default function UtilitiesPage() {
  const [utilities, setUtilities]        = useState([]);
  const [loading, setLoading]            = useState(true);
  const [showForm, setShowForm]          = useState(false);
  const [saving, setSaving]              = useState(false);
  const [error, setError]                = useState('');
  const [category, setCategory]          = useState('All');
  const [statusFilter, setStatus]        = useState('All');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [page, setPage]                  = useState(1);
  const [totalCount, setTotalCount]      = useState(0);
  const PAGE_SIZE = 10;

  const { plan, features, isLimitReached, usagePercent } = usePlanFeatures();
  const utilityLimit = features.utilities;
  const atLimit = isLimitReached('utilities', totalCount);
  const pct     = usagePercent('utilities', totalCount);

  const fetchUtilities = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (category     !== 'All') params.category = category;
      if (statusFilter !== 'All') params.status   = statusFilter;
      const { data } = await api.get('/utilities', { params });
      const list = data.data ?? data.utilities ?? [];
      setUtilities(list);
      setPage(1);

      if (category === 'All' && statusFilter === 'All') {
        setTotalCount(list.length);
      } else {
        const { data: allData } = await api.get('/utilities');
        setTotalCount((allData.data ?? allData.utilities ?? []).length);
      }
    } catch (err) {
      setError('Failed to load utilities.');
    } finally {
      setLoading(false);
    }
  }, [category, statusFilter]);

  useEffect(() => { fetchUtilities(); }, [fetchUtilities]);

  const handleCreate = async (payload) => {
    if (atLimit) { setShowPlanModal(true); return; }
    setSaving(true);
    try {
      await api.post('/utilities', payload);
      setShowForm(false);
      fetchUtilities();
    } catch (err) {
      setError(err.planLimitMessage ?? err.response?.data?.message ?? 'Could not create utility.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleted = async (id) => {
    if (!confirm('Delete this utility and all its documents?')) return;
    try {
      await api.delete(`/utilities/${id}`);
      fetchUtilities();
    } catch {
      setError('Could not delete utility.');
    }
  };

  const paginated = utilities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
            onClick={() => { if (atLimit) { setShowPlanModal(true); return; } setShowForm(true); setError(''); }}
            disabled={atLimit}
            title={atLimit ? `Utility limit reached on ${plan} plan` : undefined}
            className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
              atLimit ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            + Add Utility
          </button>
        </div>

        {/* Plan usage */}
        {utilityLimit !== -1 && (
          <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-100 px-4 py-3">
            <PlanUsageBar label="Utilities" current={totalCount} max={utilityLimit} onUpgrade={() => setShowPlanModal(true)} />
          </div>
        )}
        {utilityLimit !== -1 && (
          <UpgradeBanner
            storageKey="utility_limit" usagePercent={pct} threshold={80}
            title="Almost at your utility limit"
            message={`You've used ${totalCount} of ${utilityLimit} utilities. Upgrade for more.`}
            onUpgrade={() => setShowPlanModal(true)} className="mb-4"
          />
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div>
            <label className="text-xs font-medium text-gray-600 mr-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-300 outline-none">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mr-1">Status</label>
            <select value={statusFilter} onChange={e => setStatus(e.target.value)}
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
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        {/* ── Table ── */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
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
          <>
            {/* Desktop table */}
            <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="text-left px-4 py-3">Utility</th>
                    <th className="text-left px-4 py-3">Category</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Location</th>
                    <th className="text-left px-4 py-3">Next Service</th>
                    <th className="text-left px-4 py-3">Warranty</th>
                    <th className="text-left px-4 py-3">Docs</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map(u => {
                    const nextService = getNextService(u.serviceSchedule);
                    const docCount    = u.documents?.length ?? 0;
                    const warrantyDays = u.warrantyExpiryDate
                      ? differenceInDays(new Date(u.warrantyExpiryDate), new Date())
                      : null;
                    const warrantyExpiring = warrantyDays !== null && warrantyDays <= 30;

                    return (
                      <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                        {/* Name + brand */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{CATEGORY_ICONS[u.category] ?? '📦'}</span>
                            <div>
                              <p className="font-semibold text-gray-900 leading-tight">{u.name}</p>
                              {(u.brand || u.modelNumber) && (
                                <p className="text-xs text-gray-400">{[u.brand, u.modelNumber].filter(Boolean).join(' · ')}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 text-gray-600">{u.category}</td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[u.status]}`}>
                            {u.status}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {u.location || <span className="italic text-gray-300">—</span>}
                        </td>

                        {/* Next Service */}
                        <td className="px-4 py-3">
                          <ServiceBadge service={nextService} />
                        </td>

                        {/* Warranty */}
                        <td className="px-4 py-3">
                          {u.warrantyExpiryDate ? (
                            <span className={`text-xs ${warrantyExpiring ? 'text-amber-600 font-semibold' : 'text-gray-500'}`}>
                              {warrantyExpiring && '⚠️ '}
                              {format(new Date(u.warrantyExpiryDate), 'MMM d, yyyy')}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300 italic">—</span>
                          )}
                        </td>

                        {/* Docs */}
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {docCount > 0 ? `📎 ${docCount}` : <span className="text-gray-300">—</span>}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/utilities/${u._id}`}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap"
                            >
                              View →
                            </Link>
                            <button
                              onClick={() => handleDeleted(u._id)}
                              className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card list (shown below sm breakpoint) */}
            <div className="sm:hidden space-y-3">
              {paginated.map(u => {
                const nextService = getNextService(u.serviceSchedule);
                const warrantyDays = u.warrantyExpiryDate
                  ? differenceInDays(new Date(u.warrantyExpiryDate), new Date())
                  : null;
                const warrantyExpiring = warrantyDays !== null && warrantyDays <= 30;

                return (
                  <div key={u._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{CATEGORY_ICONS[u.category] ?? '📦'}</span>
                        <div>
                          <p className="font-semibold text-gray-900">{u.name}</p>
                          {(u.brand || u.modelNumber) && (
                            <p className="text-xs text-gray-400">{[u.brand, u.modelNumber].filter(Boolean).join(' · ')}</p>
                          )}
                        </div>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[u.status]}`}>
                        {u.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1 mb-3">
                      {u.location && <p>📍 {u.location}</p>}
                      {warrantyExpiring && (
                        <p className="text-amber-600 font-medium">
                          ⚠️ Warranty expires {format(new Date(u.warrantyExpiryDate), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>

                    <div className="mb-3">
                      <ServiceBadge service={nextService} />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-400">
                        {(u.documents?.length ?? 0) > 0 && `📎 ${u.documents.length} doc${u.documents.length > 1 ? 's' : ''}`}
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleDeleted(u._id)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >🗑️ Delete</button>
                        <Link href={`/utilities/${u._id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                          View →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(utilities.length / PAGE_SIZE)}
              totalItems={utilities.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Add Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Utility</h2>
            <UtilityForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={saving} />
          </div>
        </div>
      )}

      {/* Plan upgrade modal */}
      {showPlanModal && (
        <PlanModal currentPlan={plan} onClose={() => setShowPlanModal(false)} onSuccess={() => setShowPlanModal(false)} />
      )}
    </ProtectedLayout>
  );
}
