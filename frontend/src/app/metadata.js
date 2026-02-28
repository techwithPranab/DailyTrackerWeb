/**
 * Route-segment metadata for / (Home page)
 * Kept separate from page.js because page.js is 'use client'.
 */

export const metadata = {
  title: 'TrakIO — Personal Activity & Goal Tracker',
  description:
    'TrakIO is your free personal tracker for daily tasks, recurring habits, milestones, home utilities, and smart reminders. Start free — no credit card required.',
  keywords: [
    'personal activity tracker',
    'daily task manager',
    'habit tracker app',
    'goal tracker India',
    'recurring activity tracker',
    'milestone tracker',
    'home utility tracker',
    'free productivity app',
    'TrakIO',
  ],
  alternates: { canonical: 'https://trakio.in' },
  openGraph: {
    title: 'TrakIO — Track Everything. Achieve Anything.',
    description:
      'Manage daily tasks, build recurring habits, hit milestones, and track home utilities — all in one free personal dashboard.',
    url: 'https://trakio.in',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TrakIO Home' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrakIO — Track Everything. Achieve Anything.',
    description:
      'Manage daily tasks, build recurring habits, hit milestones, and track home utilities — all in one free personal dashboard.',
  },
};
