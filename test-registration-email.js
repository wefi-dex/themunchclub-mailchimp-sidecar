import { sendRegistrationWelcome } from './lib/mailchimp.js';

// Test script to verify registration email functionality
const testUser = {
  name: 'Test User',
  email: 'test@example.com'
};

console.log('Testing registration welcome email...');
console.log('User:', testUser);

sendRegistrationWelcome(testUser)
  .then(() => {
    console.log('✅ Registration welcome email sent successfully!');
    console.log(`Check ${testUser.email} for the welcome email.`);
    console.log('Email should contain:');
    console.log('- Welcome message');
    console.log('- Instructions for getting started');
    console.log('- Link to create first cookbook');
    console.log('- FAQ and contact links');
  })
  .catch(err => {
    console.error('❌ Error sending registration welcome email:', err);
    console.log('Make sure you have:');
    console.log('1. MAILCHIMP_TRANSACTIONAL_API_KEY set in .env');
    console.log('2. FROM_EMAIL set in .env');
    console.log('3. MAIN_APP_URL set in .env');
  });
