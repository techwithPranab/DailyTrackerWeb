'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import adminApi from '@/lib/adminApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PLAN_COLORS = {
  free:       { bg: 'bg-gray-100',       text: 'text-gray-600',    border: 'border-gray-300' },
  pro:        { bg: 'bg-blue-100',        text: 'text-blue-700',    border: 'border-blue-300' },
};

const STATUS_COLORS = {
  active:    'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  expired:   'bg-orange-100 text-orange-600',
  created:   'bg-yellow-100 text-yellow-700',
  failed:    'bg-gray-100 text-gray-500',
};

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [revenue,       setRevenue]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [planFilter,    setPlanFilter]    = useState('');
  const [statusFilter,  setStatusFilter]  = useState('');
  const [search,        setSearch]        = useState('');
  const [searchInput,   setSearchInput]   = useState('');
  const [page,          setPage]          = useState(1);
  const [pagination,    setPagination]    = useState({ pages: 1, total: 0 });
  const [editingId,     setEditingId]     = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (planFilter)   params.set('plan',   planFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (search)       params.set('search', search);

      const [subRes, revRes] = await Promise.all([
        adminApi.get(`/admin/subscriptions?${params}`),
        adminApi.get('/admin/revenue'),
      ]);
      setSubscriptions(subRes.data.data ?? []);
      setPagination(subRes.data.pagination ?? { pages: 1, total: 0 });
      setRevenue(revRes.data.data);
    } catch {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [page, planFilter, statusFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handlePlanUpdate = async (subId, newPlan) => {
    try {
      await adminApi.put(`/admin/subscriptions/${subId}`, { plan: newPlan });
      toast.success('Plan updated');
      setEditingId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update plan');
    }
  };

  const planCounts = revenue ?? {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Subscriptions</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and track user subscriptions</p>
        </div>

        {/* Revenue summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-gray-400 mb-1">MRR</p>
            <p className="text-2xl font-extrabold text-green-600">
              {revenue?.mrr != null ? `₹${(revenue.mrr / 100).toLocaleString('en-IN')}` : '—'}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-gray-400 mb-1">Total Revenue</p>
            <p className="text-2xl font-extrabold text-blue-600">
              {revenue?.totalRevenue != null ? `₹${(revenue.totalRevenue / 100).toLocaleString('en-IN')}` : '—'}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-gray-400 mb-1">Pro Subscribers</p>
            <p className="text-2xl font-extrabold text-indigo-600">{planCounts.proCount ?? '—'}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Plan filter */}
          <div className="flex gap-1.5">
            {['', 'free', 'pro'].map(f => (
              <button key={f}
                onClick={() => { setPlanFilter(f); setPage(1); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  planFilter === f ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                }`}
              >
                {f === '' ? 'All Plans' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {/* Status filter */}
          <div className="flex gap-1.5">
            {['', 'active', 'cancelled', 'expired'].map(s => (
              <button key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  statusFilter === s ? 'bg-gray-800 border-gray-800 text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                }`}
              >
                {s === '' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-1.5 ml-auto">
            <input
              type="text" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search user…"
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-48 text-gray-700"
            />
            <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              Search
            </button>
            {search && (
              <button type="button"
                onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
                className="px-2 py-1.5 border border-gray-200 text-gray-500 text-sm rounded-lg hover:bg-gray-50">
                ✕
              </button>
            )}
          </form>
          <span className="text-gray-400 text-sm">{pagination.total} records</span>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No subscriptions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['User', 'Plan', 'Status', 'Billing', 'Amount', 'End Date', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs text-gray-500 font-semibold px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {subscriptions.map(sub => {
                    const pc = PLAN_COLORS[sub.plan] ?? PLAN_COLORS.free;
                    const sc = STATUS_COLORS[sub.status] ?? 'bg-gray-100 text-gray-500';
                    return (
                      <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                              {(sub.userId?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-gray-800 font-medium truncate max-w-[130px]">{sub.userId?.name || '—'}</p>
                              <p className="text-gray-400 text-xs truncate max-w-[130px]">{sub.userId?.email || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {editingId === sub._id ? (
                            <select
                              defaultValue={sub.plan}
                              onChange={e => handlePlanUpdate(sub._id, e.target.value)}
                              onBlur={() => setEditingId(null)}
                              autoFocus
                              className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                              <option value="free">Free</option>
                              <option value="pro">Pro</option>
                            </select>
                          ) : (
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize border ${pc.bg} ${pc.text} ${pc.border}`}>
                              {sub.plan}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${sc}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 capitalize text-gray-500 text-xs">{sub.billingCycle || '—'}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {sub.amount ? `₹${(sub.amount / 100).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {sub.endDate ? format(new Date(sub.endDate), 'MMM d, yyyy') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setEditingId(editingId === sub._id ? null : sub._id)}
                            className="text-xs text-blue-500 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-2 py-1 rounded transition-colors"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm">Page {page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                ← Prev
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
