'use client';

export const dynamic = 'force-dynamic';

import ProtectedLayout from '@/components/Layout/ProtectedLayout';
import ActivityCalendar from '@/components/Activities/ActivityCalendar';

export default function CalendarPage() {
  return (
    <ProtectedLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Activity Calendar 📅</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            View your activities in monthly or weekly calendar format
          </p>
        </div>

        <ActivityCalendar />
      </div>
    </ProtectedLayout>
  );
}
