const Activity = require('../models/Activity');
const Milestone = require('../models/Milestone');

// @desc    Get user progress statistics
// @route   GET /api/progress
// @access  Private
const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'week' } = req.query; // week, month, year

    // Calculate date range based on period
    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    // Get activities in the period
    const activities = await Activity.find({
      userId,
      createdAt: { $gte: startDate }
    });

    // Calculate activity statistics
    const totalActivities = activities.length;
    const completedActivities = activities.filter(
      a => a.status === 'Completed'
    ).length;
    const inProgressActivities = activities.filter(
      a => a.status === 'In Progress'
    ).length;
    const notStartedActivities = activities.filter(
      a => a.status === 'Not Started'
    ).length;

    const completionRate = totalActivities > 0 
      ? ((completedActivities / totalActivities) * 100).toFixed(2)
      : 0;

    // Get milestones
    const milestones = await Milestone.find({ userId });
    const totalMilestones = milestones.length;
    const achievedMilestones = milestones.filter(
      m => m.completionStatus === 'Achieved'
    ).length;
    const pendingMilestones = milestones.filter(
      m => m.completionStatus === 'Pending'
    ).length;

    const milestoneCompletionRate = totalMilestones > 0
      ? ((achievedMilestones / totalMilestones) * 100).toFixed(2)
      : 0;

    // Activity by category
    const activityByCategory = activities.reduce((acc, activity) => {
      const category = activity.category || 'Other';
      if (!acc[category]) {
        acc[category] = { total: 0, completed: 0 };
      }
      acc[category].total++;
      if (activity.status === 'Completed') {
        acc[category].completed++;
      }
      return acc;
    }, {});

    // Activity by priority
    const activityByPriority = activities.reduce((acc, activity) => {
      const priority = activity.priority || 'Medium';
      if (!acc[priority]) {
        acc[priority] = { total: 0, completed: 0 };
      }
      acc[priority].total++;
      if (activity.status === 'Completed') {
        acc[priority].completed++;
      }
      return acc;
    }, {});

    // Daily completion trend (last 7 days)
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayActivities = activities.filter(a => {
        const activityDate = new Date(a.createdAt);
        return activityDate >= date && activityDate < nextDate;
      });

      const completed = dayActivities.filter(
        a => a.status === 'Completed'
      ).length;

      dailyTrend.push({
        date: date.toISOString().split('T')[0],
        total: dayActivities.length,
        completed
      });
    }

    res.json({
      success: true,
      data: {
        period,
        activities: {
          total: totalActivities,
          completed: completedActivities,
          inProgress: inProgressActivities,
          notStarted: notStartedActivities,
          completionRate: parseFloat(completionRate)
        },
        milestones: {
          total: totalMilestones,
          achieved: achievedMilestones,
          pending: pendingMilestones,
          completionRate: parseFloat(milestoneCompletionRate)
        },
        byCategory: activityByCategory,
        byPriority: activityByPriority,
        dailyTrend
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  getProgress
};
