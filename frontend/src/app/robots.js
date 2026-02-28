/**
 * robots.txt — served at /robots.txt
 * Next.js App Router auto-generates the file from this export.
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard', '/activities', '/calendar',
                   '/milestones', '/reminders', '/utilities', '/subscription'],
      },
    ],
    sitemap: 'https://trakio.in/sitemap.xml',
    host: 'https://trakio.in',
  };
}
