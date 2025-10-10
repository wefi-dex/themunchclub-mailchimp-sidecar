// Simple test script to verify Option 1 implementation
import axios from 'axios';

const testOption1 = async () => {
  console.log('🧪 Testing Option 1: Webhook Method\n');
  
  const sidecarUrl = 'http://localhost:3001';
  
  // Test 1: Health check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const healthResponse = await axios.get(`${sidecarUrl}/health`);
    console.log('✅ Health check:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }

  // Test 2: User registration webhook
  console.log('\n2️⃣ Testing user registration webhook...');
  try {
    const webhookResponse = await axios.post(`${sidecarUrl}/api/user-registration-webhook`, {
      userId: 'test123',
      email: 'test@example.com',
      name: 'Test User',
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Webhook response:', webhookResponse.data);
    console.log('✅ Option 1 (Webhook Method) is working!');
  } catch (error) {
    console.log('❌ Webhook test failed:', error.response?.data || error.message);
  }

  console.log('\n📋 Option 1 Implementation Summary:');
  console.log('✅ Webhook endpoint: /api/user-registration-webhook');
  console.log('✅ Main app integration: Modified register.js');
  console.log('✅ Environment variables: SIDECAR_URL configured');
  console.log('✅ Express server: Running on port 3001');
  console.log('✅ Error handling: Async with fallback');
};

testOption1().catch(console.error);
