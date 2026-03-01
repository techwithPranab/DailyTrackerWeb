'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import ProtectedLayout from '@/components/Layout/ProtectedLayout';
import PlanModal from '@/components/Subscription/PlanModal';
import SubscriptionBadge from '@/components/Subscription/SubscriptionBadge';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const PLAN_DETAILS = {
  free:       { icon: '🆓', label: 'Free',       price: '₹0/mo',   color: 'border-gray-200' },
  pro:        { icon: '⭐', label: 'Pro',        price: '₹199/mo',  color: 'border-blue-300' },
};

export default function SubscriptionPage() {
  const { user, setUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [invoices,     setInvoices]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [cancelling,   setCancelling]   = useState(false);

  const currentPlan = user?.subscription?.plan ?? 'free';
  const planInfo    = PLAN_DETAILS[currentPlan] ?? PLAN_DETAILS.free;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, invRes] = await Promise.all([
        api.get('/subscriptions/me'),
        api.get('/subscriptions/invoices')
      ]);
      setSubscription(subRes.data.data?.subscription ?? null);
      setInvoices(invRes.data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription? You will keep access until the end of your billing period.')) return;
    setCancelling(true);
    try {
      const { data } = await api.post('/subscriptions/cancel');
      toast.success(data.message);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your plan and billing</p>
        </div>

        {/* Current Plan Card */}
        <div className={`bg-white rounded-2xl border-2 ${planInfo.color} shadow-sm p-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{planInfo.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{planInfo.label} Plan</h2>
                  <SubscriptionBadge plan={currentPlan} />
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{planInfo.price}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {currentPlan === 'free' ? (
                <button onClick={() => setShowModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                  Upgrade Plan
                </button>
              ) : (
                <>
                  <button onClick={() => setShowModal(true)}
                    className="border border-blue-300 text-blue-600 hover:bg-blue-50 text-sm font-semibold px-4 py-2 rounded-lg">
                    Change Plan
                  </button>
                  {subscription?.status === 'active' && (
                    <button onClick={handleCancel} disabled={cancelling}
                      className="border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
                      {cancelling ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Billing details */}
          {subscription && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <p className={`text-sm font-semibold capitalize mt-0.5 ${subscription.status === 'active' ? 'text-green-600' : subscription.status === 'cancelled' ? 'text-red-500' : 'text-gray-600'}`}>
                  {subscription.status}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Billing Cycle</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5 capitalize">{subscription.billingCycle}</p>
              </div>
              {subscription.endDate && (
                <div>
                  <p className="text-xs text-gray-400">{subscription.status === 'cancelled' ? 'Access Until' : 'Next Billing'}</p>
                  <p className="text-sm font-semibold text-gray-700 mt-0.5">
                    {format(new Date(subscription.endDate), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          )}

          {subscription?.status === 'cancelled' && (
            <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-lg">
              ⚠️ Your subscription is cancelled. You will be downgraded to Free after {subscription.endDate ? format(new Date(subscription.endDate), 'MMM d, yyyy') : 'the end of your billing period'}.
            </div>
          )}
        </div>

        {/* What's included */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">What&apos;s included in your plan</h3>
          {currentPlan === 'free' && (
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li className="flex gap-2"><span className="text-green-500">✓</span> Up to 10 activities</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span> Basic calendar view</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span> 1 reminder per activity</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> <span className="text-gray-400">Recurring activities — <button onClick={() => setShowModal(true)} className="text-blue-500 underline">Upgrade</button></span></li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> <span className="text-gray-400">Milestone tracking — <button onClick={() => setShowModal(true)} className="text-blue-500 underline">Upgrade</button></span></li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> <span className="text-gray-400">Home Utility Tracker — <button onClick={() => setShowModal(true)} className="text-blue-500 underline">Upgrade</button></span></li>
            </ul>
          )}
          {currentPlan === 'pro' && (
            <ul className="space-y-1.5 text-sm text-gray-600">
              {['Unlimited activities', 'Unlimited reminders', 'Recurring activities (daily, weekly, monthly)', 'Milestone tracking', 'Home Utility Tracker', 'Advanced analytics', 'Priority support'].map(f => (
                <li key={f} className="flex gap-2"><span className="text-green-500">✓</span> {f}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Invoice history */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Payment History</h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : invoices.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
              No payment history yet.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-500">
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Plan</th>
                    <th className="text-left px-4 py-3">Cycle</th>
                    <th className="text-right px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Payment ID</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{format(new Date(inv.paidAt), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3 capitalize font-medium text-gray-800">{inv.plan}</td>
                      <td className="px-4 py-3 capitalize text-gray-500">{inv.billingCycle}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        ₹{(inv.amount / 100).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{inv.razorpayPaymentId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Plan upgrade modal */}
      {showModal && (
        <PlanModal
          currentPlan={currentPlan}
          onClose={() => setShowModal(false)}
          onSuccess={() => { fetchData(); }}
        />
      )}
    </ProtectedLayout>
  );
}
