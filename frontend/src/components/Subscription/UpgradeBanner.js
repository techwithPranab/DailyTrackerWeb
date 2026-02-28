'use client';

import { useState, useEffect } from 'react';

/**
 * UpgradeBanner — dismissible banner shown when a user is close to or at
 * their plan limit, or when a gated feature is accessed.
 *
 * Props:
 *   title       {string}   — Banner headline
 *   message     {string}   — Descriptive copy
 *   storageKey  {string}   — Unique key for sessionStorage dismissal
 *   onUpgrade   {fn}       — Called when "Upgrade" CTA is clicked
 *   threshold   {number}   — 0-100; banner shows when usagePercent >= threshold (default 80)
 *   usagePercent {number|null} — If provided, banner only shows when >= threshold
 *   className   {string}   — extra wrapper classes
 */
export default function UpgradeBanner({
  title       = 'You\'re running low on quota',
  message,
  storageKey,
  onUpgrade,
  threshold   = 80,
  usagePercent = null,
  className   = '',
}) {
  const [dismissed, setDismissed] = useState(false);

  // Restore dismissal state from sessionStorage
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      setDismissed(sessionStorage.getItem(`upgrade_banner_${storageKey}`) === '1');
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    if (storageKey && typeof window !== 'undefined') {
      sessionStorage.setItem(`upgrade_banner_${storageKey}`, '1');
    }
  };

  // Hide when dismissed or usage hasn't hit threshold yet
  if (dismissed) return null;
  if (usagePercent !== null && usagePercent < threshold) return null;

  return (
    <div
      className={`relative flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm ${className}`}
    >
      {/* Icon — lightning bolt ⚡ */}
      <span className="mt-0.5 flex-shrink-0 text-amber-400 text-base leading-none">⚡</span>

      {/* Copy */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-amber-300">{title}</p>
        {message && <p className="mt-0.5 text-amber-200/80">{message}</p>}
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="mt-2 inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-400 transition-colors"
          >
            ⚡ Upgrade now
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="flex-shrink-0 rounded p-0.5 text-amber-400 hover:text-amber-200 hover:bg-amber-500/20 transition-colors text-lg leading-none"
      >
        ✕
      </button>
    </div>
  );
}
