const mongoose = require('mongoose');

// ── Per-plan feature sub-schema ───────────────────────────────────────────────
const planSchema = new mongoose.Schema({
  // Display
  name:  { type: String },
  price: { type: Number, default: 0 },          // monthly price (₹)
  yearlyPrice:           { type: Number, default: 0 },   // total yearly price (₹)
  yearlyDiscountPercent: { type: Number, default: 0 },   // e.g. 20 means 20% off

  // Numeric limits  (-1 = unlimited, 0 = blocked/not available)
  maxActivities:  { type: Number, default: -1 },
  maxMilestones:  { type: Number, default: -1 },
  maxReminders:   { type: Number, default: -1 },   // per activity
  maxUtilities:   { type: Number, default: -1 },

  // Boolean feature flags
  recurringActivities: { type: Boolean, default: true },
  subActivities:       { type: Boolean, default: true },
  documentUpload:      { type: Boolean, default: true },
  analytics:           { type: Boolean, default: true },
  dataExport:          { type: Boolean, default: true },
  prioritySupport:     { type: Boolean, default: false },
}, { _id: false });

// Singleton settings document (always _id = 'global')
const appSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },

  // Branding
  appName:    { type: String, default: 'TrakIO' },
  appTagline: { type: String, default: 'Track Everything. Achieve Anything.' },
  appLogoUrl: { type: String, default: '' },

  // Contact details
  supportEmail:  { type: String, default: 'support@trakio.in' },
  privacyEmail:  { type: String, default: 'privacy@trakio.in' },
  websiteUrl:    { type: String, default: 'https://trakio.in' },
  twitterHandle: { type: String, default: '@trakio_in' },

  // ── Subscription plan configs (free + pro only) ───────────────────────────
  plans: {
    free: {
      type: planSchema,
      default: () => ({
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
      }),
    },
    pro: {
      type: planSchema,
      default: () => ({
        name:                'Pro',
        price:               199,
        yearlyPrice:         1990,   // ₹1990/yr  ≈ ₹166/mo  (≈17% off)
        yearlyDiscountPercent: 17,
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
      }),
    },
  },

  // App-level feature flags
  features: {
    registrationEnabled: { type: Boolean, default: true },
    maintenanceMode:     { type: Boolean, default: false },
    maintenanceMessage:  { type: String,  default: '' },
  },

  // Announcement banner
  announcement: {
    enabled: { type: Boolean, default: false },
    message:  { type: String,  default: '' },
    type:     { type: String,  enum: ['info', 'warning', 'success'], default: 'info' },
  },
}, {
  timestamps: true,
  _id: false,
});

module.exports = mongoose.model('AppSettings', appSettingsSchema);