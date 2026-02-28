/**
 * planFeatures.js — Single source of truth for subscription plan limits and feature flags.
 * Used by middleware (planLimit.js) and the /subscriptions/features endpoint.
 * Keep in sync with frontend/src/lib/planFeatures.js
 */

const PLAN_FEATURES = {
  free: {
    // Hard counts (-1 = unlimited)
    activities:   10,
    milestones:   0,       // not available on Free
    reminders:    1,       // per activity
    utilities:    2,

    // Boolean feature flags
    recurringActivities: false,
    subActivities:       false,
    documentUpload:      false,
    analytics:           false,
    dataExport:          false,
    teamWorkspace:       false,
    prioritySupport:     false,
  },

  pro: {
    activities:   -1,
    milestones:   -1,
    reminders:    -1,
    utilities:    20,

    recurringActivities: true,
    subActivities:       true,
    documentUpload:      true,
    analytics:           true,
    dataExport:          true,
    teamWorkspace:       false,
    prioritySupport:     true,
  },

  enterprise: {
    activities:   -1,
    milestones:   -1,
    reminders:    -1,
    utilities:    -1,

    recurringActivities: true,
    subActivities:       true,
    documentUpload:      true,
    analytics:           true,
    dataExport:          true,
    teamWorkspace:       true,
    prioritySupport:     true,
  },
};

/** Numeric rank for plan comparison */
const PLAN_RANK = { free: 0, pro: 1, enterprise: 2 };

/**
 * Returns the feature set for the given plan (defaults to free).
 * @param {string} plan
 * @returns {object}
 */
const getPlanFeatures = (plan) => PLAN_FEATURES[plan] ?? PLAN_FEATURES.free;

/**
 * Returns true if the plan allows a given boolean feature.
 * @param {string} plan
 * @param {string} feature  — key from PLAN_FEATURES (e.g. 'recurringActivities')
 * @returns {boolean}
 */
const isFeatureAllowed = (plan, feature) => {
  const features = getPlanFeatures(plan);
  const val = features[feature];
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number')  return val === -1 || val > 0;
  return false;
};

/**
 * Returns the minimum plan name required for a given feature.
 * @param {string} feature
 * @returns {'free'|'pro'|'enterprise'}
 */
const getRequiredPlan = (feature) => {
  for (const plan of ['free', 'pro', 'enterprise']) {
    const val = PLAN_FEATURES[plan][feature];
    const allowed = typeof val === 'boolean' ? val : (val === -1 || val > 0);
    if (allowed) return plan;
  }
  return 'enterprise';
};

module.exports = { PLAN_FEATURES, PLAN_RANK, getPlanFeatures, isFeatureAllowed, getRequiredPlan };
