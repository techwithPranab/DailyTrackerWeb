'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { openCheckout } from '@/lib/razorpay';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

// ── Static UI decoration (never changes based on plan config) ────────────────
const PLAN_UI = {
  pro: {
    key:          'pro',
    icon:         '⭐',
    color:        'border-blue-500 ring-blue-500',
    badge:        'Most Popular',
    badgeColor:   'bg-blue-600 text-white',
  },
};

// ── Format paise → "₹X" display string ───────────────────────────────────────
const fmtPaise = (paise) => {
  if (!paise || paise === 0) return '₹0';
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
};

// ── Build feature bullet list from an AppSettings plan object ────────────────
const buildFeatures = (p) => {
  if (!p) return [];
  const list = [];
  if (p.maxActivities === -1) list.push('Unlimited activities');
  else if (p.maxActivities > 0) list.push(`Up to ${p.maxActivities} activities`);
  if (p.maxReminders === -1)    list.push('Unlimited reminders');
  else if (p.maxReminders === 1) list.push('1 reminder per activity');
  if (p.recurringActivities)    list.push('Recurring activities');
  if (p.maxMilestones !== 0)    list.push('Milestone tracking');
  if (p.maxUtilities > 0)       list.push(`Up to ${p.maxUtilities === -1 ? 'unlimited' : p.maxUtilities} home utilities`);
  if (p.analytics)              list.push('Advanced analytics');
  if (p.dataExport)             list.push('Data export (CSV)');
  if (p.prioritySupport)        list.push('Priority email support');
  return list;
};

export default function PlanModal({ currentPlan, onClose, onSuccess }) {
  const { refreshUser } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading]           = useState(null); // plan key being processed
  const [planData, setPlanData]         = useState(null); // from AppSettings API
  const [planLoading, setPlanLoading]   = useState(true);

  // Fetch live plan data from AppSettings on mount
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${base}/settings/plans`)
      .then(r => r.json())
      .then(json => { if (json.success && json.data) setPlanData(json.data); })
      .catch(() => {/* use null — UI will show fallback */})
      .finally(() => setPlanLoading(false));
  }, []);

  // ── Resolve pricing for the Pro plan ─────────────────────────────────────
  const proPlan      = planData?.pro;
  // AppSettings stores prices in ₹; convert to paise for Razorpay
  const monthlyPaise = Math.round((proPlan?.price       ?? 199)  * 100);
  const yearlyPaise  = Math.round((proPlan?.yearlyPrice  ?? 1990) * 100);
  const yearlyDiscount = proPlan?.yearlyDiscountPercent ?? 0;
  const hasYearly    = yearlyPaise > 0 && yearlyPaise !== monthlyPaise * 12;

  // Build the single plan card data from live API response
  const plans = [
    {
      ...PLAN_UI.pro,
      name:        proPlan?.name  ?? 'Pro',
      monthly:     fmtPaise(monthlyPaise),
      yearly:      fmtPaise(yearlyPaise),
      monthlyPaise,
      yearlyPaise,
      features:    buildFeatures(proPlan) || [
        'Unlimited activities', 'Unlimited reminders',
        'Recurring activities', 'Milestone tracking',
        'Home Utility Tracker', 'Advanced analytics', 'Priority support',
      ],
    },
  ];

  const handleSelectPlan = async (plan) => {
    if (plan.key === currentPlan) {
      toast('You are already on this plan.');
      return;
    }
    setLoading(plan.key);
    try {
      // 1. Create Razorpay order
      const { data } = await api.post('/subscriptions/create-order', {
        plan: plan.key,
        billingCycle
      });
      const order = data.data;

      // 2. Open Razorpay checkout
      await openCheckout({
        key:         order.keyId,
        amount:      order.amount,
        currency:    'INR',
        order_id:    order.orderId,
        name:        'TrakIO',
        description: `${plan.name} Plan — ${billingCycle}`,
        image:       '/logo.png',
        prefill:     order.prefill,
        theme:       { color: '#2563eb' },
        handler: async (response) => {
          try {
            // 3. Verify payment on backend
            const verifyRes = await api.post('/subscriptions/verify', {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              subscriptionDbId:  order.subscriptionDbId
            });
            // refresh user context so UI reflects new plan
            await refreshUser();
            toast.success(verifyRes.data.message || 'Plan activated!');
            onSuccess?.();
            onClose();
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => { setLoading(null); }
        }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Upgrade Your Plan</h2>
            <p className="text-sm text-gray-500 mt-0.5">Unlock the full power of TrakIO</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center pt-5 pb-2">
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1 text-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full font-medium transition-colors ${billingCycle === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-full font-medium transition-colors ${billingCycle === 'yearly' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              Yearly
              {hasYearly && yearlyDiscount > 0 && (
                <span className="text-green-600 text-xs font-semibold ml-1">Save {yearlyDiscount}%</span>
              )}
            </button>
          </div>
        </div>

        {/* Plan cards — skeleton while loading */}
        {planLoading ? (
          <div className="p-6">
            <div className="border-2 border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-16 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-24 mb-6" />
              {[1,2,3,4].map(i => <div key={i} className="h-3 bg-gray-100 rounded w-full mb-2" />)}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-6">
            {plans.map(plan => (
              <div key={plan.key}
                className={`relative border-2 rounded-xl p-6 ${currentPlan === plan.key ? 'border-green-400' : plan.color}`}>
                {plan.badge && currentPlan !== plan.key && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>
                )}
                {currentPlan === plan.key && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-green-500 text-white">
                    Current Plan
                  </span>
                )}
                <div className="text-2xl mb-2">{plan.icon}</div>
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">
                  {billingCycle === 'monthly' ? plan.monthly : (hasYearly ? plan.yearly : plan.monthly)}
                  <span className="text-sm font-normal text-gray-500">
                    /{billingCycle === 'monthly' || !hasYearly ? 'mo' : 'yr'}
                  </span>
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={!!loading || currentPlan === plan.key}
                  className={`mt-5 w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    currentPlan === plan.key
                      ? 'bg-gray-100 text-gray-400 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60'
                  }`}>
                  {loading === plan.key ? 'Processing…' : currentPlan === plan.key ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-center text-gray-400 pb-5">
          Payments powered by Razorpay · Secured by 256-bit SSL
        </p>
      </div>
    </div>
  );
}
