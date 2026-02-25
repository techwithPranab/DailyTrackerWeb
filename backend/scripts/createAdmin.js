/**
 * Run this once to create the admin account:
 *   node backend/scripts/createAdmin.js
 *
 * Set ADMIN_EMAIL / ADMIN_PASSWORD env vars or edit the defaults below.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@trakio.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';
const ADMIN_NAME = process.env.ADMIN_NAME || 'TrakIO Admin';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log('Existing user promoted to admin:', ADMIN_EMAIL);
    } else {
      console.log('Admin already exists:', ADMIN_EMAIL);
    }
    process.exit(0);
  }

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin'
  });

  console.log('✅ Admin account created!');
  console.log('   Email   :', ADMIN_EMAIL);
  console.log('   Password:', ADMIN_PASSWORD);
  console.log('   ⚠️  Change this password after first login!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
