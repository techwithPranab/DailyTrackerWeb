/**
 * planFeatures.js — Single source of truth for subscription plan limits and feature flags.
 *
 * At runtime, getPlanFeaturesFromDB() fetches live values from the AppSettings document
 * (set by admins via /admin/plan-features).  Static PLAN_FEATURES below act as the
 * hard-coded fallback when the DB record doesn't exist yet.
 *
 * Only FREE and PRO plans are supported (no enterprise).
 */

const AppSettings = require('../models/AppSettings');

// ── Static fallback (also used by the frontend mirror) ───────────────────────
const PLAN_FEATURES = {
  free: {
    activities:          10,
    milestones:          0,    // 0 = not available on Free
    reminders:           1,    // per activity
    utilities:           2,
    recurringActivities: false,
    subActivities:       false,
    documentUpload:      false,
    analytics:           false,
    dataExport:          false,
    prioritySupport:     false,
  },
  pro: {
    activities:          -1,
    milestones:          -1,
    reminders:           -1,
    utilities:           20,
    recurringActivities: true,
    subActivities:       true,
    documentUpload:      true,
    analytics:           true,
    dataExport:          true,
    prioritySupport:     true,
  },
};

const PLAN_RANK = { free: 0, pro: 1 };

// ── Map DB plan doc → feature shape ──────────────────────────────────────────
const dbPlanToFeatures = (dbPlan) => ({
  activities:          dbPlan.maxActivities  ?? -1,
  milestones:          dbPlan.maxMilestones  ?? -1,
  reminders:           dbPlan.maxReminders   ?? -1,
  utilities:           dbPlan.maxUtilities   ?? -1,
  recurringActivities: dbPlan.recurringActivities ?? true,
  subActivities:       dbPlan.subActivities       ?? true,
  documentUpload:      dbPlan.documentUpload       ?? true,
  analytics:           dbPlan.analytics            ?? true,
  dataExport:          dbPlan.dataExport           ?? true,
  prioritySupport:     dbPlan.prioritySupport      ?? false,
});

// ── Live DB lookup (used by middleware) ───────────────────────────────────────
/**
 * Returns the feature object for the given plan, loaded from the DB.
 * Falls back to static PLAN_FEATURES if the DB document is missing.
 * @param {string} plan  'free' | 'pro'
 * @returns {Promise<object>}
 */
const getPlanFeaturesFromDB = async (plan) => {
  try {
    const settings = await AppSettings.findById('global').lean();
    const key      = plan === 'pro' ? 'pro' : 'free';
    if (settings?.plans?.[key]) {
      return dbPlanToFeatures(settings.plans[key]);
    }
  } catch (_) {
    // DB unavailable — fall through to static defaults
  }
  return PLAN_FEATURES[plan] ?? PLAN_FEATURES.free;
};

// ── Synchronous helpers (use static fallback — for non-middleware code) ───────

/** Returns static feature config for the given plan. */
const getPlanFeatures = (plan) => PLAN_FEATURES[plan] ?? PLAN_FEATURES.free;

/** Returns true if the plan allows a given boolean feature (static). */
const isFeatureAllowed = (plan, feature) => {
  const features = getPlanFeatures(plan);
  const val = features[feature];
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number')  return val === -1 || val > 0;
  return false;
};

/**
 * Returns the minimum plan required for a feature (static, free/pro only).
 * @param {string} feature
 * @returns {'free'|'pro'}
 */
const getRequiredPlan = (feature) => {
  for (const plan of ['free', 'pro']) {
    const val = PLAN_FEATURES[plan][feature];
    const allowed = typeof val === 'boolean' ? val : (val === -1 || val > 0);
    if (allowed) return plan;
  }
  return 'pro';
};

module.exports = {
  PLAN_FEATURES,
  PLAN_RANK,
  getPlanFeatures,
  getPlanFeaturesFromDB,
  isFeatureAllowed,
  getRequiredPlan,
};
