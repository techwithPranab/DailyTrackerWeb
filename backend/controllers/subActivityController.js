const SubActivity = require('../models/SubActivity');
const Activity    = require('../models/Activity');

// ─── Helper: verify the parent activity belongs to the current user ───────────
const verifyParentOwnership = async (activityId, userId) => {
  const parent = await Activity.findById(activityId).select('userId');
  if (!parent) return null;
  if (parent.userId.toString() !== userId.toString()) return null;
  return parent;
};

// @desc    Get all sub-activities for a parent activity (sorted by date)
// @route   GET /api/activities/:id/subactivities
// @access  Private
const getSubActivities = async (req, res) => {
  try {
    const parent = await verifyParentOwnership(req.params.id, req.user._id);
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Activity not found or not authorised' });
    }

    const subActivities = await SubActivity.find({ parentActivityId: req.params.id })
      .sort({ scheduledDate: 1 });

    // Attach summary stats
    const total     = subActivities.length;
    const completed = subActivities.filter(s => s.status === 'Completed').length;
    const inProgress = subActivities.filter(s => s.status === 'In Progress').length;

    res.json({
      success: true,
      stats: { total, completed, inProgress, notStarted: total - completed - inProgress },
      data: subActivities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all sub-activities for the current user on a specific date
// @route   GET /api/subactivities/date/:date   (date = YYYY-MM-DD)
// @access  Private
const getSubActivitiesByDate = async (req, res) => {
  try {
    const dayStart = new Date(req.params.date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const subActivities = await SubActivity.find({
      userId: req.user._id,
      scheduledDate: { $gte: dayStart, $lte: dayEnd }
    })
      .populate({
        path: 'parentActivityId',
        select: 'name category priority isRecurring recurrencePattern duration'
      })
      .sort({ 'parentActivityId.name': 1 });

    res.json({
      success: true,
      count: subActivities.length,
      data: subActivities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a single sub-activity (status, notes)
// @route   PUT /api/subactivities/:id
// @access  Private
const updateSubActivity = async (req, res) => {
  try {
    const subActivity = await SubActivity.findById(req.params.id);

    if (!subActivity) {
      return res.status(404).json({ success: false, message: 'Sub-activity not found' });
    }

    // Auth check
    if (subActivity.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }

    const { status, notes } = req.body;

    if (status !== undefined) {
      subActivity.status = status;
      if (status === 'Completed' && !subActivity.completedAt) {
        subActivity.completedAt = new Date();
      } else if (status !== 'Completed') {
        subActivity.completedAt = null;
      }
    }

    if (notes !== undefined) {
      subActivity.notes = notes;
    }

    await subActivity.save();

    res.json({ success: true, data: subActivity });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSubActivities,
  getSubActivitiesByDate,
  updateSubActivity
};
