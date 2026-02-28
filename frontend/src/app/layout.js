import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL('https://trakio.in'),
  title: {
    default: 'TrakIO — Personal Activity & Goal Tracker',
    template: '%s | TrakIO',
  },
  description:
    'TrakIO is a free personal productivity app to organise daily tasks, build recurring habits, track milestones, manage home utilities, and get smart reminders — all in one dashboard.',
  keywords: [
    'activity tracker',
    'personal productivity app',
    'goal tracker',
    'daily planner',
    'habit tracker',
    'milestone tracker',
    'task management app India',
    'recurring activity tracker',
    'home utility tracker',
    'free productivity app',
    'TrakIO',
    'daily task manager',
    'personal dashboard',
  ],
  authors: [{ name: 'TrakIO', url: 'https://trakio.in' }],
  creator: 'TrakIO',
  publisher: 'TrakIO',
  applicationName: 'TrakIO',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://trakio.in',
    siteName: 'TrakIO',
    title: 'TrakIO — Personal Activity & Goal Tracker',
    description:
      'Track daily activities, build recurring habits, hit milestones, manage home utilities and get smart reminders — all from your free TrakIO dashboard.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TrakIO — Personal Activity Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrakIO — Personal Activity & Goal Tracker',
    description:
      'Track daily activities, build recurring habits, hit milestones and get smart reminders — free personal dashboard.',
    images: ['/og-image.png'],
    creator: '@trakio_in',
  },
  alternates: {
    canonical: 'https://trakio.in',
  },
  category: 'productivity',
};

// JSON-LD — SoftwareApplication (Google Rich Results + AI search)
const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'TrakIO',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web, Android, iOS',
  url: 'https://trakio.in',
  description:
    'TrakIO is a personal activity tracker that helps individuals organise tasks, set daily or recurring schedules, achieve milestones, track home utilities, and receive smart reminders — all for free.',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free Plan',
      price: '0',
      priceCurrency: 'INR',
      description: 'Free forever — up to 10 activities, calendar view, and basic reminders.',
    },
    {
      '@type': 'Offer',
      name: 'Pro Plan',
      price: '199',
      priceCurrency: 'INR',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '199',
        priceCurrency: 'INR',
        unitText: 'MONTH',
      },
      description: 'Unlimited activities, recurring schedules, milestones, analytics, home utility tracker, and priority support.',
    },
  ],
  featureList: [
    'Activity management with priorities and categories',
    'Daily, weekly and monthly recurring activities',
    'Visual calendar with monthly and weekly views',
    'Milestone tracking with progress indicators',
    'Smart reminders with notifications',
    'Personal dashboard with stats and charts',
    'Home utility tracker for appliance management',
    'Data export (CSV)',
    'Mobile-friendly progressive web app',
  ],
  screenshot: 'https://trakio.in/og-image.png',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '120',
  },
};

// JSON-LD — Organization (AI knowledge panel)
const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TrakIO',
  url: 'https://trakio.in',
  logo: 'https://trakio.in/logo.png',
  description: 'TrakIO — Personal activity, habit, milestone, and home utility tracker.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@trakio.in',
    contactType: 'customer support',
    availableLanguage: 'English',
  },
  sameAs: [],
};

// JSON-LD — WebSite (enables Google Sitelinks Searchbox)
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TrakIO',
  url: 'https://trakio.in',
  description: 'Free personal activity tracker — manage tasks, habits, milestones and home utilities.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://trakio.in/activities?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

