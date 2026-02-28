'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getPlanFeatures,
  isFeatureAllowed,
  getRequiredPlan,
  PLAN_RANK,
} from '@/lib/planFeatures';

/**
 * Hook that exposes the current user's plan feature set.
 *
 * Usage:
 *   const { plan, features, isAllowed, requiresPlan, hasMinPlan, isLimitReached } = usePlanFeatures();
 *
 *   isAllowed('documentUpload')       → boolean
 *   requiresPlan('documentUpload')    → 'pro'
 *   hasMinPlan('pro')                 → boolean
 *   isLimitReached('activity', 8)     → boolean  (true when count >= limit and limit !== -1)
 *   usagePercent('activity', 8)       → 80  (percent, or null if unlimited)
 */
export default function usePlanFeatures() {
  const { user } = useAuth();
  const plan = user?.subscription?.plan ?? 'free';

  return useMemo(() => {
    const features = getPlanFeatures(plan);

    /** Check whether a boolean feature is enabled on the current plan. */
    const isAllowed = (feature) => isFeatureAllowed(plan, feature);

    /** Return the minimum plan that unlocks a feature. */
    const requiresPlan = (feature) => getRequiredPlan(feature);

    /** True if the current plan rank is >= the specified minimum plan. */
    const hasMinPlan = (minPlan) =>
      (PLAN_RANK[plan] ?? 0) >= (PLAN_RANK[minPlan] ?? 0);

    /**
     * True if the user has hit or exceeded the numeric limit for a resource.
     * Always false when limit === -1 (unlimited).
     */
    const isLimitReached = (resource, current) => {
      const limit = features[resource];
      if (limit === -1 || limit == null) return false;
      return current >= limit;
    };

    /**
     * Returns a 0-100 usage percentage for a numeric resource.
     * Returns null when the resource is unlimited (limit === -1).
     */
    const usagePercent = (resource, current) => {
      const limit = features[resource];
      if (limit === -1 || limit == null || limit === 0) return null;
      return Math.min(100, Math.round((current / limit) * 100));
    };

    return {
      plan,
      features,
      isAllowed,
      requiresPlan,
      hasMinPlan,
      isLimitReached,
      usagePercent,
    };
  }, [plan]);
}
