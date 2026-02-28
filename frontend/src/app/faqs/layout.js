export const metadata = {
  title: 'FAQs — Frequently Asked Questions',
  description:
    'Find answers to common questions about TrakIO — recurring activities, calendar, reminders, milestones, home utilities, billing, and account management.',
  keywords: [
    'TrakIO FAQ',
    'activity tracker help',
    'recurring activity questions',
    'how to use TrakIO',
    'TrakIO support',
  ],
  alternates: { canonical: 'https://trakio.in/faqs' },
  openGraph: {
    title: 'TrakIO FAQs — Frequently Asked Questions',
    description: 'Everything you need to know about using TrakIO — from setting up recurring activities to managing your subscription.',
    url: 'https://trakio.in/faqs',
  },
};

export default function FaqsLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I create a recurring activity?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'When creating an activity, toggle the "Recurring Activity" switch. Choose a pattern (Daily, Weekly, or Monthly). For weekly, select the days. Optionally set an end date.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is TrakIO free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The Free plan is free forever with no credit card required. It includes up to 10 activities and basic features.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I cancel my paid plan anytime?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, cancel any time from your account settings. You keep access until the end of your billing period.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the Home Utility Tracker?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Home Utility Tracker (available on Pro) lets you log and monitor household appliances — recording service dates, warranty info, and service reminders so you never miss maintenance.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I mark an activity as completed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'On the Activities page, use the Status dropdown in the table row to change the status to "Completed". On the Dashboard you can also use the action buttons on the activity card.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
