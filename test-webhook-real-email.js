import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testWebhookWithRealEmail = async () => {
  console.log('🧪 Testing Webhook with Real Email\n');
  
  const sidecarUrl = 'http://localhost:3001';
  
  // Test webhook with a real email
  console.log('📧 Testing user registration webhook...');
  try {
    const webhookResponse = await axios.post(`${sidecarUrl}/api/user-registration-webhook`, {
      userId: 'test123',
      email: 'vpardis@gmail.com', // Use admin email for testing
      name: 'Test User',
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Webhook response:', webhookResponse.data);
    console.log('✅ Option 1 (Webhook Method) is working with real email!');
  } catch (error) {
    console.log('❌ Webhook test failed:', error.response?.data || error.message);
  }
};

testWebhookWithRealEmail().catch(console.error);
