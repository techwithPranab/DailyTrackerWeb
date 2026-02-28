'use client';

/**
 * PlanUsageBar — shows how much of a numeric plan limit the user has consumed.
 *
 * Props:
 *   label    {string}  — e.g. "Activities"
 *   current  {number}  — current count
 *   max      {number}  — plan limit (-1 = unlimited, 0 = not available)
 *   onUpgrade {fn}     — optional CTA callback; if absent no upgrade link shown
 *   className {string} — extra wrapper classes
 */
export default function PlanUsageBar({ label, current, max, onUpgrade, className = '' }) {
  // -1 → unlimited
  if (max === -1) {
    return (
      <div className={`text-xs text-slate-400 ${className}`}>
        <span className="font-medium text-slate-300">{label}:</span>{' '}
        <span className="text-emerald-400">Unlimited</span>
      </div>
    );
  }

  // 0 → feature not available on this plan
  if (max === 0) {
    return (
      <div className={`text-xs text-slate-400 flex items-center gap-2 ${className}`}>
        <span className="font-medium text-slate-300">{label}:</span>
        <span className="text-rose-400">Not available on your plan</span>
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
          >
            Upgrade
          </button>
        )}
      </div>
    );
  }

  const percent   = Math.min(100, Math.round((current / max) * 100));
  const isWarning = percent >= 70 && percent < 90;
  const isDanger  = percent >= 90;

  const barColor = isDanger
    ? 'bg-rose-500'
    : isWarning
    ? 'bg-amber-400'
    : 'bg-emerald-500';

  const textColor = isDanger
    ? 'text-rose-400'
    : isWarning
    ? 'text-amber-400'
    : 'text-slate-300';

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-300">{label}</span>
        <span className={textColor}>
          {current} / {max}
          {onUpgrade && isDanger && (
            <>
              {' · '}
              <button
                onClick={onUpgrade}
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
              >
                Upgrade
              </button>
            </>
          )}
        </span>
      </div>

      {/* Track */}
      <div className="h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
