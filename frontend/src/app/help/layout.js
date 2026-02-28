export const metadata = {
  title: 'Help Center — How to Use TrakIO',
  description:
    'Step-by-step guides for every TrakIO feature: managing activities, setting up recurring schedules, using the calendar, tracking milestones, configuring reminders, and the home utility tracker.',
  keywords: [
    'TrakIO help',
    'how to use TrakIO',
    'activity tracker guide',
    'recurring activities tutorial',
    'milestone tracking guide',
    'home utility tracker guide',
  ],
  alternates: { canonical: 'https://trakio.in/help' },
  openGraph: {
    title: 'TrakIO Help Center',
    description: 'Step-by-step guides for activities, recurring schedules, calendar, milestones, reminders and home utility tracking.',
    url: 'https://trakio.in/help',
  },
};

export default function HelpLayout({ children }) {
  return children;
}
