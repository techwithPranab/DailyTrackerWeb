import Link from 'next/link';

const sections = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide when registering an account, including your name and email address. We also collect activity data you create within the app, such as activity names, schedules, and completion records.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `Your information is used solely to provide the TrakIO service. This includes displaying your activities, reminders, and milestones. We do not sell or share your personal data with third parties for marketing purposes.`,
  },
  {
    title: '3. Data Storage & Security',
    content: `Your data is stored securely using industry-standard encryption. We use MongoDB Atlas for database storage and implement authentication tokens (JWT) to protect your account. All data transfers are encrypted using HTTPS.`,
  },
  {
    title: '4. Cookies',
    content: `We use minimal cookies to maintain your login session. We do not use tracking cookies or advertising cookies. You can manage cookie settings through your browser preferences.`,
  },
  {
    title: '5. Children\'s Privacy',
    content: `TrakIO is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has created an account, please contact us immediately and we will delete the account and associated data.`,
  },
  {
    title: '6. Data Retention',
    content: `We retain your data for as long as your account remains active. You may request deletion of your account and associated data at any time by contacting our support team.`,
  },
  {
    title: '7. Your Rights',
    content: `You have the right to access, correct, or delete your personal data at any time. To exercise these rights, please contact us via the Contact Support page.`,
  },
  {
    title: '8. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice within the app. Your continued use of the service after changes are posted constitutes acceptance of the updated policy.`,
  },
  {
    title: '9. Contact Us',
    content: `If you have questions about this Privacy Policy, please contact us at privacy@trakio.in or through our Contact Support page.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Last updated: February 23, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Intro */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-8">
          <p className="text-gray-700 text-sm leading-relaxed">
            At <strong>TrakIO</strong>, we are committed to protecting your privacy. 
            This Privacy Policy explains what information we collect, how we use it, and the choices 
            you have regarding your data. By using our service, you agree to the practices described 
            in this policy.
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
            <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
            <Link href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
