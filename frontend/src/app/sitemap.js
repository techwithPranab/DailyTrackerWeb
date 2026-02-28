/**
 * Dynamic sitemap — served at /sitemap.xml
 * Next.js App Router auto-generates the XML from this array.
 */
export default function sitemap() {
  const base = 'https://trakio.in';
  const now  = new Date();

  /** Public / marketing pages */
  const publicRoutes = [
    { url: base,                       priority: 1.0,  changeFrequency: 'weekly'  },
    { url: `${base}/pricing`,          priority: 0.9,  changeFrequency: 'weekly'  },
    { url: `${base}/faqs`,             priority: 0.7,  changeFrequency: 'monthly' },
    { url: `${base}/help`,             priority: 0.6,  changeFrequency: 'monthly' },
    { url: `${base}/contact`,          priority: 0.6,  changeFrequency: 'yearly'  },
    { url: `${base}/privacy`,          priority: 0.3,  changeFrequency: 'yearly'  },
    { url: `${base}/terms`,            priority: 0.3,  changeFrequency: 'yearly'  },
    { url: `${base}/cookies`,          priority: 0.2,  changeFrequency: 'yearly'  },
  ];

  /** Auth pages — indexable so search engines can direct users here */
  const authRoutes = [
    { url: `${base}/login`,    priority: 0.5, changeFrequency: 'yearly' },
    { url: `${base}/register`, priority: 0.8, changeFrequency: 'yearly' },
  ];

  return [...publicRoutes, ...authRoutes].map((r) => ({
    ...r,
    lastModified: now,
  }));
}
