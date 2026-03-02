/**
 * Test script to verify admin subscriptions endpoint
 * Run: node backend/scripts/testSubscriptionsApi.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@trakio.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';

async function testSubscriptionsEndpoint() {
  try {
    console.log('🧪 Testing Admin Subscriptions Endpoint\n');

    // 1. Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    const token = loginResponse.data.data.token;
    console.log('✅ Logged in successfully\n');

    // 2. Test subscriptions endpoint
    console.log('2️⃣ Fetching subscriptions...');
    const subsResponse = await axios.get(`${BASE_URL}/admin/subscriptions`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const subscriptions = subsResponse.data.data;
    console.log(`✅ Found ${subscriptions.length} subscription(s)\n`);

    // 3. Display subscription details
    if (subscriptions.length > 0) {
      console.log('📋 Subscription Details:\n');
      subscriptions.forEach((sub, index) => {
        console.log(`Subscription #${index + 1}:`);
        console.log(`  ID: ${sub._id}`);
        console.log(`  User ID Field: ${sub.userId ? 'EXISTS' : 'MISSING'}`);
        console.log(`  User Field: ${sub.user ? 'EXISTS' : 'MISSING'}`);
        
        if (sub.userId) {
          console.log(`  User Name: ${sub.userId.name || 'N/A'}`);
          console.log(`  User Email: ${sub.userId.email || 'N/A'}`);
        } else if (sub.user) {
          console.log(`  User Name: ${sub.user.name || 'N/A'}`);
          console.log(`  User Email: ${sub.user.email || 'N/A'}`);
        }
        
        console.log(`  Plan: ${sub.plan}`);
        console.log(`  Status: ${sub.status}`);
        console.log(`  Billing Cycle: ${sub.billingCycle || 'N/A'}`);
        console.log(`  Amount: ${sub.amount ? `₹${sub.amount / 100}` : 'N/A'}`);
        console.log('');
      });

      // 4. Verify data structure
      const firstSub = subscriptions[0];
      if (firstSub.userId && firstSub.userId.name) {
        console.log('✅ User data is correctly populated via userId field');
        console.log('   Frontend should use: sub.userId.name and sub.userId.email');
      } else if (firstSub.user && firstSub.user.name) {
        console.log('⚠️  User data is populated via user field (not userId)');
        console.log('   Backend might need adjustment or frontend should use sub.user');
      } else {
        console.log('❌ User data is NOT populated properly');
        console.log('   Check backend populate() call in getSubscriptions()');
      }
    } else {
      console.log('ℹ️  No subscriptions found in database');
      console.log('   This might be normal if no users have subscribed yet');
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Error testing subscriptions endpoint:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || error.message}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('   No response received. Is the backend server running?');
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

testSubscriptionsEndpoint();
