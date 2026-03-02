const Activity = require('../models/Activity');
const { recalculateMilestoneProgress } = require('./milestoneController');
const { startOfWeek, endOfWeek, addDays, startOfDay, endOfDay, isSameDay } = require('date-fns');

// @desc    Get weekly activity schedule
// @route   GET /api/activities/weekly
// @access  Private
const getWeeklyActivities = async (req, res) => {
  try {
    const { weekStart } = req.query;
    const startDate = weekStart ? new Date(weekStart) : startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    const endDate = endOfWeek(startDate, { weekStartsOn: 1 });

    let query = {};

    // Only fetch activities for the logged in user
    query.userId = req.user._id;

    // Get recurring activities and one-time activities for this week
    const activities = await Activity.find({
      ...query,
      $or: [
        // One-time activities in this week
        { 
          isRecurring: false,
          startTime: { $gte: startDate, $lte: endDate }
        },
        // Recurring activities that are active
        {
          isRecurring: true,
          startTime: { $lte: endDate },
          $or: [
            { recurrenceEndDate: { $gte: startDate } },
            { recurrenceEndDate: null }
          ]
        }
      ]
    })
    .populate('userId', 'name email')
    .populate('assignedBy', 'name email')
    .sort({ startTime: 1 });

    // Build weekly schedule
    const weeklySchedule = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDay = addDays(startDate, i);
      const dayOfWeek = currentDay.getDay();
      
      const dayActivities = activities.filter(activity => {
        if (!activity.isRecurring) {
          // One-time activity
          return isSameDay(new Date(activity.startTime), currentDay);
        } else {
          // Recurring activity
          const activityStartDate = new Date(activity.startTime);
          
          // Check if activity has started
          if (currentDay < activityStartDate) return false;
          
          // Check if activity has ended
          if (activity.recurrenceEndDate && currentDay > new Date(activity.recurrenceEndDate)) {
            return false;
          }
          
          // Check recurrence pattern
          if (activity.recurrencePattern === 'daily') {
            return true;
          } else if (activity.recurrencePattern === 'weekly') {
            return activity.recurrenceDays.includes(dayOfWeek);
          } else if (activity.recurrencePattern === 'monthly') {
            return currentDay.getDate() === activityStartDate.getDate();
          }
        }
        return false;
      }).map(activity => {
        // Check if this day is completed
        const completion = activity.weeklyCompletions.find(c => 
          isSameDay(new Date(c.date), currentDay)
        );
        
        return {
          ...activity.toObject(),
          completionStatus: {
            completed: completion?.completed || false,
            completedAt: completion?.completedAt || null
          }
        };
      });

      weeklySchedule.push({
        date: currentDay,
        dayName: currentDay.toLocaleDateString('en-US', { weekday: 'long' }),
        activities: dayActivities
      });
    }

    res.json({
      success: true,
      data: {
        weekStart: startDate,
        weekEnd: endDate,
        schedule: weeklySchedule
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Mark activity as completed for a specific date
// @route   POST /api/activities/:id/complete
// @access  Private
const markActivityComplete = async (req, res) => {
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
        message: 'Not authorized to update this activity'
      });
    }

    const { date, value } = req.body;
    const completionDate = date ? new Date(date) : new Date();
    const normalizedDate = startOfDay(completionDate);
    const numericValue = value !== undefined ? Number(value) || 0 : 0;

    if (activity.isRecurring) {
      // For recurring activities, update weekly completions
      const existingCompletion = activity.weeklyCompletions.find(c => 
        isSameDay(new Date(c.date), normalizedDate)
      );

      if (existingCompletion) {
        existingCompletion.completed = true;
        existingCompletion.completedAt = new Date();
        existingCompletion.value = numericValue;
      } else {
        activity.weeklyCompletions.push({
          date: normalizedDate,
          completed: true,
          completedAt: new Date(),
          value: numericValue
        });
      }
    } else {
      // For one-time activities
      activity.status = 'Completed';
      activity.completedAt = new Date();
    }

    await activity.save();

    // Auto-update any milestones linked to this activity
    await recalculateMilestoneProgress(activity._id);

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

// @desc    Unmark activity completion for a specific date
// @route   POST /api/activities/:id/uncomplete
// @access  Private
const unmarkActivityComplete = async (req, res) => {
  try {
    const { date } = req.body;
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
        message: 'Not authorized to update this activity'
      });
    }

    const completionDate = date ? new Date(date) : new Date();
    const normalizedDate = startOfDay(completionDate);

    if (activity.isRecurring) {
      // For recurring activities, update weekly completions
      const existingCompletion = activity.weeklyCompletions.find(c => 
        isSameDay(new Date(c.date), normalizedDate)
      );

      if (existingCompletion) {
        existingCompletion.completed = false;
        existingCompletion.completedAt = null;
      }
    } else {
      // For one-time activities
      activity.status = 'In Progress';
      activity.completedAt = null;
    }

    await activity.save();

    // Auto-update any milestones linked to this activity
    await recalculateMilestoneProgress(activity._id);

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

module.exports = {
  getWeeklyActivities,
  markActivityComplete,
  unmarkActivityComplete
};
