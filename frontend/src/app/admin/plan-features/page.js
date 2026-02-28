'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';

// ── Reusable field components ─────────────────────────────────────────────────

function Section({ title, desc, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="mb-5">
        <h3 className="text-gray-900 font-bold text-base">{title}</h3>
        {desc && <p className="text-gray-500 text-sm mt-0.5">{desc}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function NumericField({ label, hint, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-gray-400 text-xs mb-1.5">{hint}</p>}
      <input
        type="number"
        min="-1"
        value={value ?? ''}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function ToggleField({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {hint && <p className="text-gray-400 text-xs mt-0.5">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
          checked ? 'bg-indigo-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// ── Default shapes ────────────────────────────────────────────────────────────
const DEFAULT_FREE = {
  name: 'Free', price: 0,
  maxActivities: 10, maxMilestones: 0, maxReminders: 1, maxUtilities: 2,
  recurringActivities: false, subActivities: false, documentUpload: false,
  analytics: false, dataExport: false, prioritySupport: false,
};

const DEFAULT_PRO = {
  name: 'Pro', price: 199,
  maxActivities: -1, maxMilestones: -1, maxReminders: -1, maxUtilities: 20,
  recurringActivities: true, subActivities: true, documentUpload: true,
  analytics: true, dataExport: true, prioritySupport: true,
};

// ── Plan editor sub-component ─────────────────────────────────────────────────
function PlanEditor({ planKey, plan, onChange }) {
  const set = (field, value) => onChange({ ...plan, [field]: value });
  const icon = planKey === 'free' ? '🆓' : '⭐';

  return (
    <div className="space-y-6">
      {/* Pricing */}
      <Section
        title={`${icon} ${plan.name ?? planKey} — Pricing`}
        desc="Display name and monthly price shown to users"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              value={plan.name ?? ''}
              onChange={e => set('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <NumericField
            label="Price (₹ / month)"
            hint="0 for free"
            value={plan.price}
            onChange={v => set('price', v)}
          />
        </div>
      </Section>

      {/* Numeric limits */}
      <Section
        title="Resource Limits"
        desc="Set to -1 for unlimited, 0 to block the feature entirely"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumericField
            label="Max Activities"
            hint="-1 = unlimited"
            value={plan.maxActivities}
            onChange={v => set('maxActivities', v)}
          />
          <NumericField
            label="Max Milestones"
            hint="0 = not available on this plan"
            value={plan.maxMilestones}
            onChange={v => set('maxMilestones', v)}
          />
          <NumericField
            label="Max Reminders (per activity)"
            hint="-1 = unlimited"
            value={plan.maxReminders}
            onChange={v => set('maxReminders', v)}
          />
          <NumericField
            label="Max Utilities"
            hint="-1 = unlimited"
            value={plan.maxUtilities}
            onChange={v => set('maxUtilities', v)}
          />
        </div>
      </Section>

      {/* Boolean feature flags */}
      <Section
        title="Feature Flags"
        desc="Toggle which features are enabled on this plan"
      >
        <ToggleField
          label="Recurring Activities"
          hint="Allow daily / weekly / monthly recurring tasks"
          checked={!!plan.recurringActivities}
          onChange={v => set('recurringActivities', v)}
        />
        <hr className="border-gray-100" />
        <ToggleField
          label="Sub-Activities"
          hint="Allow tasks within an activity"
          checked={!!plan.subActivities}
          onChange={v => set('subActivities', v)}
        />
        <hr className="border-gray-100" />
        <ToggleField
          label="Document Upload"
          hint="Upload files / photos to Home Utility entries"
          checked={!!plan.documentUpload}
          onChange={v => set('documentUpload', v)}
        />
        <hr className="border-gray-100" />
        <ToggleField
          label="Analytics & Charts"
          hint="Show progress charts and weekly analytics"
          checked={!!plan.analytics}
          onChange={v => set('analytics', v)}
        />
        <hr className="border-gray-100" />
        <ToggleField
          label="Data Export (CSV)"
          hint="Let users export their activities and data"
          checked={!!plan.dataExport}
          onChange={v => set('dataExport', v)}
        />
        <hr className="border-gray-100" />
        <ToggleField
          label="Priority Support"
          hint="Users on this plan get priority email support"
          checked={!!plan.prioritySupport}
          onChange={v => set('prioritySupport', v)}
        />
      </Section>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PlanFeaturesPage() {
  const [plans, setPlans] = useState({ free: DEFAULT_FREE, pro: DEFAULT_PRO });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('free');

  useEffect(() => {
    adminApi.get('/admin/plan-features')
      .then(r => {
        const data = r.data.data ?? {};
        setPlans({
          free: { ...DEFAULT_FREE, ...data.free },
          pro:  { ...DEFAULT_PRO,  ...data.pro  },
        });
      })
      .catch(() => toast.error('Failed to load plan features'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.put('/admin/plan-features', plans);
      toast.success('Plan features saved! Changes apply immediately.');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (planKey) => {
    const defaults = planKey === 'free' ? DEFAULT_FREE : DEFAULT_PRO;
    setPlans(prev => ({ ...prev, [planKey]: defaults }));
    toast('Reset to defaults — click Save to apply.', { icon: '↺' });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Plan Features</h2>
            <p className="text-gray-500 text-sm mt-1">
              Configure limits and feature flags for each subscription tier.
              Changes take effect immediately — no deploy required.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {saving ? 'Saving…' : '💾 Save Changes'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          {[
            { key: 'free', label: '🆓 Free Plan' },
            { key: 'pro',  label: '⭐ Pro Plan'  },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === t.key
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Plan editor */}
        <PlanEditor
          planKey={activeTab}
          plan={plans[activeTab]}
          onChange={updated => setPlans(prev => ({ ...prev, [activeTab]: updated }))}
        />

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => handleReset(activeTab)}
            className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            Reset {activeTab} to defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {saving ? 'Saving…' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
