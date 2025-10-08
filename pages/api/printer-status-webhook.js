import { getDb } from '../lib/db.js';
import { sendOrderShipped } from '../lib/mailchimp.js';
import { handlePrinterStatusUpdate } from '../lib/printer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { orderId, status, trackingUrl } = req.body;
    
    console.log('Printer status update received:', { orderId, status, trackingUrl });

    // Handle the status update
    const result = await handlePrinterStatusUpdate(orderId, status, trackingUrl);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    // If shipped, send email notification
    if (status.toLowerCase() === 'shipped' && trackingUrl) {
      const db = await getDb();
      const order = await db.collection('Order').findOne({ _id: result.orderId }, { projection: { userId: 1 } });
      if (order) {
        const user = await db.collection('User').findOne({ _id: order.userId }, { projection: { name: 1, email: 1 } });
        await sendOrderShipped({ name: user?.name || 'Customer', email: user?.email || '' }, { id: String(order._id) }, trackingUrl);
        await db.collection('Communication').insertOne({
          userId: order.userId,
          type: 'EMAIL',
          subject: 'Order Shipped',
          content: `Order shipped notification sent with tracking: ${trackingUrl}`,
          status: 'SENT',
          metadata: { 
            emailType: 'shipped',
            provider: 'mailchimp',
            printerOrderId: orderId,
            trackingUrl
          },
          createdAt: new Date()
        });
        console.log('✅ Shipped email sent for order:', order._id);
      }
    }

    res.status(200).json({ 
      success: true, 
      orderId: result.orderId,
      message: 'Status updated successfully' 
    });
  } catch (error) {
    console.error('Printer status webhook error:', error);
    res.status(500).json({ error: error.message });
  }
}
