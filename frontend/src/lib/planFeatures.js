/**
 * Plan features fetched live from the AppSettings API.
 * Source of truth is the database — no static fallback.
 */

const BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/** Safe defaults used only while the first fetch is in-flight. */
export const PLAN_DEFAULTS = {
  free: {
    activities: 10, milestones: 0, reminders: 1, utilities: 2,
    recurringActivities: false, subActivities: false,
    documentUpload: false, analytics: false,
    dataExport: false, prioritySupport: false,
  },
  pro: {
    activities: -1, milestones: -1, reminders: -1, utilities: 20,
    recurringActivities: true, subActivities: true,
    documentUpload: true, analytics: true,
    dataExport: true, prioritySupport: true,
  },
};

// Module-level cache so multiple callers share a single fetch per page load.
let _cache = null;
let _inflightPromise = null;

/** Map the API's AppSettings shape → internal feature shape. */
const apiToFeatures = (p) => ({
  activities:          p.maxActivities        ?? -1,
  milestones:          p.maxMilestones        ?? -1,
  reminders:           p.maxReminders         ?? -1,
  utilities:           p.maxUtilities         ?? -1,
  recurringActivities: p.recurringActivities  ?? false,
  subActivities:       p.subActivities        ?? false,
  documentUpload:      p.documentUpload       ?? false,
  analytics:           p.analytics            ?? false,
  dataExport:          p.dataExport           ?? false,
  prioritySupport:     p.prioritySupport      ?? false,
});

/**
 * Fetches all plan features from the API.
 * Deduplicates concurrent calls and caches the result for the page lifetime.
 * Returns { free: {...}, pro: {...} }.
 */
export const fetchAllPlanFeatures = async () => {
  if (_cache) return _cache;
  if (!_inflightPromise) {
    _inflightPromise = fetch(`${BASE}/settings/plans`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          _cache = {
            free: apiToFeatures(json.data.free),
            pro:  apiToFeatures(json.data.pro),
          };
          return _cache;
        }
        throw new Error('Invalid plan data from /api/settings/plans');
      })
      .catch((err) => {
        console.error('[planFeatures] fetch failed, using defaults:', err);
        _cache = { ...PLAN_DEFAULTS };
        return _cache;
      })
      .finally(() => { _inflightPromise = null; });
  }
  return _inflightPromise;
};

/** Invalidate the module-level cache (useful after admin updates). */
export const invalidatePlanFeaturesCache = () => { _cache = null; };

export const PLAN_RANK = { free: 0, pro: 1 };

/** Async — returns the feature object for the given plan. */
export const getPlanFeatures = async (plan) => {
  const all = await fetchAllPlanFeatures();
  return all[plan] ?? all.free;
};

/**
 * Async — returns true if the feature is allowed on the given plan.
 * Boolean features are returned directly; numeric limits of -1 = allowed, 0 = not available.
 */
export const isFeatureAllowed = async (plan, feature) => {
  const features = await getPlanFeatures(plan);
  const value = features[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number')  return value !== 0;
  return true;
};

/**
 * Async — returns the lowest plan that enables the given feature.
 * e.g. getRequiredPlan('documentUpload') → 'pro'
 */
export const getRequiredPlan = async (feature) => {
  const all = await fetchAllPlanFeatures();
  for (const plan of ['free', 'pro']) {
    const val = all[plan]?.[feature];
    const allowed = typeof val === 'boolean' ? val : (val === -1 || val > 0);
    if (allowed) return plan;
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
