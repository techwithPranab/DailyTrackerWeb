'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { openCheckout } from '@/lib/razorpay';
import toast from 'react-hot-toast';

const PLANS = [
  {
    key: 'pro',
    name: 'Pro',
    icon: '⭐',
    monthly: '₹199',
    yearly: '₹1,999',
    monthlyPaise: 19900,
    yearlyPaise: 199900,
    color: 'border-blue-500 ring-blue-500',
    badge: 'Most Popular',
    badgeColor: 'bg-blue-600 text-white',
    features: [
      'Unlimited activities',
      'Unlimited reminders',
      'Recurring activities',
      'Milestone tracking',
      'Home Utility Tracker',
      'Advanced analytics',
      'Priority support'
    ]
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    icon: '🏢',
    monthly: '₹999',
    yearly: '₹9,999',
    monthlyPaise: 99900,
    yearlyPaise: 999900,
    color: 'border-purple-500 ring-purple-500',
    badge: null,
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Admin panel access',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee'
    ]
  }
];

export default function PlanModal({ currentPlan, onClose, onSuccess }) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(null); // plan key being processed

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
              Yearly <span className="text-green-600 text-xs font-semibold ml-1">Save 16%</span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-6">
          {PLANS.map(plan => (
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
                {billingCycle === 'monthly' ? plan.monthly : plan.yearly}
                <span className="text-sm font-normal text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
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

        <p className="text-xs text-center text-gray-400 pb-5">
          Payments powered by Razorpay · Secured by 256-bit SSL
        </p>
      </div>
    </div>
  );
}
