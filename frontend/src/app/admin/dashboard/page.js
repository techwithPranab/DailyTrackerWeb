'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/Admin/AdminLayout';
import adminApi from '@/lib/adminApi';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{sub}</span>
      </div>
      <p className="text-3xl font-extrabold text-gray-900">{value ?? '—'}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats,   setStats]   = useState(null);
  const [feed,    setFeed]    = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.get('/admin/stats'),
      adminApi.get('/admin/activity-feed'),
      adminApi.get('/admin/revenue'),
    ]).then(([s, f, r]) => {
      setStats(s.data.data);
      setFeed(f.data.data);
      setRevenue(r.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">
            Overview of TrakIO — {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon="👥" label="Total Users" value={stats?.users?.total} sub={`+${stats?.users?.newThisMonth} this month`} color="bg-blue-900/50 text-blue-300" />
          <StatCard icon="✅" label="Active Users" value={stats?.users?.active} sub="active accounts" color="bg-green-900/50 text-green-300" />
          <StatCard icon="💳" label="Pro Subscribers" value={stats?.subscriptions?.pro} sub="Active paid users" color="bg-indigo-900/50 text-indigo-300" />
          <StatCard icon="📝" label="Total Activities" value={stats?.content?.activities} sub={`${stats?.content?.milestones} milestones`} color="bg-purple-900/50 text-purple-300" />
        </div>

        {/* Revenue KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <span className="text-3xl">💰</span>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Monthly Recurring Revenue</p>
              <p className="text-2xl font-extrabold text-green-600">
                {revenue?.mrr != null ? `₹${(revenue.mrr / 100).toLocaleString('en-IN')}` : '—'}
              </p>
            </div>
            <Link href="/admin/revenue" className="ml-auto text-xs text-blue-500 hover:underline whitespace-nowrap">
              View details →
            </Link>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <span className="text-3xl">📊</span>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Total Revenue</p>
              <p className="text-2xl font-extrabold text-blue-600">
                {revenue?.totalRevenue != null ? `₹${(revenue.totalRevenue / 100).toLocaleString('en-IN')}` : '—'}
              </p>
            </div>
            <Link href="/admin/transactions" className="ml-auto text-xs text-blue-500 hover:underline whitespace-nowrap">
              All transactions →
            </Link>
          </div>
        </div>

        {/* Subscription breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-gray-900 font-bold mb-4">Subscription Breakdown</h3>
          {stats && (
            <div className="space-y-3">
              {[
                { label: 'Free', count: stats.subscriptions.free, total: stats.users.total, color: 'bg-gray-600' },
                { label: 'Pro', count: stats.subscriptions.pro, total: stats.users.total, color: 'bg-indigo-500' },
              ].map(row => {
                const pct = stats.users.total ? Math.round((row.count / stats.users.total) * 100) : 0;
                return (
                  <div key={row.label}>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>{row.label}</span>
                      <span>{row.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${row.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Users + Recent Activity side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-bold">Recent Signups</h3>
              <Link href="/admin/users" className="text-indigo-400 text-xs hover:underline">View all →</Link>
            </div>
            <div className="space-y-3">
              {feed?.recentUsers?.length === 0 && (
                <p className="text-gray-600 text-sm">No users yet.</p>
              )}
              {feed?.recentUsers?.map(u => (
                <div key={u._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-900 text-sm font-medium truncate">{u.name}</p>
                    <p className="text-gray-500 text-xs truncate">{u.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    u.subscription?.plan === 'pro' ? 'bg-indigo-900/60 text-indigo-300' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {u.subscription?.plan || 'free'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-bold">Recent Activities Created</h3>
            </div>
            <div className="space-y-3">
              {feed?.recentActivities?.length === 0 && (
                <p className="text-gray-600 text-sm">No activities yet.</p>
              )}
              {feed?.recentActivities?.map(a => (
                <div key={a._id} className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">📝</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-900 text-sm font-medium truncate">{a.title}</p>
                    <p className="text-gray-500 text-xs">
                      by {a.user?.name || 'Unknown'} · {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { href: '/admin/users',         icon: '👥', label: 'Manage Users',  desc: 'View, edit, suspend users' },
            { href: '/admin/subscriptions', icon: '💳', label: 'Subscriptions', desc: 'Plan breakdown & changes' },
            { href: '/admin/transactions',  icon: '🧾', label: 'Transactions',  desc: 'All payment records' },
            { href: '/admin/revenue',       icon: '📈', label: 'Revenue',       desc: 'MRR & monthly trends' },
            { href: '/admin/settings',      icon: '⚙️', label: 'App Settings',  desc: 'Branding, plans, contact' },
          ].map(q => (
            <Link
              key={q.href}
              href={q.href}
              className="bg-white border border-gray-200 hover:border-indigo-700 rounded-xl p-5 group transition-colors"
            >
              <div className="text-2xl mb-2">{q.icon}</div>
              <p className="text-white font-semibold text-sm group-hover:text-indigo-300 transition-colors">{q.label}</p>
              <p className="text-gray-500 text-xs mt-1">{q.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
