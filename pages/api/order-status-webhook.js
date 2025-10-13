import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { sendOrderShipped } from '../lib/mailchimp.js';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { orderId, status, trackingUrl } = req.body;
    
    console.log('Order status update:', { orderId, status, trackingUrl });

    // Find order by printer order ID
    const order = await prisma.order.findFirst({
      where: {
        printerOrderIds: {
          has: orderId.toString(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!order) {
      console.log('Order not found for printer ID:', orderId);
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { orderStatus: status },
    });

    // Add status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: status,
        message: { trackingUrl, timestamp: new Date().toISOString() }
      }
    });

    // If shipped, send email
    if (status.toLowerCase() === 'shipped' && trackingUrl) {
      // Fetch shipping address from main app API
      let shippingAddress = null;
      try {
        const { data } = await axios.get(`${process.env.MAIN_APP_URL}/api/order/orderShipping`, {
          params: { printerOrderId: orderId }
        });
        shippingAddress = data?.shippingAddress || null;
      } catch (_) {}

      await sendOrderShipped(order.user, order, trackingUrl, shippingAddress);
      
      // Log communication
      await prisma.communication.create({
        data: {
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
        },
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Order status webhook error:', error);
    res.status(500).json({ error: error.message });
  }
}
