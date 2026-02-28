const Activity  = require('../models/Activity');
const Reminder  = require('../models/Reminder');
const { getPlanFeatures, isFeatureAllowed, getRequiredPlan } = require('../config/planFeatures');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getPlan = (req) => req.user?.subscription?.plan ?? 'free';

const limitReached = (res, resource, limit, current) =>
  res.status(403).json({
    success: false,
    code:    'PLAN_LIMIT_REACHED',
    resource,
    limit,
    current,
    message: `You have reached the ${limit}-item limit for "${resource}" on your current plan. Upgrade to unlock more.`,
  });

const featureBlocked = (res, feature, requiredPlan) =>
  res.status(403).json({
    success:      false,
    code:         'FEATURE_NOT_ALLOWED',
    feature,
    requiredPlan,
    message:      `The "${feature}" feature requires the ${requiredPlan} plan. Please upgrade to access it.`,
  });

// ─── checkPlanLimit ───────────────────────────────────────────────────────────
/**
 * Enforces numeric resource limits (activities, milestones, reminders, utilities).
 * Usage: router.post('/', protect, checkPlanLimit('activity'), createHandler)
 */
const checkPlanLimit = (resource) => async (req, res, next) => {
  try {
    const plan     = getPlan(req);
    const features = getPlanFeatures(plan);
    const userId   = req.user._id;

    switch (resource) {

      case 'activity': {
        const limit = features.activities;
        if (limit === -1) return next();
        const count = await Activity.countDocuments({ userId });
        if (count >= limit) return limitReached(res, 'activities', limit, count);
        break;
      }

      case 'milestone': {
        const limit = features.milestones;
        if (limit === -1) return next();
        if (limit === 0)  return featureBlocked(res, 'milestones', getRequiredPlan('milestones'));
        const Milestone = require('../models/Milestone');
        const count = await Milestone.countDocuments({ userId });
        if (count >= limit) return limitReached(res, 'milestones', limit, count);
        break;
      }

      case 'reminder': {
        const limit = features.reminders;
        if (limit === -1) return next();
        const { activityId } = req.body;
        if (activityId) {
          const count = await Reminder.countDocuments({ activityId, userId });
          if (count >= limit) return limitReached(res, 'reminders per activity', limit, count);
        }
        break;
      }

      case 'utility': {
        const HomeUtility = require('../models/HomeUtility');
        const limit = features.utilities;
        if (limit === -1) return next();
        const count = await HomeUtility.countDocuments({ userId });
        if (count >= limit) return limitReached(res, 'utilities', limit, count);
        break;
      }

      default:
        break;
    }

    next();
  } catch (err) {
    next(err);
  }
};

// ─── checkFeatureAccess ───────────────────────────────────────────────────────
/**
 * Enforces boolean feature flags (recurringActivities, documentUpload, analytics, etc.)
 * Usage: router.post('/', protect, checkFeatureAccess('recurringActivities'), createHandler)
 *
 * Special case — 'recurringActivities': only blocks if req.body.isRecurring === true
 */
const checkFeatureAccess = (feature) => (req, res, next) => {
  try {
    const plan = getPlan(req);

    // Only gate recurring if the user is actually requesting a recurring activity
    if (feature === 'recurringActivities' && !req.body.isRecurring) {
      return next();
    }

    const allowed = isFeatureAllowed(plan, feature);
    if (!allowed) {
      const requiredPlan = getRequiredPlan(feature);
      return featureBlocked(res, feature, requiredPlan);
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { checkPlanLimit, checkFeatureAccess };
