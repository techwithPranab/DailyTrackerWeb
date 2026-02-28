/**
 * Client-side mirror of backend/config/planFeatures.js
 * Keep in sync with backend whenever plan limits change.
 */

export const PLAN_FEATURES = {
  free: {
    activities:           10,
    milestones:           0,
    reminders:            1,   // per activity
    utilities:            2,
    recurringActivities:  false,
    subActivities:        false,
    documentUpload:       false,
    analytics:            false,
    dataExport:           false,
    prioritySupport:      false,
  },
  pro: {
    activities:           -1,  // unlimited
    milestones:           -1,
    reminders:            -1,
    utilities:            20,
    recurringActivities:  true,
    subActivities:        true,
    documentUpload:       true,
    analytics:            true,
    dataExport:           true,
    prioritySupport:      true,
  },
};

export const PLAN_RANK = { free: 0, pro: 1 };

/** Returns feature config for the given plan (defaults to free). */
export const getPlanFeatures = (plan) =>
  PLAN_FEATURES[plan] ?? PLAN_FEATURES.free;

/**
 * Returns true if the feature is allowed on the given plan.
 * Numeric features (activities, utilities …) are allowed as long as the
 * limit hasn't been reached — this helper only checks the boolean flag
 * features (recurringActivities, documentUpload, …).
 */
export const isFeatureAllowed = (plan, feature) => {
  const features = getPlanFeatures(plan);
  const value    = features[feature];
  if (typeof value === 'boolean') return value;
  // For numeric limits: -1 means unlimited (allowed), 0 means not available
  if (typeof value === 'number')  return value !== 0;
  return true;
};

/**
 * Returns the lowest plan that enables the given feature.
 * e.g. getRequiredPlan('documentUpload') → 'pro'
 */
export const getRequiredPlan = (feature) => {
  const order = ['free', 'pro'];
  for (const plan of order) {
    if (isFeatureAllowed(plan, feature)) return plan;
  }
  return 'pro';
};

/**
 * Returns a human-readable label for a plan limit.
 * e.g. formatLimit(-1) → 'Unlimited', formatLimit(10) → '10'
 */
export const formatLimit = (limit) => {
  if (limit === -1) return 'Unlimited';
  if (limit === 0)  return 'Not available';
  return String(limit);
};
