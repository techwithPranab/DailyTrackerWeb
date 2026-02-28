const SubActivity = require('../models/SubActivity');

/**
 * Sync sub-activities for a given Activity document.
 *
 * Strategy (non-destructive):
 *  1. Build a Set of expected dates from activity.scheduledDates (normalised to midnight UTC).
 *  2. bulkWrite with upsert:true → inserts new dates, leaves existing records untouched
 *     (existing status/notes are preserved because $setOnInsert only runs on INSERT).
 *  3. Delete any sub-activities whose scheduledDate is no longer in the expected set
 *     (happens when a user edits the recurrence window and dates are removed).
 */
const syncSubActivities = async (activity) => {
  if (!activity || !Array.isArray(activity.scheduledDates) || activity.scheduledDates.length === 0) {
    // No scheduled dates → remove all sub-activities for this parent
    await SubActivity.deleteMany({ parentActivityId: activity._id });
    return;
  }

  const parentId  = activity._id;
  const userId    = activity.userId;

  // Normalise every date to midnight UTC
  const normDate = (d) => {
    const dt = new Date(d);
    dt.setUTCHours(0, 0, 0, 0);
    return dt;
  };

  const expectedDates = activity.scheduledDates.map(normDate);

  // ── 1. Upsert: insert new sub-activities, preserve existing ones ──────────
  const ops = expectedDates.map((date) => ({
    updateOne: {
      filter: { parentActivityId: parentId, scheduledDate: date },
      update: {
        $setOnInsert: {
          parentActivityId: parentId,
          userId,
          scheduledDate: date,
          status: 'Not Started',
          notes: '',
          completedAt: null
        }
      },
      upsert: true
    }
  }));

  if (ops.length > 0) {
    await SubActivity.bulkWrite(ops, { ordered: false });
  }

  // ── 2. Delete stale sub-activities (dates no longer in schedule) ──────────
  await SubActivity.deleteMany({
    parentActivityId: parentId,
    scheduledDate: { $nin: expectedDates }
  });
};

module.exports = syncSubActivities;
