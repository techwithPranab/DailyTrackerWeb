const mongoose = require('mongoose');

// Singleton settings document (always _id = 'global')
const appSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },

  // Branding
  appName: { type: String, default: 'TrakIO' },
  appTagline: { type: String, default: 'Track Everything. Achieve Anything.' },
  appLogoUrl: { type: String, default: '' },

  // Contact details
  supportEmail: { type: String, default: 'support@trakio.in' },
  privacyEmail: { type: String, default: 'privacy@trakio.in' },
  websiteUrl: { type: String, default: 'https://trakio.in' },
  twitterHandle: { type: String, default: '@trakio_in' },

  // Subscription plans config
  plans: {
    free: {
      name: { type: String, default: 'Free' },
      maxActivities: { type: Number, default: 20 },
      maxMilestones: { type: Number, default: 5 },
      maxReminders: { type: Number, default: 5 },
      price: { type: Number, default: 0 }
    },
    pro: {
      name: { type: String, default: 'Pro' },
      maxActivities: { type: Number, default: 500 },
      maxMilestones: { type: Number, default: 100 },
      maxReminders: { type: Number, default: 100 },
      price: { type: Number, default: 199 }
    },
    enterprise: {
      name: { type: String, default: 'Enterprise' },
      maxActivities: { type: Number, default: -1 },
      maxMilestones: { type: Number, default: -1 },
      maxReminders: { type: Number, default: -1 },
      price: { type: Number, default: 999 }
    }
  },

  // Feature flags
  features: {
    registrationEnabled: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: '' }
  },

  // Announcement banner
  announcement: {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: '' },
    type: { type: String, enum: ['info', 'warning', 'success'], default: 'info' }
  }
}, {
  timestamps: true,
  _id: false
});

module.exports = mongoose.model('AppSettings', appSettingsSchema);
