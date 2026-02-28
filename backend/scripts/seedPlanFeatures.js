/**
 * Seed / reset plan features in the AppSettings document.
 *
 * Usage:
 *   node backend/scripts/seedPlanFeatures.js           # seed only (skip if already set)
 *   node backend/scripts/seedPlanFeatures.js --force   # always overwrite with defaults
 *
 * npm shortcut (from backend/):
 *   npm run seed:plans
 *   npm run seed:plans -- --force
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const AppSettings = require('../models/AppSettings');

// ── Canonical defaults ────────────────────────────────────────────────────────
const PLAN_DEFAULTS = {
  free: {
    name:                'Free',
    price:               0,
    maxActivities:       10,
    maxMilestones:       0,   // 0 = not available on Free
    maxReminders:        1,   // per activity
    maxUtilities:        2,
    recurringActivities: false,
    subActivities:       false,
    documentUpload:      false,
    analytics:           false,
    dataExport:          false,
    prioritySupport:     false,
  },
  pro: {
    name:                'Pro',
    price:               199,
    maxActivities:       -1,  // -1 = unlimited
    maxMilestones:       -1,
    maxReminders:        -1,
    maxUtilities:        20,
    recurringActivities: true,
    subActivities:       true,
    documentUpload:      true,
    analytics:           true,
    dataExport:          true,
    prioritySupport:     true,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatPlan = (key, plan) => {
  const flags = ['recurringActivities', 'subActivities', 'documentUpload', 'analytics', 'dataExport', 'prioritySupport'];
  const cap = key.charAt(0).toUpperCase() + key.slice(1);
  const lines = [
    `  ┌─ ${cap} (${plan.name}) — ₹${plan.price}/mo`,
    `  │  maxActivities : ${plan.maxActivities === -1 ? 'unlimited' : plan.maxActivities}`,
    `  │  maxMilestones : ${plan.maxMilestones === -1 ? 'unlimited' : plan.maxMilestones === 0 ? 'blocked' : plan.maxMilestones}`,
    `  │  maxReminders  : ${plan.maxReminders  === -1 ? 'unlimited' : plan.maxReminders}  (per activity)`,
    `  │  maxUtilities  : ${plan.maxUtilities  === -1 ? 'unlimited' : plan.maxUtilities}`,
    `  │  feature flags : ${flags.map(f => `${f}=${plan[f] ? '✓' : '✗'}`).join('  ')}`,
    `  └─`,
  ];
  return lines.join('\n');
};

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  const force  = process.argv.includes('--force');
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('❌ No MongoDB URI found. Set MONGODB_URI in backend/.env');
    process.exit(1);
  }

  console.log('\n🔗  Connecting to MongoDB…');
  await mongoose.connect(mongoUri);
  console.log('✅  Connected.\n');

  // Load or create the singleton settings doc
  let settings = await AppSettings.findById('global');

  const alreadySeeded =
    settings?.plans?.free?.maxActivities !== undefined &&
    settings?.plans?.pro?.maxActivities  !== undefined;

  if (alreadySeeded && !force) {
    console.log('ℹ️  Plan features are already seeded.');
    console.log('    Use --force to overwrite with defaults.\n');
    console.log('📋  Current values:\n');
    console.log(formatPlan('free', settings.plans.free));
    console.log(formatPlan('pro',  settings.plans.pro));
    console.log('');
    await mongoose.disconnect();
    return;
  }

  if (!settings) {
    // Create the entire singleton
    settings = await AppSettings.create({
      _id: 'global',
      plans: PLAN_DEFAULTS,
    });
    console.log('🌱  AppSettings document created with plan defaults.\n');
  } else {
    // Upsert just the plans sub-document
    await AppSettings.findByIdAndUpdate(
      'global',
      { $set: { plans: PLAN_DEFAULTS } },
      { new: true }
    );
    console.log(`${force ? '🔄  Plan features reset' : '🌱  Plan features seeded'} to defaults.\n`);
  }

  console.log('📋  Seeded values:\n');
  console.log(formatPlan('free', PLAN_DEFAULTS.free));
  console.log(formatPlan('pro',  PLAN_DEFAULTS.pro));
  console.log('\n✅  Done. You can now edit these live from /admin/plan-features.\n');

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('💥  Seed failed:', err.message);
  process.exit(1);
});
