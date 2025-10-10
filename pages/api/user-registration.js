import { getDb } from '../lib/db.js';
import { sendRegistrationWelcome } from '../lib/mailchimp.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const db = await getDb();
    
    // Find the user by email
    const user = await db.collection('User').findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send welcome email
    await sendRegistrationWelcome({ 
      name: name || user.name, 
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
        userName: name || user.name
      },
      createdAt: new Date()
    });

    res.status(200).json({ 
      message: 'Welcome email sent successfully',
      user: {
        id: user._id,
        name: name || user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration email error:', error);
    res.status(500).json({ error: error.message });
  }
}
