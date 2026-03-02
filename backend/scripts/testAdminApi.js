/**
 * Test script to verify admin API endpoints
 * Run: node backend/scripts/testAdminApi.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@trakio.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';

async function testAdminEndpoints() {
  try {
    console.log('🧪 Testing Admin API Endpoints\n');
    console.log(`Base URL: ${BASE_URL}\n`);

    // 1. Test admin login
    console.log('1️⃣ Testing Admin Login...');
    const loginResponse = await axios.post(`${BASE_URL}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Admin login successful');
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log(`   Admin: ${loginResponse.data.data.name} (${loginResponse.data.data.email})\n`);

    // 2. Test stats endpoint
    console.log('2️⃣ Testing /admin/stats...');
    const statsResponse = await axios.get(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Stats endpoint working');
    console.log('   Data:', JSON.stringify(statsResponse.data.data, null, 2), '\n');

    // 3. Test activity-feed endpoint
    console.log('3️⃣ Testing /admin/activity-feed...');
    const feedResponse = await axios.get(`${BASE_URL}/admin/activity-feed`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Activity feed endpoint working');
    console.log(`   Recent users: ${feedResponse.data.data.recentUsers.length}`);
    console.log(`   Recent activities: ${feedResponse.data.data.recentActivities.length}\n`);

    // 4. Test revenue endpoint
    console.log('4️⃣ Testing /admin/revenue...');
    const revenueResponse = await axios.get(`${BASE_URL}/admin/revenue`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Revenue endpoint working');
    console.log('   Data:', JSON.stringify(revenueResponse.data.data, null, 2), '\n');

    console.log('🎉 All admin API endpoints are working correctly!');
    console.log('\n📝 Next steps:');
    console.log('   1. Make sure backend server is running: npm run dev (in backend folder)');
    console.log('   2. Make sure frontend is running: npm run dev (in frontend folder)');
    console.log('   3. Login to admin panel at: http://localhost:3000/admin/login');
    console.log(`   4. Use credentials: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  } catch (error) {
    console.error('\n❌ Error testing admin endpoints:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || error.message}`);
      console.error(`   Data:`, error.response.data);
    } else if (error.request) {
      console.error('   No response received. Is the backend server running?');
      console.error(`   Make sure to start it with: cd backend && npm run dev`);
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

testAdminEndpoints();
