/**
 * Quick test for transactions endpoint
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function test() {
  // Login
  const loginRes = await axios.post(`${BASE_URL}/admin/login`, {
    email: 'admin@trakio.in',
    password: 'Admin@12345'
  });
  const token = loginRes.data.data.token;

  // Get transactions
  const transRes = await axios.get(`${BASE_URL}/admin/transactions`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const transactions = transRes.data.data;
  console.log(`Found ${transactions.length} transactions\n`);

  if (transactions.length > 0) {
    const t = transactions[0];
    console.log('First transaction structure:');
    console.log('  Has user object:', !!t.user);
    console.log('  Has userName field:', !!t.userName);
    console.log('  Has userEmail field:', !!t.userEmail);
    if (t.user) {
      console.log('  user.name:', t.user.name);
      console.log('  user.email:', t.user.email);
    }
    console.log('\n✅ Frontend should use: t.user.name and t.user.email');
  } else {
    console.log('No transactions found (this might be normal)');
  }
}

test().catch(console.error);
