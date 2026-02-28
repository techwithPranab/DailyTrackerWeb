'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Layout/Footer';
import Logo from '@/components/Logo';
import PlanModal from '@/components/Subscription/PlanModal';
import SubscriptionBadge from '@/components/Subscription/SubscriptionBadge';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const plans = [
  {
    key: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for individuals getting started with activity tracking.',
    color: 'gray',
    badge: null,
    cta: 'Get Started Free',
    href: '/register',
    features: [
      'Up to 10 activities',
      'Basic calendar view',
      '1 reminder per activity',
      'Weekly summary',
      'Mobile-friendly interface',
    ],
    missing: [
      'Recurring activities',
      'Milestone tracking',
      'Priority support',
      'Advanced analytics',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '₹199',
    period: 'per month',
    description: 'For power users who want full control over their productivity.',
    color: 'blue',
    badge: 'Most Popular',
    cta: 'Start Pro Free Trial',
    href: '/register',
    features: [
      'Unlimited activities',
      'Monthly & weekly calendar',
      'Unlimited reminders',
      'Recurring activities (daily, weekly, monthly)',
      'Milestone tracking',
      'Advanced analytics & charts',
      'Priority email support',
      'Data export (CSV)',
    ],
    missing: [],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: '₹999',
    period: 'per month',
    description: 'For teams and organisations that need scale and control.',
    color: 'indigo',
    badge: null,
    cta: 'Contact Us',
    href: 'mailto:support@trakio.in',
    features: [
      'Everything in Pro',
      'Multi-user / team workspace',
      'Admin panel & user management',
      'Custom branding',
      'SSO / SAML integration',
      'Dedicated account manager',
      'SLA-backed uptime guarantee',
      'Custom data retention policies',
    ],
    missing: [],
  },
];

const faqItems = [
  {
    q: 'Can I cancel anytime?',
    a: "Yes — you can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing period.",
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'Absolutely. Every new Pro sign-up gets a 14-day free trial — no credit card required.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit/debit cards, UPI, and net banking via our secure payment gateway.',
  },
  {
    q: 'Can I upgrade or downgrade my plan?',
    a: 'Yes, you can switch plans at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle.',
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const currentPlan = user?.subscription?.plan ?? 'free';

  const handleCta = (plan) => {
    if (!user) {
      router.push('/register');
      return;
    }
    if (plan.key === 'free') {
      toast('You are already on the Free plan or can downgrade from your subscription page.');
      return;
    }
    if (plan.key === currentPlan) {
      toast('This is your current plan.');
      return;
    }
    setSelectedPlan(plan.key);
    setShowModal(true);
  };

  const getCtaLabel = (plan) => {
    if (!user) return plan.cta;
    if (plan.key === currentPlan) return '✓ Current Plan';
    if (plan.key === 'free') return currentPlan !== 'free' ? 'Downgrade' : '✓ Current Plan';
    return plan.key === 'enterprise' ? 'Upgrade to Enterprise' : 'Upgrade to Pro';
  };

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

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-4 pb-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => {
            const isPopular = plan.badge === 'Most Popular';
            const isCurrent = user && plan.key === currentPlan;
            return (
              <div
                key={plan.name}
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
                  <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 text-sm mb-1">/{plan.period}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCta(plan)}
                  disabled={isCurrent || (user && plan.key === 'free' && currentPlan === 'free')}
                  className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors mb-8 disabled:cursor-not-allowed ${
                    isCurrent
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : isPopular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-60'
                  }`}
                >
                  {getCtaLabel(plan)}
                </button>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                      <span className="text-gray-300 mt-0.5 shrink-0">✕</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            Compare plans
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-gray-500 font-medium w-1/2">Feature</th>
                  <th className="text-center px-4 py-4 text-gray-700 font-semibold">Free</th>
                  <th className="text-center px-4 py-4 text-blue-600 font-semibold">Pro</th>
                  <th className="text-center px-4 py-4 text-indigo-700 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  ['Activities', '10', 'Unlimited', 'Unlimited'],
                  ['Calendar view', '✓', '✓', '✓'],
                  ['Reminders', '1 / activity', 'Unlimited', 'Unlimited'],
                  ['Recurring activities', '✕', '✓', '✓'],
                  ['Milestone tracking', '✕', '✓', '✓'],
                  ['Analytics & charts', '✕', '✓', '✓'],
                  ['Data export', '✕', 'CSV', 'CSV + API'],
                  ['Team workspace', '✕', '✕', '✓'],
                  ['Admin panel', '✕', '✕', '✓'],
                  ['Priority support', '✕', 'Email', 'Dedicated'],
                ].map(([feature, free, pro, enterprise]) => (
                  <tr key={feature} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5 text-gray-700 font-medium">{feature}</td>
                    <td className="px-4 py-3.5 text-center text-gray-500">{free === '✕' ? <span className="text-red-300">✕</span> : free}</td>
                    <td className="px-4 py-3.5 text-center text-gray-700">{pro === '✕' ? <span className="text-red-300">✕</span> : pro === '✓' ? <span className="text-green-600">✓</span> : pro}</td>
                    <td className="px-4 py-3.5 text-center text-gray-700">{enterprise === '✕' ? <span className="text-red-300">✕</span> : enterprise === '✓' ? <span className="text-green-600">✓</span> : enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 max-w-2xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          {faqItems.map((item) => (
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
