'use client';

import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';

const CATEGORY_ICONS = {
  Appliance:  '🏠',
  Plumbing:   '🔧',
  Electrical: '⚡',
  HVAC:       '❄️',
  Vehicle:    '🚗',
  Other:      '📦'
};

const STATUS_COLORS = {
  Active:   'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-600',
  Disposed: 'bg-red-100 text-red-600'
};

function getNextService(serviceSchedule) {
  const upcoming = serviceSchedule
    ?.filter(s => s.status === 'Upcoming' && new Date(s.scheduledDate) >= new Date())
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  return upcoming?.[0] ?? null;
}

function ServiceBadge({ service }) {
  if (!service) return <span className="text-xs text-gray-400 italic">No upcoming service</span>;
  const days = differenceInDays(new Date(service.scheduledDate), new Date());
  const color = days <= 0   ? 'bg-red-100 text-red-700 border-red-200'
    : days <= 7  ? 'bg-orange-100 text-orange-700 border-orange-200'
    : days <= 30 ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
    :              'bg-green-50 text-green-700 border-green-200';

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${color}`}>
      {days <= 0 ? '🔴' : days <= 7 ? '🟠' : '🟢'}
      {days <= 0 ? 'Overdue' : days === 0 ? 'Today' : `in ${days}d`}
      <span className="font-normal opacity-75">· {service.serviceType}</span>
    </span>
  );
}

export default function UtilityCard({ utility, onDeleted }) {
  const nextService = getNextService(utility.serviceSchedule);
  const docCount    = utility.documents?.length ?? 0;

  const isWarrantyExpiring = utility.warrantyExpiryDate &&
    differenceInDays(new Date(utility.warrantyExpiryDate), new Date()) <= 30;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5">
      {/* Header */}
      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{CATEGORY_ICONS[utility.category] ?? '📦'}</span>
          <div>
            <h3 className="font-semibold text-gray-900 text-base leading-tight">{utility.name}</h3>
            {(utility.brand || utility.modelNumber) && (
              <p className="text-xs text-gray-400">
                {[utility.brand, utility.modelNumber].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[utility.status]}`}>
          {utility.status}
        </span>
      </div>

      {/* Location */}
      {utility.location && (
        <p className="text-xs text-gray-500 mb-2">📍 {utility.location}</p>
      )}

      {/* Next service badge */}
      <div className="mb-3">
        <ServiceBadge service={nextService} />
      </div>

      {/* Warranty warning */}
      {isWarrantyExpiring && (
        <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded mb-3 border border-amber-200">
          ⚠️ Warranty expires {format(new Date(utility.warrantyExpiryDate), 'MMM d, yyyy')}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {docCount > 0 ? `📎 ${docCount} doc${docCount > 1 ? 's' : ''}` : ''}
          {utility.serviceSchedule?.length > 0 ? ` · ${utility.serviceSchedule.length} service${utility.serviceSchedule.length > 1 ? 's' : ''}` : ''}
        </span>
        <Link href={`/utilities/${utility._id}`}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800">
          View →
        </Link>
      </div>
    </div>
  );
}
