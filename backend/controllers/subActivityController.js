const SubActivity = require('../models/SubActivity');
const Activity    = require('../models/Activity');
const { recalculateMilestoneProgress } = require('./milestoneController');

// ─── Helper: verify the parent activity belongs to the current user ───────────
const verifyParentOwnership = async (activityId, userId) => {
  const parent = await Activity.findById(activityId).select('userId');
  if (!parent) return null;
  if (parent.userId.toString() !== userId.toString()) return null;
  return parent;
};

// @desc    Get paginated past incomplete sub-activities (missed tasks)
// @route   GET /api/subactivities/missed?page=1&limit=10
// @access  Private
const getMissedSubActivities = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip  = (page - 1) * limit;

    // Everything before today's midnight UTC is "past"
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const filter = {
      userId: req.user._id,
      scheduledDate: { $lt: todayStart },
      status: { $in: ['Not Started', 'In Progress'] }
    };

    const [totalCount, missed] = await Promise.all([
      SubActivity.countDocuments(filter),
      SubActivity.find(filter)
        .populate({
          path: 'parentActivityId',
          select: 'name category priority isRecurring recurrencePattern metric'
        })
        .sort({ scheduledDate: -1 }) // most-recent first
        .skip(skip)
        .limit(limit)
    ]);

    res.json({
      success:    true,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      page,
      limit,
      count:      missed.length,
      data:       missed
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sub-activities for the current user within a date range
// @route   GET /api/subactivities?startDate=ISO&endDate=ISO
// @access  Private
const getSubActivitiesInRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
    }

    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    const subActivities = await SubActivity.find({
      userId: req.user._id,
      scheduledDate: { $gte: start, $lte: end }
    })
      .select('scheduledDate status parentActivityId completionValue completedAt notes')
      .populate({ path: 'parentActivityId', select: 'name metric' })
      .lean();

    res.json({ success: true, count: subActivities.length, data: subActivities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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

    const { status, notes, completionValue } = req.body;

    if (status !== undefined) {
      subActivity.status = status;
      if (status === 'Completed' && !subActivity.completedAt) {
        subActivity.completedAt = new Date();
      } else if (status !== 'Completed') {
        subActivity.completedAt = null;
        subActivity.completionValue = 0;
      }
    }

    // Save the numeric value logged when completing (distance, weight, time, etc.)
    if (status === 'Completed' && completionValue !== undefined) {
      subActivity.completionValue = Number(completionValue) || 0;
    }

    if (notes !== undefined) {
      subActivity.notes = notes;
    }

    await subActivity.save();

    // Auto-update any milestones linked to the parent activity
    await recalculateMilestoneProgress(subActivity.parentActivityId);

    res.json({ success: true, data: subActivity });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMissedSubActivities,
  getSubActivitiesInRange,
  getSubActivities,
  getSubActivitiesByDate,
  updateSubActivity
};
