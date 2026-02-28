'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getRequiredPlan, PLAN_RANK } from '@/lib/planFeatures';
import PlanModal from './PlanModal';

/**
 * PlanGate — wrap premium features to show an upgrade prompt for users on lower plans.
 *
 * Props:
 *   requiredPlan  — 'pro' | 'enterprise'  (explicit plan requirement)
 *   feature       — feature key from planFeatures config; auto-resolves requiredPlan
 *                   when provided. Takes precedence over requiredPlan.
 *   children      — content to render when the user has access
 *   fallback      — optional custom node to show instead of the default prompt
 *   inline        — if true, renders a compact inline banner instead of full overlay
 */
export default function PlanGate({ requiredPlan: requiredPlanProp, feature, children, fallback, inline = false }) {
  // Derive requiredPlan: feature prop wins over explicit requiredPlan
  const requiredPlan = feature ? getRequiredPlan(feature) : (requiredPlanProp ?? 'pro');
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const currentPlan = user?.subscription?.plan ?? 'free';
  const hasAccess   = PLAN_RANK[currentPlan] >= PLAN_RANK[requiredPlan];

  if (hasAccess) return children;

  if (fallback) return fallback;

  const planLabel = requiredPlan === 'enterprise' ? 'Enterprise 🏢' : 'Pro ⭐';

  if (inline) {
    return (
      <>
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm">
          <span className="text-blue-600">🔒</span>
          <p className="text-blue-700 flex-1">
            This feature requires the <strong>{planLabel}</strong> plan.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex-shrink-0 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700"
          >
            Upgrade
          </button>
        </div>
        {showModal && (
          <PlanModal
            currentPlan={currentPlan}
            onClose={() => setShowModal(false)}
            onSuccess={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden">
        {/* Blurred content preview */}
        <div className="pointer-events-none select-none blur-sm opacity-40 saturate-50">
          {children}
        </div>

        {/* Upgrade overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm border border-blue-200 rounded-2xl shadow-xl px-8 py-6 text-center max-w-xs mx-4">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-bold text-gray-900 text-base mb-1">
              {planLabel} Feature
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Upgrade to <strong>{planLabel}</strong> to unlock this feature.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 px-6 rounded-xl transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <PlanModal
          currentPlan={currentPlan}
          onClose={() => setShowModal(false)}
          onSuccess={() => setShowModal(false)}
        />
      )}
    </>
  );
}
