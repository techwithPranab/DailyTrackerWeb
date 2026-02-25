'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default function HelpCenterPage() {
  const topics = [
    {
      icon: '📝',
      title: 'Managing Activities',
      description: 'Learn how to create, edit, and delete activities.',
      items: [
        'Create a new activity with a name, description, start time, and duration.',
        'Set priority (Low, Medium, High) and category (Chores, School, Fitness, Hobby, Other).',
        'Update activity status to Not Started, In Progress, or Completed.',
        'Delete activities you no longer need.',
        'Use filters to quickly find activities by status, priority, or category.',
      ],
    },
    {
      icon: '🔄',
      title: 'Recurring Activities',
      description: 'Set up activities that repeat automatically.',
      items: [
        'Enable recurring when creating an activity.',
        'Choose a pattern: Daily, Weekly, or Monthly.',
        'For weekly recurrence, select specific days of the week.',
        'Optionally set an end date for the recurrence.',
        'Recurring activities appear on all scheduled days in the calendar.',
      ],
    },
    {
      icon: '📅',
      title: 'Activity Calendar',
      description: 'Visualize your activities in monthly and weekly views.',
      items: [
        'Switch between Monthly and Weekly views using the toggle buttons.',
        'Navigate months/weeks with the Previous and Next arrows.',
        'Click "Today" to jump back to the current date.',
        'Days with activities show a badge with the activity count.',
        'Click any day to see a popup listing all activities for that day.',
        'Purple badges indicate recurring activities.',
      ],
    },
    {
      icon: '🎯',
      title: 'Milestones',
      description: 'Set and track important goals.',
      items: [
        'Create milestones with a title, description, and target date.',
        'Track progress as you complete steps toward each milestone.',
        'Mark milestones as achieved once completed.',
        'View all milestones on the Milestones page.',
      ],
    },
    {
      icon: '⏰',
      title: 'Reminders',
      description: 'Never miss an activity with smart reminders.',
      items: [
        'Set reminders for specific activities.',
        'Choose a reminder time before the activity starts.',
        'View all upcoming reminders on the Reminders page.',
        'Upcoming reminders are also shown on the Dashboard.',
      ],
    },
    {
      icon: '📊',
      title: 'Dashboard',
      description: 'Get a quick overview of your day.',
      items: [
        'See today\'s activities at a glance.',
        'View quick stats: Total, Completed, In Progress, Not Started.',
        'Use Quick Action cards to jump to key sections.',
        'View upcoming reminders directly from the dashboard.',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-4">🆘</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-blue-100 text-base sm:text-lg max-w-xl mx-auto">
            Everything you need to know about using TrakIO.
          </p>
        </div>
      </div>

      {/* Topics */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {topics.map((topic, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{topic.icon}</span>
                <h2 className="text-xl font-bold text-gray-900">{topic.title}</h2>
              </div>
              <p className="text-gray-500 mb-4 text-sm">{topic.description}</p>
              <ul className="space-y-2">
                {topic.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-500 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6 sm:p-8 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Still need help?</h3>
          <p className="text-gray-600 text-sm mb-4">Our support team is happy to assist you.</p>
          <Link
            href="/contact"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Contact Support
          </Link>
        </div>
      </div>

      {/* Back link */}
      <div className="max-w-4xl mx-auto px-4 pb-12 text-center">
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
