const Activity = require('../models/Activity');
const Milestone = require('../models/Milestone');
const SubActivity = require('../models/SubActivity');

/**
 * Get activity analytics for the logged-in user
 * @route GET /api/activities/analytics
 */
const getActivityAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all activities for the user
    const activities = await Activity.find({ userId });

    if (activities.length === 0) {
      return res.json({
        success: true,
        data: {
          total: 0,
          completed: 0,
          inProgress: 0,
          notStarted: 0,
          completionRate: 0,
          averageCompletionTime: 0,
          byCategory: [],
          trend: [],
          weeklyStats: [],
          activityWeeklyData: []
        }
      });
    }

    // Calculate overall stats
    const completed = activities.filter(a => a.status === 'Completed').length;
    const inProgress = activities.filter(a => a.status === 'In Progress').length;
    const notStarted = activities.filter(a => a.status === 'Not Started').length;
    const total = activities.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Calculate average completion time
    let totalCompletionTime = 0;
    let completedCount = 0;
    activities.forEach(activity => {
      if (activity.status === 'Completed' && activity.completedAt) {
        const timeInMs = new Date(activity.completedAt) - new Date(activity.createdAt);
        totalCompletionTime += timeInMs;
        completedCount++;
      }
    });
    const averageCompletionTime = completedCount > 0 ? Math.round(totalCompletionTime / completedCount / (1000 * 60 * 60 * 24)) : 0; // in days

    // Group by category with detailed performance
    const categoryMap = {};
    const categoryStats = {};
    activities.forEach(activity => {
      const category = activity.category || 'Other';
      
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
        categoryStats[category] = { total: 0, completed: 0, inProgress: 0, notStarted: 0 };
      }
      
      categoryMap[category]++;
      categoryStats[category].total++;
      
      if (activity.status === 'Completed') {
        categoryStats[category].completed++;
      } else if (activity.status === 'In Progress') {
        categoryStats[category].inProgress++;
      } else {
        categoryStats[category].notStarted++;
      }
    });

    const byCategory = Object.entries(categoryMap).map(([name, value]) => ({
      name: name,
      value: value
    }));

    const categoryPerformance = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      total: stats.total,
      completed: stats.completed,
      completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      inProgress: stats.inProgress,
      notStarted: stats.notStarted
    }));

    // Find top and least completed categories
    let topCategory = null;
    let leastCompletedCategory = null;
    if (categoryPerformance.length > 0) {
      topCategory = categoryPerformance.reduce((prev, curr) => 
        curr.completionRate > prev.completionRate ? curr : prev
      );
      leastCompletedCategory = categoryPerformance.reduce((prev, curr) => 
        curr.completionRate < prev.completionRate ? curr : prev
      );
    }

    // Calculate trend for last 30 days using SubActivity data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const subActivities = await SubActivity.find({
      userId,
      scheduledDate: { $gte: thirtyDaysAgo }
    });

    const trendMap = {};
    subActivities.forEach(sub => {
      const dateStr = new Date(sub.scheduledDate).toISOString().split('T')[0];
      if (!trendMap[dateStr]) {
        trendMap[dateStr] = { created: 0, completed: 0 };
      }
      trendMap[dateStr].created += 1;
      if (sub.status === 'Completed') {
        trendMap[dateStr].completed += 1;
      }
    });

    const trend = Object.entries(trendMap)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, data]) => ({
        date: date.split('-').slice(1).join('-'), // Format as MM-DD
        ...data
      }));

    // Calculate weekly stats using SubActivity data (last 7 days)
    const weeklyMap = {};
    const activityBreakdown = {}; // Track per-activity data
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const weekStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      weeklyMap[weekStr] = { day: dayName, date: weekStr, created: 0, completed: 0 };
    }

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    const weekSubActivities = await SubActivity.find({
      userId,
      scheduledDate: { $gte: sevenDaysAgo, $lte: todayEnd }
    }).populate('parentActivityId', 'name metric');

    weekSubActivities.forEach(sub => {
      const schedDate = new Date(sub.scheduledDate);
      const dateStr = schedDate.toISOString().split('T')[0];
      
      if (weeklyMap[dateStr]) {
        weeklyMap[dateStr].created++;
        if (sub.status === 'Completed') {
          weeklyMap[dateStr].completed++;
        }
      }

      // Track per-activity breakdown
      if (sub.parentActivityId) {
        const activityId = sub.parentActivityId._id.toString();
        const activityName = sub.parentActivityId.name;
        const activityMetric = sub.parentActivityId.metric || 'value';

        if (!activityBreakdown[activityId]) {
          activityBreakdown[activityId] = {
            id: activityId,
            name: activityName,
            metric: activityMetric,
            weeklyData: {}
          };
          // Initialize all days for this activity
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const weekStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            activityBreakdown[activityId].weeklyData[weekStr] = { day: dayName, date: weekStr, value: 0, count: 0 };
          }
        }

        if (sub.status === 'Completed' && activityBreakdown[activityId].weeklyData[dateStr]) {
          activityBreakdown[activityId].weeklyData[dateStr].value += sub.completionValue || 0;
          activityBreakdown[activityId].weeklyData[dateStr].count += 1;
        }
      }
    });

    const weeklyStats = Object.values(weeklyMap);
    
    // Convert activityBreakdown to array format
    const activityWeeklyData = Object.values(activityBreakdown).map(activity => ({
      id: activity.id,
      name: activity.name,
      metric: activity.metric,
      data: Object.values(activity.weeklyData)
    }));

    res.json({
      success: true,
      data: {
        total,
        completed,
        inProgress,
        notStarted,
        completionRate,
        averageCompletionTime,
        byCategory,
        trend,
        weeklyStats,
        activityWeeklyData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get milestone analytics for the logged-in user
 * @route GET /api/milestones/analytics
 */
const getMilestoneAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all milestones for the user
    const milestones = await Milestone.find({ userId });

    if (milestones.length === 0) {
      return res.json({
        success: true,
        data: {
          total: 0,
          completed: 0,
          active: 0,
          abandoned: 0,
          completionRate: 0,
          averageCompletionTime: 0,
          overallProgress: 0,
          progress: [],
          mostActiveMilestone: null,
          fastestCompletedMilestone: null
        }
      });
    }

    // Calculate overall stats
    const completed = milestones.filter(m => m.status === 'Completed').length;
    const active = milestones.filter(m => m.status === 'Active').length;
    const abandoned = milestones.filter(m => m.status === 'Abandoned').length;
    const total = milestones.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Calculate average completion time
    let totalCompletionTime = 0;
    let completedCount = 0;
    let fastestTime = Infinity;
    let fastestMilestone = null;

    milestones.forEach(milestone => {
      if (milestone.status === 'Completed' && milestone.completedAt) {
        const timeInMs = new Date(milestone.completedAt) - new Date(milestone.createdAt);
        totalCompletionTime += timeInMs;
        completedCount++;

        if (timeInMs < fastestTime) {
          fastestTime = timeInMs;
          fastestMilestone = milestone;
        }
      }
    });

    const averageCompletionTime = completedCount > 0 ? Math.round(totalCompletionTime / completedCount / (1000 * 60 * 60 * 24)) : 0; // in days
    const fastestCompletedMilestone = fastestMilestone ? {
      _id: fastestMilestone._id,
      title: fastestMilestone.title,
      daysToComplete: Math.round((new Date(fastestMilestone.completedAt) - new Date(fastestMilestone.createdAt)) / (1000 * 60 * 60 * 24))
    } : null;

    // Calculate progress for each milestone and find most active
    let overallProgress = 0;
    let mostActiveMilestone = null;
    let maxProgress = -1;

    const progress = milestones.map(milestone => {
      let progressPercent = 0;

      if (milestone.status === 'Completed') {
        progressPercent = 100;
      } else if (milestone.targetValue > 0) {
        progressPercent = (milestone.currentValue / milestone.targetValue) * 100;
        progressPercent = Math.min(progressPercent, 99);
      }

      if (progressPercent > maxProgress) {
        maxProgress = progressPercent;
        mostActiveMilestone = {
          _id: milestone._id,
          title: milestone.title,
          progress: progressPercent,
          status: milestone.status,
          currentValue: milestone.currentValue,
          targetValue: milestone.targetValue
        };
      }

      return {
        _id: milestone._id,
        title: milestone.title,
        progress: progressPercent,
        status: milestone.status,
        currentValue: milestone.currentValue,
        targetValue: milestone.targetValue,
        createdAt: milestone.createdAt,
        completedAt: milestone.completedAt
      };
    });

    // Calculate overall progress (average of all milestones)
    overallProgress = progress.length > 0 
      ? Math.round(progress.reduce((sum, m) => sum + m.progress, 0) / progress.length) 
      : 0;

    res.json({
      success: true,
      data: {
        total,
        completed,
        active,
        abandoned,
        completionRate,
        averageCompletionTime,
        overallProgress,
        progress,
        mostActiveMilestone,
        fastestCompletedMilestone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getActivityAnalytics,
  getMilestoneAnalytics
};
