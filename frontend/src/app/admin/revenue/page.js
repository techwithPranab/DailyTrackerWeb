'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{sub}</span>
      </div>
      <p className="text-3xl font-extrabold text-gray-900">{value ?? '—'}</p>
    </div>
  );
}

const formatINR = (paise) => `₹${(paise / 100).toLocaleString('en-IN')}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function AdminRevenuePage() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get('/admin/revenue')
      .then(({ data }) => setStats(data.data))
      .catch(() => toast.error('Failed to load revenue data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  const chartData = (stats?.monthlyBreakdown ?? []).map(m => ({
    month: m.month,
    Revenue: m.revenue,
    MRR: m.mrr ?? m.revenue,
  }));

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Revenue</h2>
          <p className="text-gray-500 text-sm mt-0.5">Financial overview and monthly trends</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon="💰"
            label="MRR"
            value={stats?.mrr != null ? formatINR(stats.mrr) : '—'}
            sub="Monthly Recurring Revenue"
            color="bg-green-100 text-green-700"
          />
          <StatCard
            icon="📊"
            label="Total Revenue"
            value={stats?.totalRevenue != null ? formatINR(stats.totalRevenue) : '—'}
            sub="All time"
            color="bg-blue-100 text-blue-700"
          />
          <StatCard
            icon="⭐"
            label="Pro Subscribers"
            value={stats?.proCount ?? '—'}
            sub="Active paid users"
            color="bg-indigo-100 text-indigo-700"
          />
          <StatCard
            icon="🏢"
            label="Enterprise"
            value={stats?.enterpriseCount ?? '—'}
            sub="Active paid users"
            color="bg-purple-100 text-purple-700"
          />
        </div>

        {/* Active paid users callout */}
        {stats?.activePaidUsers != null && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4 flex items-center gap-4">
            <span className="text-3xl">🎯</span>
            <div>
              <p className="font-bold text-green-800 text-lg">{stats.activePaidUsers} active paid users</p>
              <p className="text-green-600 text-sm">Combined Pro + Enterprise active subscriptions</p>
            </div>
          </div>
        )}

        {/* Monthly Revenue Chart */}
        {chartData.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-5">Monthly Revenue (last 12 months)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 100).toLocaleString('en-IN')}`}
                    width={70}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="Revenue"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#revGrad)"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
            No revenue data available yet. Monthly breakdown will appear once subscriptions are activated.
          </div>
        )}

        {/* Monthly breakdown table */}
        {chartData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Monthly Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs text-gray-500 font-semibold px-5 py-3">Month</th>
                    <th className="text-right text-xs text-gray-500 font-semibold px-5 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...chartData].reverse().map(row => (
                    <tr key={row.month} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-700 font-medium">{row.month}</td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900">
                        {formatINR(row.Revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
