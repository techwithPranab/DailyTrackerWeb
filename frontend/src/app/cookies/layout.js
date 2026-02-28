export const metadata = {
  title: 'Cookie Policy',
  description:
    'TrakIO uses only essential session cookies — no advertising or tracking cookies. Read our Cookie Policy for details on what we store and why.',
  keywords: ['TrakIO cookie policy', 'cookies', 'session cookies'],
  alternates: { canonical: 'https://trakio.in/cookies' },
  robots: { index: true, follow: false },
};

export default function CookiesLayout({ children }) {
  return children;
}
