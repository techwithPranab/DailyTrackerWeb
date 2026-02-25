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
    'TrakIO is a smart personal activity tracker that helps you organise daily tasks, set recurring schedules, hit milestones, and stay on track — all in one place.',
  keywords: [
    'activity tracker',
    'personal productivity',
    'goal tracker',
    'daily planner',
    'habit tracker',
    'milestone tracker',
    'task management',
    'recurring activities',
    'TrakIO',
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
      'Track your daily activities, build recurring habits, hit milestones and get smart reminders — all from your personal TrakIO dashboard.',
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
      'Track your daily activities, build recurring habits, hit milestones and get smart reminders.',
    images: ['/og-image.png'],
    creator: '@trakio_in',
  },
  alternates: {
    canonical: 'https://trakio.in',
  },
};

// JSON-LD structured data for AI search engines and Google Rich Results
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'TrakIO',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web',
  url: 'https://trakio.in',
  description:
    'TrakIO is a personal activity tracker that helps individuals organise tasks, set daily or recurring schedules, achieve milestones, and receive smart reminders.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
  featureList: [
    'Activity management with priorities and categories',
    'Daily, weekly and monthly recurring activities',
    'Visual calendar with monthly and weekly views',
    'Milestone tracking with progress indicators',
    'Smart reminders',
    'Personal dashboard with stats',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@trakio.in',
    contactType: 'customer support',
  },
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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

