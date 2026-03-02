const Milestone   = require('../models/Milestone');
const SubActivity = require('../models/SubActivity');
const Activity    = require('../models/Activity');

// ─── Shared helper ────────────────────────────────────────────────────────────
/**
 * Recalculate and persist the progress for every milestone linked to activityId.
 *
 * Two tracking modes depending on milestone.metric:
 *  • 'occurrences'  → count how many times the activity was completed
 *  • any other unit → sum the numeric value logged each time it was completed
 *
 * Data sources:
 *  • Recurring activities → merge Activity.weeklyCompletions + SubActivity records by date
 *  • Non-recurring activities → use SubActivity records only
 *
 * When both sources have data for the same date, SubActivity takes precedence
 * (it's more specific and may have been updated more recently).
 */
const recalculateMilestoneProgress = async (activityId) => {
  try {
    const milestones = await Milestone.find({
      linkedActivityId: activityId,
      completionStatus: 'Pending',
    });
    if (!milestones.length) {
      console.log(`[Milestone] No pending milestones linked to activity ${activityId}`);
      return;
    }

    const activity = await Activity.findById(activityId).lean();
    console.log(`[Milestone] Recalculating for activity ${activityId}, isRecurring: ${activity?.isRecurring}, milestones: ${milestones.length}`);

    for (const ms of milestones) {
      const isOccurrenceMode = !ms.metric || ms.metric === 'occurrences';
      // Support legacy targetCount field
      const target = ms.targetValue ?? ms.targetCount ?? 1;

      let accumulated = 0;

      if (activity) {
        // For recurring activities, we need to check BOTH sources:
        // - weeklyCompletions (from weekly calendar view)
        // - SubActivity records (from activities page / dashboard)
        // We'll build a map by date and merge them.
        
        if (isOccurrenceMode) {
          // Occurrence counting mode
          if (activity.isRecurring) {
            // For recurring: count unique dates from both sources
            const dateSet = new Set();
            
            // Add dates from weeklyCompletions
            (activity.weeklyCompletions || [])
              .filter(c => c.completed)
              .forEach(c => dateSet.add(new Date(c.date).toISOString().split('T')[0]));
            
            // Add dates from SubActivity
            const subDocs = await SubActivity.find({
              parentActivityId: activityId,
              status: 'Completed',
            }).select('scheduledDate');
            subDocs.forEach(d => dateSet.add(new Date(d.scheduledDate).toISOString().split('T')[0]));
            
            accumulated = dateSet.size;
            console.log(`[Milestone] Occurrences from ${dateSet.size} unique dates (weekly: ${(activity.weeklyCompletions || []).filter(c => c.completed).length}, sub: ${subDocs.length})`);
          } else {
            // Non-recurring: just count SubActivity
            accumulated = await SubActivity.countDocuments({
              parentActivityId: activityId,
              status: 'Completed',
            });
            console.log(`[Milestone] SubActivity completions count: ${accumulated}`);
          }
        } else {
          // Value accumulation mode
          if (activity.isRecurring) {
            // Build a map by date, prefer SubActivity value if both exist for same date
            const valueByDate = new Map();
            
            // First add weekly completions
            (activity.weeklyCompletions || [])
              .filter(c => c.completed)
              .forEach(c => {
                const dateKey = new Date(c.date).toISOString().split('T')[0];
                valueByDate.set(dateKey, c.value || 0);
              });
            
            // Then override with SubActivity values (these are more specific/recent)
            const subDocs = await SubActivity.find({
              parentActivityId: activityId,
              status: 'Completed',
            }).select('scheduledDate completionValue');
            
            subDocs.forEach(d => {
              const dateKey = new Date(d.scheduledDate).toISOString().split('T')[0];
              const subValue = d.completionValue || 0;
              // If SubActivity has a value, use it; otherwise keep weekly value
              if (subValue > 0 || !valueByDate.has(dateKey)) {
                valueByDate.set(dateKey, subValue);
              }
            });
            
            // Sum all values
            accumulated = Array.from(valueByDate.values()).reduce((sum, val) => sum + val, 0);
            console.log(`[Milestone] Merged value sum: ${accumulated} from ${valueByDate.size} dates (weekly: ${(activity.weeklyCompletions || []).filter(c => c.completed).length}, sub: ${subDocs.length}):`, 
              Array.from(valueByDate.entries()).map(([date, val]) => ({ date, val })));
          } else {
            // Non-recurring: sum SubActivity completionValue
            const subDocs = await SubActivity.find({
              parentActivityId: activityId,
              status: 'Completed',
            }).select('completionValue');
            accumulated = subDocs.reduce((s, d) => s + (d.completionValue || 0), 0);
            console.log(`[Milestone] SubActivity value sum: ${accumulated} from ${subDocs.length} docs:`, 
              subDocs.map(d => ({ id: d._id, value: d.completionValue })));
          }
        }
      } else {
        // Activity deleted — fall back to sub-activity count
        accumulated = await SubActivity.countDocuments({
          parentActivityId: activityId,
          status: 'Completed',
        });
        console.log(`[Milestone] Activity not found, fallback count: ${accumulated}`);
      }

      const rawPct   = target > 0 ? Math.round((accumulated / target) * 100) : 0;
      const progress = Math.min(rawPct, 100);

      console.log(`[Milestone] ${ms.name}: accumulated=${accumulated}, target=${target}, progress=${progress}%`);

      ms.accumulatedValue = accumulated;
      ms.completedCount   = accumulated;          // keep legacy field in sync
      ms.progress         = progress;

      if (progress >= 100 && ms.completionStatus !== 'Achieved') {
        ms.completionStatus = 'Achieved';
        ms.achievedAt       = new Date();
        console.log(`[Milestone] ${ms.name}: ACHIEVED! 🎉`);
      }

      await ms.save();
      console.log(`[Milestone] ${ms.name}: saved with accumulatedValue=${ms.accumulatedValue}`);
    }
  } catch (err) {
    console.error('recalculateMilestoneProgress error:', err.message);
  }
};

// @desc    Create new milestone
// @route   POST /api/milestones
// @access  Private
const createMilestone = async (req, res) => {
  try {
    // Strip auto-managed fields
    const { progress: _p, completedCount: _cc, accumulatedValue: _av, ...rest } = req.body;

    // Validate: if linkedActivityId is provided, targetValue (or targetCount) is required
    const hasTarget = rest.targetValue != null || rest.targetCount != null;
    if (rest.linkedActivityId && !hasTarget) {
      return res.status(400).json({
        success: false,
        message: 'targetValue is required when linking an activity',
      });
    }

    // Normalise: always populate targetValue from targetCount for legacy callers
    if (rest.targetCount && !rest.targetValue) rest.targetValue = rest.targetCount;

    const milestone = await Milestone.create({
      ...rest,
      userId:   req.body.userId || req.user._id,
      progress: 0,
    });

    // If an activity was linked, immediately sync current progress
    if (milestone.linkedActivityId) {
      await recalculateMilestoneProgress(milestone.linkedActivityId);
      const updated = await Milestone.findById(milestone._id)
        .populate('linkedActivityId', 'name category metric isRecurring');
      return res.status(201).json({ success: true, data: updated });
    }

    res.status(201).json({ success: true, data: milestone });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all milestones
// @route   GET /api/milestones
// @access  Private
const getMilestones = async (req, res) => {
  try {
    const { status, category } = req.query;
    
    let query = {};
    // only fetch the current user's milestones
    query.userId = req.user._id;

    // Filter by completion status
    if (status) {
      query.completionStatus = status;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    const milestones = await Milestone.find(query)
      .populate('userId', 'name email')
      .populate('linkedActivityId', 'name category metric isRecurring')
      .sort({ deadline: 1 });

    res.json({
      success: true,
      count: milestones.length,
      data: milestones
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get single milestone
// @route   GET /api/milestones/:id
// @access  Private
const getMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('linkedActivityId', 'name category metric isRecurring');

    if (!milestone) {
      return res.status(404).json({ 
        success: false, 
        message: 'Milestone not found' 
      });
    }

    // Check authorization
    if (milestone.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this milestone' 
      });
    }

    res.json({
      success: true,
      data: milestone
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private
const updateMilestone = async (req, res) => {
  try {
    let milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ 
        success: false, 
        message: 'Milestone not found' 
      });
    }

    // Check authorization
    if (milestone.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this milestone' 
      });
    }

    // Strip auto-managed fields
    const { progress: _p, completedCount: _cc, ...updates } = req.body;

    // Only allow manual progress for non-linked milestones
    if (!milestone.linkedActivityId && req.body.progress !== undefined) {
      updates.progress = req.body.progress;
    }

    // Manual "Mark Achieved" only for non-linked milestones
    if (
      updates.completionStatus === 'Achieved' &&
      milestone.completionStatus !== 'Achieved' &&
      !milestone.linkedActivityId
    ) {
      updates.achievedAt = new Date();
      updates.progress   = 100;
    }

    milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('linkedActivityId', 'name category metric isRecurring');

    res.json({
      success: true,
      data: milestone
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Delete milestone
// @route   DELETE /api/milestones/:id
// @access  Private
const deleteMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ 
        success: false, 
        message: 'Milestone not found' 
      });
    }

    // Check authorization
    if (milestone.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this milestone' 
      });
    }

    await milestone.deleteOne();

    res.json({
      success: true,
      message: 'Milestone deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  createMilestone,
  getMilestones,
  getMilestone,
  updateMilestone,
  deleteMilestone,
  recalculateMilestoneProgress,   // exported for use in subActivityController
};
