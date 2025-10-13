import { getDb } from '../lib/db.js';
import { sendRegistrationWelcome } from '../lib/mailchimp.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { userId, email, name, timestamp } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' });
    }

    const db = await getDb();
    
    // Verify user exists in database
    const user = await db.collection('User').findOne({ 
      _id: userId,
      email: email 
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if welcome email was already sent
    const existingCommunication = await db.collection('Communication').findOne({
      userId: userId,
      'metadata.emailType': 'registration',
      'metadata.triggeredBy': 'webhook'
    });

    if (existingCommunication) {
      return res.status(200).json({ 
        message: 'Welcome email already sent',
        alreadySent: true 
      });
    }

    // Send welcome email
    await sendRegistrationWelcome({
      name: name || user.name || 'New User',
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
        userName: name || user.name || 'New User',
        triggeredBy: 'webhook',
        timestamp: timestamp || new Date()
      },
      createdAt: new Date()
    });

    console.log(`✅ Welcome email sent to new user: ${user.email}`);

    res.status(200).json({ 
      message: 'Welcome email sent successfully',
      user: {
        id: user._id,
        name: name || user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('User registration webhook error:', error);
    res.status(500).json({ error: error.message });
  }
}



