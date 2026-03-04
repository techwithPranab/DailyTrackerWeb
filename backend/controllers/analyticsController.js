const Activity = require('../models/Activity');
const Milestone = require('../models/Milestone');

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
          categoryPerformance: [],
          trend: [],
          weeklyStats: [],
          topCategory: null,
          leastCompletedCategory: null
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

    // Calculate trend for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendMap = {};
    activities.forEach(activity => {
      // Only count activities created in the last 30 days
      if (new Date(activity.createdAt) >= thirtyDaysAgo) {
        const dateStr = new Date(activity.createdAt).toISOString().split('T')[0];
        if (!trendMap[dateStr]) {
          trendMap[dateStr] = { created: 0, completed: 0 };
        }
        trendMap[dateStr].created += 1;
        if (activity.status === 'Completed') {
          trendMap[dateStr].completed += 1;
        }
      }
    });

    const trend = Object.entries(trendMap)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, data]) => ({
        date: date.split('-').slice(1).join('-'), // Format as MM-DD
        ...data
      }));

    // Calculate weekly stats
    const weeklyMap = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const weekStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      weeklyMap[weekStr] = { day: dayName, created: 0, completed: 0 };
    }

    activities.forEach(activity => {
      const dateStr = new Date(activity.createdAt).toISOString().split('T')[0];
      if (weeklyMap[dateStr]) {
        weeklyMap[dateStr].created++;
        if (activity.status === 'Completed') {
          weeklyMap[dateStr].completed++;
        }
      }
    });

    const weeklyStats = Object.values(weeklyMap);

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
        categoryPerformance,
        trend,
        weeklyStats,
        topCategory,
        leastCompletedCategory
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
          fastestCompletedMilestone: null,
          milestoneTimeline: []
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

    // Create milestone timeline (group by creation month)
    const timelineMap = {};
    milestones.forEach(milestone => {
      const dateStr = new Date(milestone.createdAt).toISOString().split('T')[0];
      const month = dateStr.substring(0, 7); // YYYY-MM
      if (!timelineMap[month]) {
        timelineMap[month] = { created: 0, completed: 0 };
      }
      timelineMap[month].created++;
      if (milestone.status === 'Completed') {
        timelineMap[month].completed++;
      }
    });

    const milestoneTimeline = Object.entries(timelineMap)
      .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
      .map(([month, data]) => ({
        month,
        ...data
      }));

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
        fastestCompletedMilestone,
        milestoneTimeline
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
