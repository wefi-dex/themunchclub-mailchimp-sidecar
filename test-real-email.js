import { sendRegistrationWelcome } from './lib/mailchimp.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test with admin email
const testUser = {
  name: 'Test User',
  email: 'vpardis@gmail.com' // Use admin email for testing
};

console.log('🧪 Testing Registration Email with Real Address...');
console.log('User:', testUser);

sendRegistrationWelcome(testUser)
  .then((response) => {
    console.log('✅ Email sent successfully!');
    console.log('Response:', response);
    console.log(`Check ${testUser.email} for the welcome email.`);
  })
  .catch(err => {
    console.error('❌ Error sending email:', err);
  });
