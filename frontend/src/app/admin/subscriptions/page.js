'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function AdminSubscriptionsPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (planFilter) params.set('plan', planFilter);

      const [statsRes, usersRes] = await Promise.all([
        adminApi.get('/admin/stats'),
        adminApi.get(`/admin/users?${params}`)
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setPagination(usersRes.data.pagination);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [planFilter, page]);

  const handlePlanChange = async (userId, plan) => {
    try {
      await adminApi.put(`/admin/users/${userId}`, { subscription: { plan } });
      toast.success('Plan updated');
      setUsers(prev => prev.map(u =>
        u._id === userId ? { ...u, subscription: { ...u.subscription, plan } } : u
      ));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update plan');
    }
  };

  const PLAN_COLORS = {
    free: { bg: 'bg-gray-800', text: 'text-gray-300', border: 'border-gray-700' },
    pro: { bg: 'bg-indigo-900/40', text: 'text-indigo-300', border: 'border-indigo-700' },
    enterprise: { bg: 'bg-purple-900/40', text: 'text-purple-300', border: 'border-purple-700' },
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Subscriptions</h2>
          <p className="text-gray-500 text-sm mt-1">Manage user subscription plans</p>
        </div>

        {/* Plan summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: 'free', icon: '🆓', label: 'Free Plan', desc: 'Basic features, 20 activities' },
            { key: 'pro', icon: '⭐', label: 'Pro Plan', desc: '500 activities, full features' },
            { key: 'enterprise', icon: '🏢', label: 'Enterprise', desc: 'Unlimited everything' },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => { setPlanFilter(planFilter === p.key ? '' : p.key); setPage(1); }}
              className={`text-left p-5 rounded-xl border transition-all ${
                planFilter === p.key
                  ? `${PLAN_COLORS[p.key].bg} ${PLAN_COLORS[p.key].border} ring-2 ring-offset-1 ring-offset-gray-950 ring-current`
                  : 'bg-gray-900 border-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="text-2xl mb-2">{p.icon}</div>
              <p className={`font-bold text-sm ${PLAN_COLORS[p.key].text}`}>{p.label}</p>
              <p className="text-gray-500 text-xs mt-1">{p.desc}</p>
              <p className="text-3xl font-extrabold text-white mt-3">
                {stats?.subscriptions?.[p.key] ?? '—'}
              </p>
              <p className="text-gray-600 text-xs">users</p>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-400 text-sm">Showing:</span>
          {['', 'free', 'pro', 'enterprise'].map(f => (
            <button
              key={f}
              onClick={() => { setPlanFilter(f); setPage(1); }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                planFilter === f
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              {f === '' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <span className="ml-auto text-gray-500 text-sm">{pagination.total} users</span>
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-gray-600">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['User', 'Joined', 'Current Plan', 'Sub Status', 'Change Plan'].map(h => (
                      <th key={h} className="text-left text-gray-500 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{u.name}</p>
                            <p className="text-gray-500 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${PLAN_COLORS[u.subscription?.plan || 'free'].bg} ${PLAN_COLORS[u.subscription?.plan || 'free'].text} ${PLAN_COLORS[u.subscription?.plan || 'free'].border}`}>
                          {u.subscription?.plan || 'free'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs capitalize">
                        {u.subscription?.status || 'active'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.subscription?.plan || 'free'}
                          onChange={e => handlePlanChange(u._id, e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </td>
                    </tr>
                  ))}
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
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded disabled:opacity-30"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
