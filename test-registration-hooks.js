import axios from 'axios';

// Test all user registration hook methods
const testUserRegistrationHooks = async () => {
  const sidecarUrl = process.env.SIDECAR_URL || 'http://localhost:3001';
  
  console.log('🧪 Testing User Registration Hooks\n');

  // Test 1: Direct API endpoint
  console.log('1️⃣ Testing Direct API Endpoint...');
  try {
    const response = await axios.post(`${sidecarUrl}/api/user-registration`, {
      email: 'test@example.com',
      name: 'Test User'
    });
    console.log('✅ Direct API:', response.data.message);
  } catch (error) {
    console.log('❌ Direct API:', error.response?.data?.error || error.message);
  }

  // Test 2: Webhook endpoint
  console.log('\n2️⃣ Testing Webhook Endpoint...');
  try {
    const response = await axios.post(`${sidecarUrl}/api/user-registration-webhook`, {
      userId: '507f1f77bcf86cd799439011', // Example ObjectId
      email: 'webhook-test@example.com',
      name: 'Webhook Test User',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Webhook:', response.data.message);
  } catch (error) {
    console.log('❌ Webhook:', error.response?.data?.error || error.message);
  }

  // Test 3: Cron job endpoint
  console.log('\n3️⃣ Testing Cron Job Endpoint...');
  try {
    const response = await axios.get(`${sidecarUrl}/api/cron-check-new-users`);
    console.log('✅ Cron Job:', response.data.message);
    console.log('   New users found:', response.data.newUsersFound);
    console.log('   Emails sent:', response.data.emailsSent);
  } catch (error) {
    console.log('❌ Cron Job:', error.response?.data?.error || error.message);
  }

  console.log('\n📋 Summary of Hook Methods:');
  console.log('1. Direct API: /api/user-registration');
  console.log('2. Webhook: /api/user-registration-webhook');
  console.log('3. Cron Job: /api/cron-check-new-users (runs every 5 minutes)');
  console.log('4. Database Monitor: lib/userRegistrationMonitor.js');
  console.log('5. Main App Integration: Modified register.js');
};

// Run tests
testUserRegistrationHooks().catch(console.error);
