'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Layout/Footer';
import Logo from '@/components/Logo';
import PlanModal from '@/components/Subscription/PlanModal';
import SubscriptionBadge from '@/components/Subscription/SubscriptionBadge';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

// ── Static fallback (used while fetching / on error) ─────────────────────────
const FALLBACK_PLANS = {
  free: {
    name: 'Free', price: 0,
    maxActivities: 10, maxMilestones: 0, maxReminders: 1, maxUtilities: 2,
    recurringActivities: false, subActivities: false, documentUpload: false,
    analytics: false, dataExport: false, prioritySupport: false,
  },
  pro: {
    name: 'Pro', price: 199,
    maxActivities: -1, maxMilestones: -1, maxReminders: -1, maxUtilities: 20,
    recurringActivities: true, subActivities: true, documentUpload: true,
    analytics: true, dataExport: true, prioritySupport: true,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  n === -1 ? 'Unlimited' : n === 0 ? '—' : String(n);

/** Build included/missing bullet lists from a DB plan object */
const buildBullets = (plan) => {
  const features = [];
  const missing  = [];

  if (plan.maxActivities === -1) features.push('Unlimited activities');
  else if (plan.maxActivities > 0) features.push(`Up to ${plan.maxActivities} activities`);

  features.push('Calendar view');

  if (plan.maxReminders === -1) features.push('Unlimited reminders');
  else if (plan.maxReminders === 1) features.push('1 reminder per activity');
  else if (plan.maxReminders > 1) features.push(`${plan.maxReminders} reminders per activity`);

  if (plan.maxUtilities === -1) features.push('Unlimited home utilities');
  else if (plan.maxUtilities > 0) features.push(`Up to ${plan.maxUtilities} home utilities`);

  if (plan.maxMilestones !== 0) features.push('Milestone tracking');
  else missing.push('Milestone tracking');

  const flags = [
    ['recurringActivities', 'Recurring activities (daily/weekly/monthly)'],
    ['subActivities',       'Sub-activities'],
    ['documentUpload',      'Document & photo upload'],
    ['analytics',           'Analytics & charts'],
    ['dataExport',          'Data export (CSV)'],
    ['prioritySupport',     'Priority email support'],
  ];
  for (const [key, label] of flags) {
    if (plan[key]) features.push(label);
    else missing.push(label);
  }

  return { features, missing };
};

/** Build comparison table rows from two plan objects */
const buildTableRows = (free, pro) => [
  ['Activities',            fmt(free.maxActivities),   fmt(pro.maxActivities)],
  ['Calendar view',         '✓',                       '✓'],
  ['Reminders',             free.maxReminders === -1 ? 'Unlimited' : `${free.maxReminders} / activity`, 'Unlimited'],
  ['Home utilities',        fmt(free.maxUtilities),    fmt(pro.maxUtilities)],
  ['Milestone tracking',    free.maxMilestones !== 0 ? '✓' : '✕', pro.maxMilestones !== 0 ? '✓' : '✕'],
  ['Recurring activities',  free.recurringActivities ? '✓' : '✕', pro.recurringActivities ? '✓' : '✕'],
  ['Sub-activities',        free.subActivities ? '✓' : '✕',       pro.subActivities ? '✓' : '✕'],
  ['Document upload',       free.documentUpload ? '✓' : '✕',      pro.documentUpload ? '✓' : '✕'],
  ['Analytics & charts',    free.analytics ? '✓' : '✕',           pro.analytics ? '✓' : '✕'],
  ['Data export',           free.dataExport ? 'CSV' : '✕',        pro.dataExport ? 'CSV' : '✕'],
  ['Priority support',      free.prioritySupport ? 'Email' : '✕', pro.prioritySupport ? 'Email' : '✕'],
];

// ── FAQs (static) ─────────────────────────────────────────────────────────────
const FAQ = [
  {
    q: 'Can I cancel anytime?',
    a: "Yes — cancel from your account settings at any time. You'll keep access until the end of your billing period.",
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'Every new Pro sign-up gets a 14-day free trial — no credit card required.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'All major credit/debit cards, UPI, and net banking via our secure payment gateway.',
  },
  {
    q: 'Can I upgrade or downgrade my plan?',
    a: 'Yes. Upgrades take effect immediately; downgrades apply at the next billing cycle.',
  },
];

// ── Table cell renderer ───────────────────────────────────────────────────────
function Cell({ v }) {
  if (v === '✓') return <span className="text-green-600 font-semibold">✓</span>;
  if (v === '✕') return <span className="text-red-300">✕</span>;
  return <span>{v}</span>;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function PlanSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 p-8 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-24 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-48 mb-6" />
      <div className="h-10 bg-gray-200 rounded w-32 mb-8" />
      <div className="h-10 bg-gray-200 rounded-xl mb-8" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-3 bg-gray-100 rounded w-full mb-3" />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const { user } = useAuth();
  const router   = useRouter();

  const [planData, setPlanData]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const currentPlan = user?.subscription?.plan ?? 'free';

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${base}/settings/plans`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) setPlanData(json.data);
        else setPlanData(FALLBACK_PLANS);
      })
      .catch(() => setPlanData(FALLBACK_PLANS));
  }, []);

  const handleCta = (planKey) => {
    if (!user) { router.push('/register'); return; }
    if (planKey === 'free') {
      toast('You are already on the Free plan or can downgrade from your subscription page.');
      return;
    }
    if (planKey === currentPlan) { toast('This is your current plan.'); return; }
    setSelectedPlan(planKey);
    setShowModal(true);
  };

  const getCtaLabel = (planKey) => {
    if (!user) return planKey === 'free' ? 'Get Started Free' : 'Start Pro Free Trial';
    if (planKey === currentPlan) return '✓ Current Plan';
    if (planKey === 'free') return currentPlan !== 'free' ? 'Downgrade' : '✓ Current Plan';
    return 'Upgrade to Pro';
  };

  const free = planData?.free ?? FALLBACK_PLANS.free;
  const pro  = planData?.pro  ?? FALLBACK_PLANS.pro;
  const tableRows = planData ? buildTableRows(free, pro) : null;

  const CARDS = [
    { key: 'free', plan: free, isPopular: false },
    { key: 'pro',  plan: pro,  isPopular: true  },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo href="/" size="md" />
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/pricing" className="text-blue-600 font-semibold">Pricing</Link>
              <Link href="/#faqs" className="hover:text-gray-900 transition-colors">FAQs</Link>
              <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>{user.name}</span>
                    <SubscriptionBadge plan={currentPlan} />
                  </div>
                  <Link href="/dashboard" className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center pt-16 pb-10 px-4">
        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
          Pricing
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
          Start free, upgrade when you need more. No hidden fees, no surprises.
        </p>
      </section>

      {/* Plan cards */}
      <section className="max-w-6xl mx-auto px-4 pb-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-3xl mx-auto w-full">
          {!planData ? (
            <>
              <PlanSkeleton />
              <PlanSkeleton />
            </>
          ) : (
            CARDS.map(({ key, plan, isPopular }) => {
              const bullets    = buildBullets(plan);
              const isCurrent  = user && key === currentPlan;
              const isDisabled = isCurrent || (user && key === 'free' && currentPlan === 'free');
              return (
                <div
                  key={key}
                  className={`relative rounded-2xl border p-8 flex flex-col ${
                    isCurrent
                      ? 'border-green-500 shadow-xl ring-2 ring-green-400'
                      : isPopular
                      ? 'border-blue-500 shadow-xl ring-2 ring-blue-500'
                      : 'border-gray-200 shadow-sm'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                        Your Current Plan
                      </span>
                    </div>
                  )}
                  {!isCurrent && isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h2>
                    <p className="text-sm text-gray-500 mb-4">
                      {key === 'free'
                        ? 'Perfect for individuals getting started with activity tracking.'
                        : 'For power users who want full control over their productivity.'}
                    </p>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-extrabold text-gray-900">
                        {plan.price === 0 ? '₹0' : `₹${plan.price}`}
                      </span>
                      <span className="text-gray-400 text-sm mb-1">
                        /{key === 'free' ? 'forever' : 'per month'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCta(key)}
                    disabled={isDisabled}
                    className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors mb-8 disabled:cursor-not-allowed ${
                      isCurrent
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : isPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-60'
                    }`}
                  >
                    {getCtaLabel(key)}
                  </button>

                  <ul className="space-y-3 flex-1">
                    {bullets.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                    {bullets.missing.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                        <span className="text-gray-300 mt-0.5 shrink-0">✕</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            Compare plans
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            {!tableRows ? (
              <div className="p-8 space-y-3 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded" />
                ))}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-gray-500 font-medium w-1/2">Feature</th>
                    <th className="text-center px-4 py-4 text-gray-700 font-semibold">{free.name}</th>
                    <th className="text-center px-4 py-4 text-blue-600 font-semibold">{pro.name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tableRows.map(([feature, freeVal, proVal]) => (
                    <tr key={feature} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 text-gray-700 font-medium">{feature}</td>
                      <td className="px-4 py-3.5 text-center text-gray-500"><Cell v={freeVal} /></td>
                      <td className="px-4 py-3.5 text-center text-gray-700"><Cell v={proVal} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {planData && pro.price > 0 && (
            <p className="text-center text-sm text-gray-400 mt-4">
              Pro plan at <span className="font-semibold text-gray-600">₹{pro.price}/month</span> — cancel anytime.
            </p>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 max-w-2xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          {FAQ.map(item => (
            <div key={item.q} className="border-b border-gray-100 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-600 py-14 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Ready to take control of your day?
        </h2>
        <p className="text-blue-200 mb-8 text-sm sm:text-base">
          Join thousands of users already tracking smarter with TrakIO.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/register" className="px-8 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm">
            Get Started — It's Free
          </Link>
          <Link href="mailto:support@trakio.in" className="px-8 py-3 border border-blue-400 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm">
            Talk to Sales
          </Link>
        </div>
      </section>

      <Footer />

      {showModal && (
        <PlanModal
          currentPlan={currentPlan}
          onClose={() => { setShowModal(false); setSelectedPlan(null); }}
          onSuccess={() => {
            setShowModal(false);
            toast.success('Subscription upgraded! 🎉');
          }}
        />
      )}
    </div>
  );
}
