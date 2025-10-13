import { getDb } from '../lib/db.js';
import axios from 'axios';
import { sendOrderShipped, sendBookDownload } from '../lib/mailchimp.js';
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

        // Fetch shipping address from main app API
        let shippingAddress = null;
        try {
          const { data } = await axios.get(`${process.env.MAIN_APP_URL}/api/order/orderShipping`, {
            params: { printerOrderId: orderId }
          });
          shippingAddress = data?.shippingAddress || null;
        } catch (_) {}

        await sendOrderShipped({ name: user?.name || 'Customer', email: user?.email || '' }, { id: String(order._id) }, trackingUrl, shippingAddress);
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

    // If printer success, send book download notification via Mandrill
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'success') {
      const db = await getDb();
      const fullOrder = await db.collection('Order').findOne({ _id: result.orderId }, { projection: { userId: 1, basketItems: 1 } });
      if (fullOrder) {
        const user = await db.collection('User').findOne({ _id: fullOrder.userId }, { projection: { name: 1, email: 1 } });
        const firstItem = Array.isArray(fullOrder.basketItems) ? fullOrder.basketItems[0] : null;
        const bookTitle = firstItem?.bookTitle || firstItem?.book?.title || 'Recipe Book';
        await sendBookDownload({ name: user?.name || 'Customer', email: user?.email || '' }, bookTitle);
        await db.collection('Communication').insertOne({
          userId: fullOrder.userId,
          type: 'EMAIL',
          subject: 'Book Download Ready',
          content: `Book download notification sent for ${bookTitle}`,
          status: 'SENT',
          metadata: {
            emailType: 'book_download',
            provider: 'mailchimp',
            printerOrderId: orderId,
            bookTitle
          },
          createdAt: new Date()
        });
        console.log('✅ Book download email sent for order:', fullOrder._id);
      }
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
