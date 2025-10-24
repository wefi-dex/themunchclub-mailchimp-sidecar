import { getDb } from './lib/db.js';
import { sendRegistrationWelcome } from './lib/mailchimp.js';

// Database trigger to detect new user registrations
export const checkForNewUsers = async () => {
  try {
    const db = await getDb();
    
    // Find users created in the last 5 minutes who haven't received welcome email
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const newUsers = await db.collection('User').find({
      createdAt: { $gte: fiveMinutesAgo },
      // Check if user hasn't received welcome email yet
      'communications.type': { $ne: 'EMAIL' },
      'communications.metadata.emailType': { $ne: 'registration' }
    }).toArray();

    console.log(`Found ${newUsers.length} new users to send welcome emails to`);

    for (const user of newUsers) {
      try {
        // Send welcome email
        await sendRegistrationWelcome({
          name: user.name || 'New User',
          email: user.email
        });

        // Log communication
        await db.collection('Communication').insertOne({
          userId: user._id,
          type: 'EMAIL',
          subject: 'Welcome to The Munch Club!',
          content: 'Welcome email sent to new user',
          status: 'SENT',
          metadata: { 
            emailType: 'registration',
            provider: 'mailchimp',
            userName: user.name || 'New User',
            triggeredBy: 'database_monitor'
          },
          createdAt: new Date()
        });

        console.log(`✅ Welcome email sent to: ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to send welcome email to ${user.email}:`, error);
      }
    }
  } catch (error) {
    console.error('Error checking for new users:', error);
  }
};

// Run this function periodically (every 2 minutes)
export const startUserRegistrationMonitor = () => {
  console.log('🔄 Starting user registration monitor...');
  
  // Run immediately
  checkForNewUsers();
  
  // Then run every 2 minutes
  setInterval(checkForNewUsers, 2 * 60 * 1000);
};













