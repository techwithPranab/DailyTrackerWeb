'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Footer from '@/components/Layout/Footer';
import Logo from '@/components/Logo';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

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
      desc: 'Never miss an important activity. Set custom reminders and get notified at exactly the right time.',
      gradient: 'from-red-50 to-rose-50',
    },
    {
      icon: '📊',
      title: 'Personal Dashboard',
      desc: "Your day at a glance — today's activities, completion stats, upcoming reminders, and quick-access actions.",
      gradient: 'from-cyan-50 to-blue-50',
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
            <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-600">
              <Link href="/pricing" className="px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors">Pricing</Link>
              <Link href="/faqs" className="px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors">FAQs</Link>
              <Link href="/contact" className="px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors">Contact</Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white hover:bg-blue-700 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section aria-label="Hero" className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
              <span>⚡</span> Personal productivity, simplified
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Track Everything.
              <span className="block text-yellow-300 mt-1">Achieve Anything.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              TrakIO is your personal activity tracker — manage daily tasks, build recurring habits,
              hit milestones, and stay on schedule with a smart calendar and reminders.
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

      {/* ── Stats ───────────────────────────────────────── */}
      <section aria-label="Stats" className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { value: '25,000+', label: 'Activities Tracked' },
              { value: '5,000+', label: 'Active Users' },
              { value: '98%', label: 'Satisfaction Rate' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-5xl font-extrabold text-white mb-2">{s.value}</div>
                <div className="text-blue-100 text-lg">{s.label}</div>
              </div>
            ))}
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
            Most to-do apps are too complex or too simple. TrakIO hits the sweet spot —
            it gives you structured activity scheduling, habit recurrence, milestone tracking,
            and a visual calendar in one clean, fast interface. No clutter. No noise.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '🚀', title: 'Fast Setup', desc: 'Create your first activity in under 60 seconds.' },
              { icon: '🧠', title: 'Smart Scheduling', desc: 'Daily, weekly & monthly recurrence with pre-computed dates.' },
              { icon: '🔒', title: 'Private & Secure', desc: 'Your data is yours. No ads, no third-party sharing.' },
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

      {/* ── CTA ─────────────────────────────────────────── */}
      <section aria-label="Call to action" className="bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Take Control of Your Day?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of people using TrakIO to build better habits and hit their goals.
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

      {/* ── Footer ──────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
