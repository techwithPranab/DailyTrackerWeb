export const metadata = {
  title: 'Contact & Support',
  description:
    'Get in touch with the TrakIO support team. We\'re here to help with account issues, billing questions, feature requests, or any other queries.',
  keywords: ['TrakIO contact', 'TrakIO support', 'help', 'customer service'],
  alternates: { canonical: 'https://trakio.in/contact' },
  openGraph: {
    title: 'Contact TrakIO Support',
    description: 'Reach out to the TrakIO team for help with your account, billing, or any feature questions.',
    url: 'https://trakio.in/contact',
  },
};

export default function ContactLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'TrakIO Contact & Support',
    url: 'https://trakio.in/contact',
    description: 'Contact TrakIO support for account help, billing queries, or feature requests.',
    mainEntity: {
      '@type': 'Organization',
      name: 'TrakIO',
      url: 'https://trakio.in',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@trakio.in',
        contactType: 'customer support',
        availableLanguage: 'English',
      },
    },
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
