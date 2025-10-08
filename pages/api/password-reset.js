import { getDb } from '../lib/db.js';
import { sendPasswordReset } from '../lib/mailchimp.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const db = await getDb();
    const user = await db.collection('User').findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const resetUrl = `${process.env.MAIN_APP_URL}/reset-password/${resetToken}`;

    // Send password reset email
    await sendPasswordReset(user, resetUrl);

    // Update user with reset token
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await db.collection('User').updateOne(
      { _id: user._id },
      { $set: { resetToken: passwordResetToken, resetTokenExpiry } }
    );

    // Log communication
    await db.collection('Communication').insertOne({
      userId: user._id,
      type: 'EMAIL',
      subject: 'Password Reset Request',
      content: 'Password reset email sent',
      status: 'SENT',
      metadata: { 
        emailType: 'passwordReset',
        provider: 'mailchimp',
        resetToken: passwordResetToken
      },
      createdAt: new Date()
    });

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: error.message });
  }
}
