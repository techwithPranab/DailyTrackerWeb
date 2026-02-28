export const metadata = {
  title: 'Pricing — Free & Pro Plans',
  description:
    'TrakIO offers a free plan forever and an affordable Pro plan at ₹199/month. Compare features and choose the plan that fits your productivity goals.',
  keywords: [
    'TrakIO pricing',
    'activity tracker free plan',
    'productivity app pricing India',
    'task tracker pro plan',
    'habit tracker subscription',
    'TrakIO pro ₹199',
  ],
  alternates: { canonical: 'https://trakio.in/pricing' },
  openGraph: {
    title: 'TrakIO Pricing — Free & Pro Plans',
    description:
      'Free forever or upgrade to Pro at ₹199/month. Unlock unlimited activities, recurring schedules, milestones, analytics and more.',
    url: 'https://trakio.in/pricing',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TrakIO Pricing' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrakIO Pricing — Free & Pro Plans',
    description: 'Free forever or upgrade to Pro at ₹199/month for unlimited productivity features.',
  },
};

export default function PricingLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'TrakIO Pricing',
    url: 'https://trakio.in/pricing',
    description: 'Compare TrakIO Free and Pro plans. Free plan is available forever; Pro plan starts at ₹199/month.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Offer',
            name: 'TrakIO Free Plan',
            price: '0',
            priceCurrency: 'INR',
            description: 'Free forever. Includes up to 10 activities, 1 reminder per activity, and basic calendar view.',
            eligibleCustomerType: 'https://schema.org/BusinessEntityType',
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'Offer',
            name: 'TrakIO Pro Plan',
            price: '199',
            priceCurrency: 'INR',
            description: 'Pro plan at ₹199/month. Includes unlimited activities, recurring schedules, milestones, analytics, and priority support.',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: '199',
              priceCurrency: 'INR',
              unitText: 'MONTH',
            },
          },
        },
      ],
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
