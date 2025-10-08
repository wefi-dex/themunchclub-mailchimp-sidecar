import axios from 'axios';

async function testPrinterAPI() {
  try {
    console.log('🔍 Testing printer API step by step...');
    
    // Step 1: Test authentication
    console.log('1. Testing authentication...');
    const authResponse = await axios.post('https://wowflow.wowbooks.com/auth/login', {
      email: 'vpardis@gmail.com',
      password: 'C410r135!'
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('✅ Auth successful:', authResponse.status);
    const token = authResponse.data.token;
    console.log('Token received:', !!token);
    
    // Step 2: Test import endpoint with minimal payload
    console.log('2. Testing import endpoint...');
    const testPayload = {
      customerRef: 'TEST-' + Date.now(),
      shippingMethod: 'standard',
      delivery: {
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Test St',
        addressLine2: '',
        addressLine3: '',
        town: 'Test City',
        county: 'Test County',
        postCode: 'TE1 1ST',
        country: 'United Kingdom',
        isoCountryCode: 'GB',
        reference: 'TEST-' + Date.now()
      },
      jobs: [{
        productCode: 'MC-HC',
        jobReference: 'JOB-TEST-001',
        qty: 1,
        pageCount: 50,
        files: [{ cover: 'https://example.com/cover.pdf', text: 'https://example.com/text.pdf' }],
        value: 25.99
      }]
    };
    
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    
    const importResponse = await axios.post('https://wowflow.wowbooks.com/api/import', testPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('✅ Import successful:', importResponse.status);
    console.log('Response:', importResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testPrinterAPI();
