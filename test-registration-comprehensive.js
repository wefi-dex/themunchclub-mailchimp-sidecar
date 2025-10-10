import axios from 'axios';

// Test the registration email API endpoint
const testRegistrationAPI = async () => {
  const sidecarUrl = process.env.SIDECAR_URL || 'http://localhost:3001';
  const testData = {
    email: 'test@example.com',
    name: 'Test User'
  };

  console.log('Testing registration email API endpoint...');
  console.log('Sidecar URL:', sidecarUrl);
  console.log('Test data:', testData);

  try {
    const response = await axios.post(`${sidecarUrl}/api/user-registration`, testData);
    console.log('✅ API Response:', response.data);
    console.log('✅ Registration email sent successfully via API!');
  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('User not found in database. Make sure the user exists.');
    } else if (error.response?.status === 500) {
      console.log('Server error. Check:');
      console.log('1. MAILCHIMP_TRANSACTIONAL_API_KEY is set');
      console.log('2. Database connection is working');
      console.log('3. Sidecar service is running');
    }
  }
};

// Test direct email function
const testDirectEmail = async () => {
  console.log('\n--- Testing Direct Email Function ---');
  
  try {
    const { sendRegistrationWelcome } = await import('./lib/mailchimp.js');
    
    await sendRegistrationWelcome({
      name: 'Direct Test User',
      email: 'direct-test@example.com'
    });
    
    console.log('✅ Direct email function works!');
  } catch (error) {
    console.error('❌ Direct email function error:', error.message);
  }
};

// Run tests
console.log('🧪 Testing Registration Email Functionality\n');

// Test direct function first
testDirectEmail()
  .then(() => {
    // Then test API endpoint
    return testRegistrationAPI();
  })
  .then(() => {
    console.log('\n🎉 All tests completed!');
  })
  .catch(error => {
    console.error('\n💥 Test suite failed:', error);
  });
