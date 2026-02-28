const Activity = require('../models/Activity');

const PLAN_LIMITS = {
  free:       { activities: 10 },
  pro:        { activities: -1 },
  enterprise: { activities: -1 }
};

/**
 * Middleware to enforce plan-based limits before creating a resource.
 * Usage: router.post('/', protect, checkPlanLimit('activity'), createActivity)
 */
const checkPlanLimit = (resource) => async (req, res, next) => {
  try {
    const plan   = req.user?.subscription?.plan ?? 'free';
    const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

    if (resource === 'activity') {
      const limit = limits.activities;
      if (limit === -1) return next();   // unlimited

      const count = await Activity.countDocuments({ user: req.user._id });
      if (count >= limit) {
        return res.status(403).json({
          success: false,
          message:  `Your Free plan allows up to ${limit} activities. Upgrade to Pro for unlimited activities.`,
          code:     'PLAN_LIMIT_REACHED',
          limit,
          current:  count
        });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { checkPlanLimit };
