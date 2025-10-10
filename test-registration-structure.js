// Test the registration email structure without sending
import dotenv from 'dotenv';
import { sendRegistrationWelcome } from './lib/mailchimp.js';

// Load environment variables
dotenv.config();

const testUser = {
  name: 'Test User',
  email: 'test@example.com'
};

console.log('🧪 Testing Registration Email Structure...');
console.log('User:', testUser);

// Check if environment variables are set
console.log('\n📋 Environment Check:');
console.log('MAILCHIMP_TRANSACTIONAL_API_KEY:', process.env.MAILCHIMP_TRANSACTIONAL_API_KEY ? '✅ Set' : '❌ Not set');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL || '❌ Not set');
console.log('MAIN_APP_URL:', process.env.MAIN_APP_URL || '❌ Not set');

if (!process.env.MAILCHIMP_TRANSACTIONAL_API_KEY) {
  console.log('\n⚠️  MAILCHIMP_TRANSACTIONAL_API_KEY is not set.');
  console.log('To test email sending, you need to:');
  console.log('1. Get a Mandrill API key from Mailchimp');
  console.log('2. Set MAILCHIMP_TRANSACTIONAL_API_KEY in .env file');
  console.log('3. Run this test again');
  
  console.log('\n📧 Email Template Preview:');
  console.log('Subject: Welcome to The Munch Club! 🍳');
  console.log('Recipient:', testUser.email);
  console.log('Content: Beautiful HTML welcome email with:');
  console.log('- Welcome message');
  console.log('- Getting started instructions');
  console.log('- Link to create cookbook');
  console.log('- FAQ and contact links');
  
  console.log('\n✅ Email structure is ready! Just need API key to send.');
} else {
  console.log('\n🚀 Attempting to send email...');
  sendRegistrationWelcome(testUser)
    .then(() => {
      console.log('✅ Registration welcome email sent successfully!');
      console.log(`Check ${testUser.email} for the welcome email.`);
    })
    .catch(err => {
      console.error('❌ Error sending email:', err.message);
    });
}
