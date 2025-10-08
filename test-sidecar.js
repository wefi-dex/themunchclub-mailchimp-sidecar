import { sendAdminNotification } from '../lib/mailchimp.js';

// Test script to verify Mailchimp integration
const testOrder = {
  orderId: 'TEST-123',
  printerOrderId: 'PRINTER-TEST-123',
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

console.log('Testing Mailchimp sidecar service...');

sendAdminNotification(testOrder)
  .then(() => {
    console.log('✅ Test email sent successfully!');
    console.log('Check vpardis@gmail.com for the test email.');
  })
  .catch(err => {
    console.error('❌ Error sending test email:', err);
  });
