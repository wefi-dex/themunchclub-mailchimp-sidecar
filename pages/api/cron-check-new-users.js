import { getDb } from '../lib/db.js';
import { sendRegistrationWelcome } from '../lib/mailchimp.js';

// This function runs every 5 minutes via Vercel Cron
export default async function handler(req, res) {
  // Only allow GET requests (for cron jobs)
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const db = await getDb();
    
    // Find users created in the last 10 minutes who haven't received welcome email
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const newUsers = await db.collection('User').aggregate([
      {
        $match: {
          createdAt: { $gte: tenMinutesAgo }
        }
      },
      {
        $lookup: {
          from: 'Communication',
          localField: '_id',
          foreignField: 'userId',
          as: 'communications'
        }
      },
      {
        $match: {
          'communications.metadata.emailType': { $ne: 'registration' }
        }
      }
    ]).toArray();

    console.log(`Found ${newUsers.length} new users to send welcome emails to`);

    let successCount = 0;
    let errorCount = 0;

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
            triggeredBy: 'cron_job'
          },
          createdAt: new Date()
        });

        successCount++;
        console.log(`✅ Welcome email sent to: ${user.email}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to send welcome email to ${user.email}:`, error);
      }
    }

    res.status(200).json({
      message: 'User registration check completed',
      newUsersFound: newUsers.length,
      emailsSent: successCount,
      errors: errorCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job error:', error);
    res.status(500).json({ error: error.message });
  }
}



