'use client';

import Link from 'next/link';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using Family Activity Tracker, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.`,
  },
  {
    title: '2. Description of Service',
    content: `Family Activity Tracker is a web application that allows families to create, manage, and track daily activities, recurring schedules, milestones, and reminders. The service is provided on an "as is" and "as available" basis.`,
  },
  {
    title: '3. Account Registration',
    content: `To use the service, you must create an account with a valid name and email address. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.`,
  },
  {
    title: '4. Acceptable Use',
    content: `You agree to use the service only for lawful purposes and in a manner that does not infringe the rights of others. You may not use the service to store, transmit, or display any content that is harmful, offensive, or violates any applicable laws.`,
  },
  {
    title: '5. Intellectual Property',
    content: `All content, features, and functionality of Family Activity Tracker, including but not limited to the design, code, and trademarks, are the exclusive property of the service provider. You may not copy, modify, or distribute any part of the service without explicit written permission.`,
  },
  {
    title: '6. User Content',
    content: `You retain ownership of all content you create within the app (activities, milestones, reminders). By using the service, you grant us a limited license to store and display your content for the purpose of providing the service.`,
  },
  {
    title: '7. Termination',
    content: `We reserve the right to suspend or terminate your account at any time if you violate these Terms of Service. You may also delete your account at any time by contacting our support team.`,
  },
  {
    title: '8. Limitation of Liability',
    content: `Family Activity Tracker shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount paid by you, if any, for access to the service.`,
  },
  {
    title: '9. Changes to Terms',
    content: `We reserve the right to modify these terms at any time. Continued use of the service after changes are posted constitutes your acceptance of the revised terms.`,
  },
  {
    title: '10. Governing Law',
    content: `These Terms of Service shall be governed by and construed in accordance with applicable law. Any disputes shall be resolved through good-faith negotiation or appropriate legal channels.`,
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-400 text-sm">Last updated: February 23, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Intro */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-8">
          <p className="text-gray-700 text-sm leading-relaxed">
            These Terms of Service govern your use of <strong>Family Activity Tracker</strong>. 
            Please read them carefully before using the service. These terms form a legal agreement 
            between you and Family Activity Tracker.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Bottom nav */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Back to Dashboard
          </Link>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            <Link href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
