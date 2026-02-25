'use client';

import Link from 'next/link';

/**
 * Shared TrakIO logo — uniform across public pages, Navbar, AdminLayout, login pages.
 * @param {string} href  - Link destination (default "/")
 * @param {string} size  - "sm" | "md" | "lg"
 * @param {boolean} dark - Use white text (for dark backgrounds)
 */
export default function Logo({ href = '/', size = 'md', dark = false }) {
  const sizes = {
    sm: { emoji: 'text-xl', text: 'text-lg' },
    md: { emoji: 'text-2xl', text: 'text-xl' },
    lg: { emoji: 'text-3xl', text: 'text-2xl' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <Link href={href} className="flex items-center gap-1.5 group select-none">
      <span className={`${s.emoji} leading-none`}>⚡</span>
      <span className={`${s.text} font-extrabold tracking-tight ${dark ? 'text-white' : 'text-gray-900'} group-hover:opacity-90 transition-opacity`}>
        TrakIO
      </span>
    </Link>
  );
}
