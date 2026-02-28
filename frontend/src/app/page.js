'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Footer from '@/components/Layout/Footer';
import Logo from '@/components/Logo';

const pricingPlans = [
  {
    key: 'free',
    icon: '🆓',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    desc: 'Perfect for individuals getting started.',
    popular: false,
    cta: 'Get Started Free',
    href: '/register',
    accentBorder: 'border-gray-200',
    accentBtn: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    features: [
      'Up to 10 activities',
      'Basic calendar view',
      '1 reminder per activity',
      'Weekly summary',
      'Mobile-friendly interface',
    ],
    missing: ['Recurring activities', 'Milestone tracking', 'Home Utility Tracker', 'Advanced analytics'],
  },
  {
    key: 'pro',
    icon: '⭐',
    name: 'Pro',
    price: '₹199',
    period: 'per month',
    desc: 'Full control for power users.',
    popular: true,
    cta: 'Start Free Trial',
    href: '/register',
    accentBorder: 'border-blue-500',
    accentBtn: 'bg-blue-600 text-white hover:bg-blue-700',
    features: [
      'Unlimited activities',
      'Monthly & weekly calendar',
      'Unlimited reminders',
      'Recurring activities (daily, weekly, monthly)',
      'Milestone tracking',
      'Home Utility Tracker',
      'Advanced analytics & charts',
      'Priority email support',
    ],
    missing: [],
  },
];

const homeFaqs = [
  { q: 'Is TrakIO really free?', a: 'Yes — the Free plan is free forever. No credit card required to sign up.' },
  { q: 'Can I cancel my paid plan anytime?', a: "Absolutely. Cancel any time from your account settings. You keep access until the end of your billing period." },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, and net banking via Razorpay.' },
  { q: 'Can I upgrade or downgrade later?', a: 'Yes, you can switch plans at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle.' },
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated && mounted) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold tracking-tight">TrakIO</h1>
          <p className="mt-2 text-blue-200">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  const features = [
    {
      icon: '📝',
      title: 'Activity Management',
      desc: 'Create and track daily activities with priorities, categories, and due dates. Stay in control of everything on your plate.',
      gradient: 'from-blue-50 to-indigo-50',
    },
    {
      icon: '🔄',
      title: 'Recurring Schedules',
      desc: 'Set daily, weekly, or monthly recurring activities. Pick specific days of the week or a day of the month — TrakIO handles the rest.',
      gradient: 'from-purple-50 to-pink-50',
    },
    {
      icon: '📅',
      title: 'Visual Calendar',
      desc: 'See your activities in a monthly or weekly calendar view. Activity counts per day, colour-coded by type, with one-click details.',
      gradient: 'from-green-50 to-emerald-50',
    },
    {
      icon: '🎯',
      title: 'Milestone Tracking',
      desc: 'Define meaningful goals and track them with visual progress indicators. Celebrate every win along the way.',
      gradient: 'from-yellow-50 to-orange-50',
    },
    {
      icon: '⏰',
      title: 'Smart Reminders',
      desc: 'Never miss an important activity or service. Get automatic reminders 7 days before every scheduled service is due.',
      gradient: 'from-red-50 to-rose-50',
    },
    {
      icon: '🏠',
      title: 'Home Utility Tracker',
      desc: 'Track appliances, HVAC, plumbing, vehicles and more. Log warranties, upload documents, and schedule service reminders — all in one place.',
      gradient: 'from-teal-50 to-cyan-50',
    },
    {
      icon: '📊',
      title: 'Personal Dashboard',
      desc: "Your day at a glance — today's tasks, upcoming service schedules, reminders, and everything that needs your attention.",
      gradient: 'from-cyan-50 to-blue-50',
    },
    {
      icon: '📎',
      title: 'Document Storage',
      desc: 'Upload warranty cards, manuals, invoices, and service reports directly to each appliance via Cloudinary — always within reach.',
      gradient: 'from-orange-50 to-amber-50',
    },
  ];

  const steps = [
    {
      num: '1',
      color: 'bg-blue-600',
      title: 'Create Your Account',
      desc: 'Sign up in seconds — no credit card required. Your personal workspace is ready instantly.',
    },
    {
      num: '2',
      color: 'bg-indigo-600',
      title: 'Add Your Activities',
      desc: 'Create one-time or recurring activities. Set priorities, categories, and let TrakIO generate your schedule.',
    },
    {
      num: '3',
      color: 'bg-violet-600',
      title: 'Track & Achieve',
      desc: 'Monitor your progress on the calendar and dashboard. Hit your milestones and build lasting habits.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navigation ──────────────────────────────────── */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo href="/" size="md" />

            {/* Desktop nav links */}
            <div className="hidden sm:flex items-center gap-5 text-sm font-medium text-gray-500">
              <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#faqs" className="hover:text-gray-900 transition-colors">FAQs</a>
            </div>

            {/* Desktop CTA buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md">
            <div className="px-4 pt-3 pb-4 space-y-1">
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#faqs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                FAQs
              </a>
              <hr className="my-2 border-gray-100" />
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-3 py-2 rounded-lg text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main id="main-content">
      {/* ── Hero ────────────────────────────────────────── */}
      <section aria-label="Hero" className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
              <span>⚡</span> Tasks, habits &amp; home — all in one place
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Track Everything.
              <span className="block text-yellow-300 mt-1">Achieve Anything.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              TrakIO is your all-in-one personal tracker — manage daily tasks, build recurring habits,
              hit milestones, and never miss an appliance service again with smart home utility management.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-3.5 text-base font-semibold rounded-xl text-blue-700 bg-white hover:bg-blue-50 shadow-lg transition-colors"
              >
                Start Free — No Card Needed
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 text-base font-semibold rounded-xl text-white border border-white/40 hover:bg-white/10 transition-colors"
              >
                Login to Dashboard →
              </Link>
            </div>
            {/* Trust signal */}
            <p className="mt-8 text-blue-200 text-sm">
              ✓ Free forever plan &nbsp;&nbsp; ✓ No credit card &nbsp;&nbsp; ✓ Ready in 30 seconds
            </p>
          </div>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 73C120 67 240 53 360 47C480 40 600 40 720 43C840 47 960 53 1080 57C1200 60 1320 60 1380 60L1440 60V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section aria-label="Features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Everything You Need to Stay on Track
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Powerful features built for individuals who want a clear, structured view of their time and goals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <article
                key={f.title}
                className={`bg-gradient-to-br ${f.gradient} rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow`}
              >
                <div className="text-5xl mb-4" aria-hidden="true">{f.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Home Utility Spotlight ───────────────────────── */}
      <section aria-label="Home Utility" className="py-24 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4">New Feature</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              🏠 Home Utility Management
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Stop losing track of when your AC was last serviced or when the water heater warranty expires.
              TrakIO keeps your entire home organised.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              {
                icon: '🔧',
                title: 'Service Schedule Tracking',
                desc: 'Log past and upcoming service dates for every appliance. TrakIO automatically reminds you 7 days before the next service is due — so you never miss a beat.',
              },
              {
                icon: '📎',
                title: 'Document Vault',
                desc: 'Upload warranty cards, user manuals, invoices, and service reports against each appliance. Stored securely on Cloudinary and accessible any time.',
              },
              {
                icon: '⚠️',
                title: 'Warranty Expiry Alerts',
                desc: "Know exactly when warranties are about to expire. Colour-coded badges flag items expiring within 30 days so you can act before it's too late.",
              },
              {
                icon: '📋',
                title: 'Full Appliance Registry',
                desc: 'Maintain a complete register of every home appliance — brand, model, purchase date, location, and current status. All searchable and filterable.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100 flex gap-4">
                <span className="text-3xl shrink-0">{item.icon}</span>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Categories */}
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Track any category</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: '🏠', label: 'Appliances' },
                { icon: '❄️', label: 'HVAC' },
                { icon: '🔧', label: 'Plumbing' },
                { icon: '⚡', label: 'Electrical' },
                { icon: '🚗', label: 'Vehicles' },
                { icon: '📦', label: 'Other' },
              ].map((c) => (
                <span key={c.label} className="inline-flex items-center gap-1.5 bg-white border border-teal-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
                  {c.icon} {c.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section aria-label="How it works" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">How TrakIO Works</h2>
            <p className="mt-4 text-lg text-gray-500">Up and running in under a minute.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className={`${s.color} text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-extrabold mx-auto mb-5 shadow-lg`}>
                  {s.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial / Why TrakIO ────────────────────── */}
      <section aria-label="Why TrakIO" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">
            Why TrakIO?
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-12">
            Most productivity apps only handle tasks. TrakIO goes further — combining activity scheduling,
            habit recurrence, milestone tracking, and complete home appliance management in one clean interface.
            No clutter. No switching between apps.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '🚀', title: 'Fast Setup', desc: 'Create your first activity or add an appliance in under 60 seconds.' },
              { icon: '🧠', title: 'Smart Scheduling', desc: 'Daily, weekly & monthly recurrence plus automatic service reminders — 7 days ahead.' },
              { icon: '🏠', title: 'Home + Work in One', desc: 'Tasks, habits, milestones and home utilities — one login, one dashboard.' },
              { icon: '📎', title: 'Document Ready', desc: 'Attach warranty cards and manuals to each appliance via secure cloud storage.' },
              { icon: '🔒', title: 'Private & Secure', desc: 'Your data is yours. No ads, no third-party sharing, no surprises.' },
              { icon: '⏰', title: 'Never Miss a Service', desc: 'Automatic reminders before every scheduled maintenance keep your home running smoothly.' },
            ].map((w) => (
              <div key={w.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="text-4xl mb-3">{w.icon}</div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{w.title}</h3>
                <p className="text-sm text-gray-600">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────── */}
      <section id="pricing" aria-label="Pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center mb-14">
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Start free, upgrade when you need more. No hidden fees, no surprises.
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-3xl mx-auto mb-16">
            {pricingPlans.map((plan) => (
              <div
                key={plan.key}
                className={`relative rounded-2xl border-2 p-8 flex flex-col ${plan.accentBorder} ${
                  plan.popular ? 'shadow-2xl' : 'shadow-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">{plan.icon}</span>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 text-sm mb-1">/{plan.period}</span>
                  </div>
                </div>

                <Link
                  href={plan.href}
                  className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors mb-8 ${plan.accentBtn}`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-gray-300 mt-0.5 shrink-0">✕</span>
                      <span className="line-through">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Feature comparison table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-4 text-gray-500 font-medium w-2/5">Feature</th>
                  <th className="text-center px-4 py-4 text-gray-700 font-semibold">Free</th>
                  <th className="text-center px-4 py-4 text-blue-600 font-semibold">Pro ⭐</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  ['Activities',            '10',          'Unlimited'],
                  ['Calendar view',         '✓',           '✓'],
                  ['Reminders',             '1/activity',  'Unlimited'],
                  ['Recurring activities',  '✕',           '✓'],
                  ['Milestone tracking',    '✕',           '✓'],
                  ['Home Utility Tracker',  '✕',           '✓'],
                  ['Analytics & charts',    '✕',           '✓'],
                  ['Data export',           '✕',           'CSV'],
                  ['Priority support',      '✕',           'Email'],
                ].map(([feature, free, pro]) => (
                  <tr key={feature} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-3.5 text-gray-700 font-medium">{feature}</td>
                    {[free, pro].map((val, i) => (
                      <td key={i} className="px-4 py-3.5 text-center">
                        {val === '✕' ? (
                          <span className="text-gray-300 font-bold">✕</span>
                        ) : val === '✓' ? (
                          <span className="text-green-500 font-bold">✓</span>
                        ) : (
                          <span className="text-gray-600">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-sm text-gray-400">
            All plans include a free 14-day trial on paid features. &nbsp;
            <Link href="/pricing" className="text-blue-600 hover:underline">
              See full pricing details →
            </Link>
          </p>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section id="faqs" aria-label="FAQ" className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-0 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            {homeFaqs.map((item) => (
              <details key={item.q} className="group px-6 py-5 cursor-pointer">
                <summary className="flex items-center justify-between list-none font-semibold text-gray-900 text-sm sm:text-base">
                  {item.q}
                  <span className="ml-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform duration-200 text-lg leading-none">
                    ▾
                  </span>
                </summary>
                <p className="mt-3 text-gray-500 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section aria-label="Call to action" className="bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Take Control of Your Day?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of people using TrakIO to manage tasks, build habits, and keep their home running smoothly.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 text-lg font-semibold rounded-xl text-indigo-700 bg-white hover:bg-blue-50 shadow-xl transition-colors"
          >
            Create Your Free Account →
          </Link>
          <p className="mt-4 text-blue-200 text-sm">No credit card required. Free forever.</p>
        </div>
      </section>

      </main>
      {/* ── Footer ──────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
