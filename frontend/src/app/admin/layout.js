import { AdminProvider } from '@/context/AdminContext';

export const metadata = {
  title: 'Admin Panel | TrakIO',
  robots: { index: false, follow: false }
};

export default function AdminRootLayout({ children }) {
  return <AdminProvider>{children}</AdminProvider>;
}
