// Enhanced test script with printer integration
import 'dotenv/config';
import { sendAdminNotification, sendOrderConfirmation, sendOrderShipped, sendPasswordReset } from './lib/mailchimp.js';
import { testPrinterIntegration as runPrinterIntegration, sendToPrinter } from './lib/printer.js';
import { getDb } from './lib/db.js';


console.log('🧪 Testing Mailchimp Sidecar Service with Printer Integration');
console.log('============================================================');

// Test 1: Admin Notification Email
const testAdminNotification = async () => {
  console.log('\n📧 Test 1: Admin Notification Email');
  
  const testOrder = {
    orderId: 'TEST-' + Date.now(),
    printerOrderId: 'PRINTER-TEST-' + Date.now(),
    orderDate: new Date(),
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    shippingAddress: {
      firstName: 'Test',
      lastName: 'Customer',
      addressLine1: '123 Test Street',
      addressLine2: 'Apt 1',
      town: 'Test City',
      county: 'Test County',
      postCode: 'TE1 1ST',
      country: 'United Kingdom'
    },
    items: [{
      bookTitle: 'Test Recipe Book',
      type: 'Hardcover',
      productCode: 'TEST-001',
      quantity: 1,
      value: 25.99
    }],
    totalValue: 25.99
  };

  try {
    await sendAdminNotification(testOrder);
    console.log('✅ Admin notification sent successfully!');
    console.log('📬 Check vpardis@gmail.com for the test email');
  } catch (error) {
    console.error('❌ Admin notification failed:', error.message);
  }
};

// Test 2: Printer Integration
const runLocalPrinterIntegrationTest = async () => {
  console.log('\n🖨️ Test 2: Printer Integration');
  
  const testOrder = {
    id: 'TEST-ORDER-' + Date.now(),
    createdAt: new Date(),
    basketItems: [{
      bookTitle: 'Test Recipe Book',
      type: 'Hardcover',
      productCode: 'TEST-001',
      quantity: 1,
      pageCount: 50,
      value: 25.99
    }],
    payment: {
      amount: 25.99
    }
  };

  const testAddress = {
    id: 'test-address-id',
    firstName: 'Test',
    lastName: 'Customer',
    addressLine1: '123 Test Street',
    addressLine2: 'Apt 1',
    town: 'Test City',
    county: 'Test County',
    postCode: 'TE1 1ST',
    country: 'United Kingdom'
  };

  const testPdfUrls = [
    { 
      cover: 'https://example.com/test-cover.pdf', 
      text: 'https://example.com/test-text.pdf' 
    }
  ];

  try {
    const result = await sendToPrinter({
      email: 'test@example.com',
      order: testOrder,
      userShippingAddress: testAddress,
      pdfUrls: testPdfUrls
    });

    console.log('✅ Printer integration test successful!');
    console.log('🖨️ Printer Order ID:', result.printerOrderId);
    console.log('📋 Check Wowbooks portal for the test order');
    
    return result;
  } catch (error) {
    console.error('❌ Printer integration failed:', error.message);
    return null;
  }
};

// Test 3: Order Confirmation Email
const testOrderConfirmation = async () => {
  console.log('\n📧 Test 3: Order Confirmation Email');
  
  const testUser = {
    name: 'Test Customer',
    email: 'test@example.com'
  };
  
  const testOrder = {
    id: 'ORDER-' + Date.now(),
    createdAt: new Date(),
    orderStatus: 'PENDING'
  };

  try {
    await sendOrderConfirmation(testUser, testOrder);
    console.log('✅ Order confirmation sent successfully!');
    console.log('📬 Check test@example.com for the confirmation email');
  } catch (error) {
    console.error('❌ Order confirmation failed:', error.message);
  }
};

// Test 4: Order Shipped Email
const testOrderShipped = async () => {
  console.log('\n📧 Test 4: Order Shipped Email');
  
  const testUser = {
    name: 'Test Customer',
    email: 'test@example.com'
  };
  
  const testOrder = {
    id: 'ORDER-' + Date.now(),
    createdAt: new Date(),
    orderStatus: 'SHIPPED'
  };
  
  const trackingUrl = 'https://tracking.example.com/track/123456';

  try {
    await sendOrderShipped(testUser, testOrder, trackingUrl);
    console.log('✅ Order shipped notification sent successfully!');
    console.log('📬 Check test@example.com for the shipping email');
  } catch (error) {
    console.error('❌ Order shipped notification failed:', error.message);
  }
};

// Test 5: Password Reset Email
const testPasswordReset = async () => {
  console.log('\n📧 Test 5: Password Reset Email');
  
  const testUser = {
    name: 'Test Customer',
    email: 'test@example.com'
  };
  
  const resetUrl = 'https://themunchclub.com/reset-password/test-token-123';

  try {
    await sendPasswordReset(testUser, resetUrl);
    console.log('✅ Password reset email sent successfully!');
    console.log('📬 Check test@example.com for the reset email');
  } catch (error) {
    console.error('❌ Password reset email failed:', error.message);
  }
};

// Test 6: Database Integration
const testDatabaseIntegration = async () => {
  console.log('\n🗄️ Test 6: Database Integration');
  
  try {
    const db = await getDb();
    const userCount = await db.collection('User').countDocuments();
    const orderCount = await db.collection('Order').countDocuments();
    const communicationCount = await db.collection('Communication').countDocuments();
    
    console.log('✅ Database connection successful!');
    console.log(`📊 Users: ${userCount}, Orders: ${orderCount}, Communications: ${communicationCount}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

// Run all tests
const runAllTests = async () => {
  try {
    await testDatabaseIntegration();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testAdminNotification();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Prefer calling the exported printer test util if available
    if (typeof runPrinterIntegration === 'function') {
      await runPrinterIntegration();
    } else {
      await runLocalPrinterIntegrationTest();
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testOrderConfirmation();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testOrderShipped();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testPasswordReset();
    
    console.log('\n🎉 All tests completed!');
    console.log('📋 Check your email inboxes for the test emails');
    console.log('📊 Check Mailchimp dashboard for delivery status');
    console.log('🖨️ Check Wowbooks portal for printer orders');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
};

// Check if environment variables are set
const checkEnvironment = () => {
  const required = [
    'MAILCHIMP_API_KEY',
    'MAILCHIMP_SERVER_PREFIX',
    'ADMIN_EMAIL',
    'FROM_EMAIL',
    'DATABASE_URL',
    'MAIN_APP_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.log('📝 Please set these in your .env file');
    process.exit(1);
  }
  
  console.log('✅ Environment variables check passed');
};

// Main execution
console.log('🔍 Checking environment variables...');
checkEnvironment();

console.log('🚀 Starting comprehensive tests...');
runAllTests();
