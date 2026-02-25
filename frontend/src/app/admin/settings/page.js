'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';

function Section({ title, desc, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="mb-5">
        <h3 className="text-white font-bold text-base">{title}</h3>
        {desc && <p className="text-gray-500 text-sm mt-0.5">{desc}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      {hint && <p className="text-gray-600 text-xs mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-700'}`} />
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
      <span className="text-gray-300 text-sm">{label}</span>
    </label>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');

  useEffect(() => {
    adminApi.get('/admin/settings')
      .then(r => setSettings(r.data.data))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const update = (path, value) => {
    setSettings(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.put('/admin/settings', {
        appName: settings.appName,
        appTagline: settings.appTagline,
        appLogoUrl: settings.appLogoUrl,
        supportEmail: settings.supportEmail,
        privacyEmail: settings.privacyEmail,
        websiteUrl: settings.websiteUrl,
        twitterHandle: settings.twitterHandle,
        plans: settings.plans,
        features: settings.features,
        announcement: settings.announcement,
      });
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'branding', label: '🎨 Branding' },
    { id: 'contact', label: '📬 Contact' },
    { id: 'plans', label: '💳 Plans' },
    { id: 'features', label: '🔧 Features' },
    { id: 'announcement', label: '📢 Announcement' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
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
            <h2 className="text-2xl font-extrabold text-white">App Settings</h2>
            <p className="text-gray-500 text-sm mt-1">Configure TrakIO branding, plans, and features</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {saving ? 'Saving…' : '💾 Save All Changes'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 min-w-fit px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
                ${activeTab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Branding ─────────────────────────────────── */}
        {activeTab === 'branding' && (
          <Section title="Branding" desc="App name and appearance">
            <Field label="App Name">
              <TextInput value={settings.appName} onChange={v => update('appName', v)} placeholder="TrakIO" />
            </Field>
            <Field label="App Tagline">
              <TextInput value={settings.appTagline} onChange={v => update('appTagline', v)} placeholder="Track Everything. Achieve Anything." />
            </Field>
            <Field label="Logo URL" hint="Direct URL to the app logo image (optional)">
              <TextInput value={settings.appLogoUrl} onChange={v => update('appLogoUrl', v)} placeholder="https://..." />
            </Field>
          </Section>
        )}

        {/* ── Contact ──────────────────────────────────── */}
        {activeTab === 'contact' && (
          <Section title="Contact Details" desc="Emails and links shown to users">
            <Field label="Support Email">
              <TextInput type="email" value={settings.supportEmail} onChange={v => update('supportEmail', v)} placeholder="support@trakio.in" />
            </Field>
            <Field label="Privacy Email">
              <TextInput type="email" value={settings.privacyEmail} onChange={v => update('privacyEmail', v)} placeholder="privacy@trakio.in" />
            </Field>
            <Field label="Website URL">
              <TextInput value={settings.websiteUrl} onChange={v => update('websiteUrl', v)} placeholder="https://trakio.in" />
            </Field>
            <Field label="Twitter / X Handle">
              <TextInput value={settings.twitterHandle} onChange={v => update('twitterHandle', v)} placeholder="@trakio_in" />
            </Field>
          </Section>
        )}

        {/* ── Plans ────────────────────────────────────── */}
        {activeTab === 'plans' && (
          <div className="space-y-4">
            {['free', 'pro', 'enterprise'].map(plan => (
              <Section
                key={plan}
                title={`${plan === 'free' ? '🆓 Free' : plan === 'pro' ? '⭐ Pro' : '🏢 Enterprise'} Plan`}
                desc={`Configure limits for the ${plan} tier`}
              >
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Display Name">
                    <TextInput
                      value={settings.plans?.[plan]?.name}
                      onChange={v => update(`plans.${plan}.name`, v)}
                      placeholder={plan.charAt(0).toUpperCase() + plan.slice(1)}
                    />
                  </Field>
                  <Field label="Price (₹/month)" hint="0 = free">
                    <input
                      type="number"
                      min="0"
                      value={settings.plans?.[plan]?.price ?? 0}
                      onChange={e => update(`plans.${plan}.price`, Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </Field>
                  <Field label="Max Activities" hint="-1 = unlimited">
                    <input
                      type="number"
                      min="-1"
                      value={settings.plans?.[plan]?.maxActivities ?? -1}
                      onChange={e => update(`plans.${plan}.maxActivities`, Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </Field>
                  <Field label="Max Milestones" hint="-1 = unlimited">
                    <input
                      type="number"
                      min="-1"
                      value={settings.plans?.[plan]?.maxMilestones ?? -1}
                      onChange={e => update(`plans.${plan}.maxMilestones`, Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </Field>
                </div>
              </Section>
            ))}
          </div>
        )}

        {/* ── Features ─────────────────────────────────── */}
        {activeTab === 'features' && (
          <Section title="Feature Flags" desc="Toggle application features on or off">
            <Toggle
              checked={settings.features?.registrationEnabled ?? true}
              onChange={v => update('features.registrationEnabled', v)}
              label="User Registration Enabled"
            />
            <hr className="border-gray-800" />
            <Toggle
              checked={settings.features?.maintenanceMode ?? false}
              onChange={v => update('features.maintenanceMode', v)}
              label="Maintenance Mode (blocks all user logins)"
            />
            {settings.features?.maintenanceMode && (
              <Field label="Maintenance Message" hint="Shown to users during maintenance">
                <textarea
                  value={settings.features?.maintenanceMessage || ''}
                  onChange={e => update('features.maintenanceMessage', e.target.value)}
                  rows={2}
                  placeholder="We're performing scheduled maintenance. Back soon!"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </Field>
            )}
          </Section>
        )}

        {/* ── Announcement ─────────────────────────────── */}
        {activeTab === 'announcement' && (
          <Section title="Announcement Banner" desc="Show a banner to all logged-in users">
            <Toggle
              checked={settings.announcement?.enabled ?? false}
              onChange={v => update('announcement.enabled', v)}
              label="Show announcement banner"
            />
            {settings.announcement?.enabled && (
              <>
                <Field label="Message">
                  <textarea
                    value={settings.announcement?.message || ''}
                    onChange={e => update('announcement.message', e.target.value)}
                    rows={2}
                    placeholder="Exciting news! TrakIO Pro is now available."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </Field>
                <Field label="Banner Type">
                  <select
                    value={settings.announcement?.type || 'info'}
                    onChange={e => update('announcement.type', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="info">ℹ️ Info (blue)</option>
                    <option value="warning">⚠️ Warning (yellow)</option>
                    <option value="success">✅ Success (green)</option>
                  </select>
                </Field>

                {/* Preview */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
                    settings.announcement?.type === 'warning' ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-800' :
                    settings.announcement?.type === 'success' ? 'bg-green-900/40 text-green-300 border border-green-800' :
                    'bg-blue-900/40 text-blue-300 border border-blue-800'
                  }`}>
                    {settings.announcement?.message || '(empty message)'}
                  </div>
                </div>
              </>
            )}
          </Section>
        )}

        {/* Sticky save button (mobile) */}
        <div className="sm:hidden fixed bottom-4 left-4 right-4 z-10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-2xl transition-colors"
          >
            {saving ? 'Saving…' : '💾 Save All Changes'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
