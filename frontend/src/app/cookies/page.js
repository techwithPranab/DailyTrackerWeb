'use client';

import Link from 'next/link';

const sections = [
  {
    title: 'What Are Cookies?',
    content: `Cookies are small text files that are stored in your browser when you visit a website. They are widely used to make websites work efficiently and to provide information to the website owners.`,
  },
  {
    title: 'How We Use Cookies',
    content: `Family Activity Tracker uses a minimal number of cookies strictly necessary to operate the service. We do not use advertising or tracking cookies.`,
  },
  {
    title: 'Essential Cookies',
    content: `These cookies are required for the service to function. They include your authentication token that keeps you logged in during your session. Without these cookies, the app cannot operate correctly.`,
  },
  {
    title: 'No Third-Party Tracking Cookies',
    content: `We do not use any third-party advertising, analytics tracking, or social media cookies. Your browsing activity within the app is not shared with external services for advertising purposes.`,
  },
  {
    title: 'Managing Cookies',
    content: `You can control and/or delete cookies from your browser settings at any time. However, disabling essential cookies may prevent you from logging into or using the service correctly.`,
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Cookie Policy from time to time. Any significant changes will be communicated within the app. Your continued use of the service constitutes acceptance of the updated policy.`,
  },
];

const cookieTable = [
  { name: 'auth_token', purpose: 'Keeps you authenticated and logged in', duration: 'Session / 7 days', type: 'Essential' },
  { name: 'user_prefs', purpose: 'Remembers your UI preferences', duration: '30 days', type: 'Functional' },
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">🍪</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-gray-400 text-sm">Last updated: February 23, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Intro */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-8">
          <p className="text-gray-700 text-sm leading-relaxed">
            This Cookie Policy explains how <strong>Family Activity Tracker</strong> uses cookies and 
            similar technologies. We believe in transparency, so this document clearly describes what 
            we use and why.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6 mb-8">
          {sections.map((section, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Cookie Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Cookies We Use</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cookie</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Purpose</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cookieTable.map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{row.name}</td>
                    <td className="px-4 py-3 text-gray-600">{row.purpose}</td>
                    <td className="px-4 py-3 text-gray-600">{row.duration}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row.type === 'Essential' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {row.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Back to Dashboard
          </Link>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
