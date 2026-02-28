'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAllPlanFeatures,
  PLAN_RANK,
  PLAN_DEFAULTS,
} from '@/lib/planFeatures';

/**
 * Hook that exposes the current user's plan feature set, fetched live from the API.
 *
 * Usage:
 *   const { plan, features, isAllowed, requiresPlan, hasMinPlan, isLimitReached, loading } = usePlanFeatures();
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

  const [allFeatures, setAllFeatures] = useState(PLAN_DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAllPlanFeatures().then((data) => {
      if (!cancelled) {
        setAllFeatures(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const features = allFeatures[plan] ?? allFeatures.free;

  /** Check whether a boolean feature is enabled on the current plan. */
  const isAllowed = useCallback((feature) => {
    const value = features[feature];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number')  return value !== 0;
    return true;
  }, [features]);

  /** Return the minimum plan that unlocks a feature. */
  const requiresPlan = useCallback((feature) => {
    for (const p of ['free', 'pro']) {
      const val = allFeatures[p]?.[feature];
      const allowed = typeof val === 'boolean' ? val : (val === -1 || val > 0);
      if (allowed) return p;
    }
    return 'pro';
  }, [allFeatures]);

  /** True if the current plan rank is >= the specified minimum plan. */
  const hasMinPlan = useCallback((minPlan) =>
    (PLAN_RANK[plan] ?? 0) >= (PLAN_RANK[minPlan] ?? 0),
  [plan]);

  /**
   * True if the user has hit or exceeded the numeric limit for a resource.
   * Always false when limit === -1 (unlimited).
   */
  const isLimitReached = useCallback((resource, current) => {
    const limit = features[resource];
    if (limit === -1 || limit == null) return false;
    return current >= limit;
  }, [features]);

  /**
   * Returns a 0-100 usage percentage for a numeric resource.
   * Returns null when the resource is unlimited (limit === -1).
   */
  const usagePercent = useCallback((resource, current) => {
    const limit = features[resource];
    if (limit === -1 || limit == null || limit === 0) return null;
    return Math.min(100, Math.round((current / limit) * 100));
  }, [features]);

  return {
    plan,
    features,
    loading,
    isAllowed,
    requiresPlan,
    hasMinPlan,
    isLimitReached,
    usagePercent,
  };
}

