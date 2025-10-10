import dotenv from 'dotenv';
import { existsSync } from 'fs';

// Load environment variables
dotenv.config();

console.log('🔍 Environment Variables Debug:');
console.log('MAILCHIMP_TRANSACTIONAL_API_KEY:', process.env.MAILCHIMP_TRANSACTIONAL_API_KEY ? '✅ Set' : '❌ Not set');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL || '❌ Not set');
console.log('MAIN_APP_URL:', process.env.MAIN_APP_URL || '❌ Not set');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ Not set');
console.log('MAILCHIMP_API_KEY:', process.env.MAILCHIMP_API_KEY ? '✅ Set' : '❌ Not set');
console.log('MAILCHIMP_SERVER_PREFIX:', process.env.MAILCHIMP_SERVER_PREFIX || '❌ Not set');

console.log('\n📁 Current working directory:', process.cwd());
console.log('📄 .env file exists:', existsSync('.env') ? '✅ Yes' : '❌ No');
