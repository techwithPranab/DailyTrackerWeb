import Link from 'next/link';

const faqs = [
  {
    question: 'How do I create a recurring activity?',
    answer:
      'When creating an activity, toggle the "Recurring Activity" switch. Then choose a pattern (Daily, Weekly, or Monthly). For weekly, select the days of the week. Optionally set an end date. The activity will automatically appear on all scheduled days in the calendar.',
  },
  {
    question: 'Can I edit a recurring activity?',
    answer:
      'Yes. Go to the Activities page, find the activity, and click the Edit button. Changes will apply to the base activity and will be reflected across all future occurrences in the calendar.',
  },
  {
    question: 'Why are my activities not showing in the Calendar?',
    answer:
      'Make sure the activity has a start time set. If it is a recurring activity, ensure it has been set up with the correct recurrence pattern. Navigate to the correct month or week using the arrows in the Calendar view.',
  },
  {
    question: 'What do the badge colors mean on the calendar?',
    answer:
      'Blue badges indicate regular (non-recurring) activities. Purple badges indicate days that contain at least one recurring activity. The number inside the badge shows how many activities are scheduled for that day.',
  },
  {
    question: 'How do I mark an activity as completed?',
    answer:
      'On the Activities page, use the Status dropdown in the table row to change the status to "Completed". On the Dashboard, you can also use the action buttons on the activity card.',
  },
  {
    question: 'How do I set a reminder for an activity?',
    answer:
      'Go to the Reminders page and create a new reminder. Select the activity you want to be reminded about and choose the reminder time. The reminder will appear in your upcoming reminders list on the Dashboard.',
  },
  {
    question: 'What is the difference between Monthly and Weekly calendar views?',
    answer:
      'The Monthly view shows a full month grid, giving you a high-level overview. The Weekly view shows a 7-day layout with more detail, including activity names visible directly on each day card.',
  },
  {
    question: 'Can I filter activities by priority or category?',
    answer:
      'Yes. On the Activities page, use the filter dropdowns at the top to filter by Status, Priority, or Category. All three filters can be combined.',
  },
  {
    question: 'How do I delete an activity?',
    answer:
      'On the Activities page, find the activity in the table and click the "Delete" button in the Actions column. A confirmation dialog will appear before the activity is permanently deleted.',
  },
  {
    question: 'What categories are available for activities?',
    answer:
      'Activities can be assigned to one of five categories: Chores, School, Fitness, Hobby, or Other. You can filter by category on the Activities page.',
  },
];

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4" aria-hidden="true">❓</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-green-100 text-base sm:text-lg">
            Quick answers to the most common questions.
          </p>
        </div>
      </div>

      {/* FAQ List */}
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <summary className="flex justify-between items-center px-6 py-5 cursor-pointer list-none font-semibold text-gray-900 text-sm sm:text-base hover:bg-gray-50 transition-colors">
              {faq.question}
              <span className="ml-4 text-gray-500 text-xl group-open:rotate-45 transition-transform duration-200 select-none">
                +
              </span>
            </summary>
            <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
              <p className="pt-4">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-gray-700 text-sm mb-3">
            Didn&apos;t find what you were looking for?
          </p>
          <Link
            href="/contact"
            className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            Contact Support
          </Link>
        </div>
        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-green-600 hover:underline text-sm">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
