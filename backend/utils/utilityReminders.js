const cron       = require('node-cron');
const HomeUtility = require('../models/HomeUtility');

/**
 * Scans all active home utilities and marks reminder as sent for any
 * service entry that is Upcoming and due within the next 7 days.
 *
 * Runs daily at 08:00.  Can be extended to send emails / push notifications.
 */
const checkAndSendReminders = async () => {
  try {
    const now  = new Date();
    const in7  = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const utilities = await HomeUtility.find({
      status: 'Active',
      'serviceSchedule': {
        $elemMatch: {
          status:       'Upcoming',
          reminderSent: false,
          scheduledDate: { $gte: now, $lte: in7 }
        }
      }
    });

    let totalMarked = 0;

    for (const utility of utilities) {
      let changed = false;
      for (const entry of utility.serviceSchedule) {
        if (
          entry.status       === 'Upcoming' &&
          entry.reminderSent === false       &&
          entry.scheduledDate >= now         &&
          entry.scheduledDate <= in7
        ) {
          entry.reminderSent = true;
          changed = true;
          totalMarked++;

          // ── Extend here: send email / push notification ──────────────────
          console.log(
            `[Utility Reminder] ${utility.name} → ${entry.serviceType} due on ` +
            `${entry.scheduledDate.toDateString()} (userId: ${utility.userId})`
          );
        }
      }
      if (changed) await utility.save();
    }

    console.log(`[Utility Reminders] ${totalMarked} reminder(s) marked — ${new Date().toISOString()}`);
  } catch (err) {
    console.error('[Utility Reminders] Error:', err.message);
  }
};

// Schedule: every day at 08:00 server time
const startUtilityReminderCron = () => {
  cron.schedule('0 8 * * *', checkAndSendReminders, {
    timezone: 'Asia/Kolkata'
  });
  console.log('[Utility Reminders] Cron job scheduled (daily 08:00 IST)');
};

module.exports = { startUtilityReminderCron, checkAndSendReminders };
