export const metadata = {
  title: 'Login — Sign In to Your Account',
  description:
    'Log in to your TrakIO account to manage your daily activities, track habits, hit milestones, and stay productive.',
  keywords: ['TrakIO login', 'sign in', 'activity tracker login'],
  alternates: { canonical: 'https://trakio.in/login' },
  robots: { index: true, follow: false },
  openGraph: {
    title: 'Login to TrakIO',
    description: 'Sign in to your TrakIO account and get back on track.',
    url: 'https://trakio.in/login',
  },
};

export default function LoginLayout({ children }) {
  return children;
}
