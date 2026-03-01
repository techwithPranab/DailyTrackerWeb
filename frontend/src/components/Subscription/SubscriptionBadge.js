'use client';

const PLAN_STYLES = {
  free:       { bg: 'bg-gray-100',    text: 'text-gray-600',    label: 'Free' },
  pro:        { bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Pro ⭐' },
};

export default function SubscriptionBadge({ plan = 'free', className = '' }) {
  const style = PLAN_STYLES[plan] ?? PLAN_STYLES.free;
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text} ${className}`}>
      {style.label}
    </span>
  );
}
