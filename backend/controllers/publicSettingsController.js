/**
 * Public settings controller
 * Exposes read-only, non-sensitive app settings to unauthenticated clients.
 * (e.g. pricing page fetching live plan details)
 */

const AppSettings = require('../models/AppSettings');

// Static fallback (mirrors backend/config/planFeatures.js)
const PLAN_DEFAULTS = {
  free: {
    name:                'Free',
    price:               0,
    maxActivities:       10,
    maxMilestones:       0,
    maxReminders:        1,
    maxUtilities:        2,
    recurringActivities: false,
    subActivities:       false,
    documentUpload:      false,
    analytics:           false,
    dataExport:          false,
    prioritySupport:     false,
  },
  pro: {
    name:                'Pro',
    price:               199,
    maxActivities:       -1,
    maxMilestones:       -1,
    maxReminders:        -1,
    maxUtilities:        20,
    recurringActivities: true,
    subActivities:       true,
    documentUpload:      true,
    analytics:           true,
    dataExport:          true,
    prioritySupport:     true,
  },
};

// @desc  Get public plan details (no auth required)
// @route GET /api/settings/plans
const getPublicPlans = async (req, res) => {
  try {
    const settings = await AppSettings.findById('global').lean();
    const plans = settings?.plans ?? PLAN_DEFAULTS;

    res.json({
      success: true,
      data: {
        free: { ...PLAN_DEFAULTS.free, ...(plans.free ?? {}) },
        pro:  { ...PLAN_DEFAULTS.pro,  ...(plans.pro  ?? {}) },
      },
    });
  } catch (error) {
    // Never 500 a public route — fall back to static defaults
    res.json({ success: true, data: PLAN_DEFAULTS });
  }
};

module.exports = { getPublicPlans };
