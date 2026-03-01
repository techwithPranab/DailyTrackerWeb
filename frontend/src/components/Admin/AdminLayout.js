'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '@/context/AdminContext';
import Logo from '@/components/Logo';

const NAV = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/users', icon: '👥', label: 'Users' },
  { href: '/admin/subscriptions', icon: '💳', label: 'Subscriptions' },
  { href: '/admin/transactions', icon: '🧾', label: 'Transactions' },
  { href: '/admin/revenue', icon: '📈', label: 'Revenue' },
  { href: '/admin/plan-features', icon: '🗂️', label: 'Plan Features' },
  { href: '/admin/contact', icon: '📬', label: 'Contact Messages' },
  { href: '/admin/settings', icon: '⚙️', label: 'App Settings' },
];

export default function AdminLayout({ children }) {
  const { admin, logout, loading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
          <Logo href="/admin/dashboard" size="md" />
          <span className="text-blue-600 text-xs font-semibold uppercase tracking-widest ml-1">Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin info + logout */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {admin.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-gray-900 text-sm font-medium truncate">{admin.name}</p>
              <p className="text-gray-500 text-xs truncate">{admin.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-900 p-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 lg:flex-none">
            <h1 className="text-gray-800 text-base font-semibold ml-2 lg:ml-0">
              {NAV.find(n => pathname.startsWith(n.href))?.label || 'Admin Panel'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-gray-400 text-sm">{admin.email}</span>
            <Link
              href="/dashboard"
              target="_blank"
              className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-2 py-1 rounded transition-colors"
            >
              View App →
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
