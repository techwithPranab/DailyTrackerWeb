const Activity = require('../models/Activity');
const SubActivity = require('../models/SubActivity');
const syncSubActivities = require('../utils/syncSubActivities');

// ─── Helper: generate all scheduled dates for an activity ────────────────────
const generateScheduledDates = (data) => {
  const {
    startDate,
    isRecurring,
    recurrencePattern,
    recurrenceDays,       // [0-6] for weekly
    recurrenceMonthDay,   // 1-31 for monthly
    recurrenceEndDate
  } = data;

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  if (!isRecurring) {
    // Non-recurring: just the start date
    return [start];
  }

  // Cap at 2 years or recurrenceEndDate to avoid infinite loops
  const twoYearsOut = new Date(start);
  twoYearsOut.setFullYear(twoYearsOut.getFullYear() + 2);
  const end = recurrenceEndDate
    ? new Date(Math.min(new Date(recurrenceEndDate).getTime(), twoYearsOut.getTime()))
    : twoYearsOut;
  end.setHours(23, 59, 59, 999);

  const dates = [];
  const current = new Date(start);

  while (current <= end) {
    let include = false;

    if (recurrencePattern === 'daily') {
      include = true;
    } else if (recurrencePattern === 'weekly') {
      include = Array.isArray(recurrenceDays) && recurrenceDays.includes(current.getDay());
    } else if (recurrencePattern === 'monthly') {
      // Use recurrenceMonthDay if provided, else fall back to start date's day
      const targetDay = recurrenceMonthDay || start.getDate();
      include = current.getDate() === targetDay;
    }

    if (include) {
      dates.push(new Date(current));
    }

    current.setDate(current.getDate() + 1);
  }

  return dates;
};

// @desc    Create new activity
// @route   POST /api/activities
// @access  Private
const createActivity = async (req, res) => {
  try {
    const scheduledDates = generateScheduledDates(req.body);

    const activity = await Activity.create({
      ...req.body,
      userId: req.body.userId || req.user._id,
      scheduledDates
    });

    // Generate a sub-activity for every scheduled date
    await syncSubActivities(activity);

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all activities
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
  try {
    const { status, priority, category, startDate, endDate } = req.query;

    const query = { userId: req.user._id };

    if (status)   query.status   = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end   = endDate   ? new Date(endDate)   : null;
      if (start) start.setHours(0, 0, 0, 0);
      if (end)   end.setHours(23, 59, 59, 999);

      // Any activity whose scheduledDates array contains at least one date in [start, end]
      query.scheduledDates = {
        ...(start ? { $elemMatch: { $gte: start, ...(end ? { $lte: end } : {}) } } :
            end   ? { $elemMatch: { $lte: end } } : {})
      };
    }

    const activities = await Activity.find(query)
      .populate('userId', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ startDate: -1 });

    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single activity
// @route   GET /api/activities/:id
// @access  Private
const getActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('assignedBy', 'name email');

    if (!activity) {
      return res.status(404).json({ 
        success: false, 
        message: 'Activity not found' 
      });
    }

    // Check authorization
    if (activity.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this activity' 
      });
    }

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private
const updateActivity = async (req, res) => {
  try {
    let activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check authorization
    if (activity.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this activity'
      });
    }

    // If marking as completed, set completedAt
    if (req.body.status === 'Completed' && activity.status !== 'Completed') {
      req.body.completedAt = new Date();
    }

    // Regenerate scheduledDates if any recurrence-related field changed
    const recurrenceFields = ['startDate', 'isRecurring', 'recurrencePattern', 'recurrenceDays', 'recurrenceMonthDay', 'recurrenceEndDate'];
    const needsRegeneration = recurrenceFields.some(f => req.body[f] !== undefined);
    if (needsRegeneration) {
      // Merge existing data with incoming changes to get a full picture
      const merged = {
        startDate:            req.body.startDate            ?? activity.startDate,
        isRecurring:          req.body.isRecurring          ?? activity.isRecurring,
        recurrencePattern:    req.body.recurrencePattern    ?? activity.recurrencePattern,
        recurrenceDays:       req.body.recurrenceDays       ?? activity.recurrenceDays,
        recurrenceMonthDay:   req.body.recurrenceMonthDay   ?? activity.recurrenceMonthDay,
        recurrenceEndDate:    req.body.recurrenceEndDate    ?? activity.recurrenceEndDate,
      };
      req.body.scheduledDates = generateScheduledDates(merged);
    }

    activity = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Re-sync sub-activities to match updated scheduled dates
    await syncSubActivities(activity);

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ 
        success: false, 
        message: 'Activity not found' 
      });
    }

    // Check authorization
    if (activity.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this activity' 
      });
    }

    await activity.deleteOne();

    // Cascade-delete all sub-activities belonging to this parent
    await SubActivity.deleteMany({ parentActivityId: activity._id });

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get today's activities
// @route   GET /api/activities/today
// @access  Private
const getTodayActivities = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Find activities that have today in their scheduledDates array
    const activities = await Activity.find({
      userId: req.user._id,
      scheduledDates: { $elemMatch: { $gte: todayStart, $lte: todayEnd } }
    }).sort({ startDate: 1 });

    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  getTodayActivities
};
