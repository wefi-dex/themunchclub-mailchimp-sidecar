import Stripe from 'stripe';
import { getDb } from '../lib/db.js';
import { sendAdminNotification, sendOrderConfirmation } from '../lib/mailchimp.js';
import { sendToPrinter } from '../lib/printer.js';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleSuccessfulPayment(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handleFailedPayment(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: error.message });
  }
}

async function handleSuccessfulPayment(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  try {
    const db = await getDb();

    // Find the payment by Stripe payment intent id
    const payment = await db.collection('Payment').findOne(
      { stripePaymentId: paymentIntent.id },
      { projection: { orderId: 1, amount: 1 } }
    );

    if (!payment || !payment.orderId) {
      console.log('No order found for payment:', paymentIntent.id);
      return;
    }

    // Load order and user
    const order = await db.collection('Order').findOne(
      { _id: payment.orderId },
      { projection: { userId: 1, basketItems: 1, createdAt: 1, printerOrderIds: 1, shippingAddress: 1 } }
    );
    if (!order) {
      console.log('Order document not found for id:', payment.orderId);
      return;
    }
    const user = await db.collection('User').findOne(
      { _id: order.userId },
      { projection: { name: 1, email: 1 } }
    );

    // Prepare order info for emails and printer
    const orderInfo = {
      orderId: order._id,
      printerOrderId: (order.printerOrderIds && order.printerOrderIds[0]) || 'pending',
      orderDate: order.createdAt,
      customerName: user?.name || 'Customer',
      customerEmail: user?.email || '',
      shippingAddress: order.shippingAddress || {
        firstName: 'Customer',
        lastName: user?.name || '',
        addressLine1: 'Address',
        addressLine2: '',
        town: 'City',
        county: 'County',
        postCode: 'Postcode',
        country: 'Country'
      },
      items: order.basketItems || [],
      totalValue: payment.amount || 0
    };

    // Send admin notification email
    await sendAdminNotification(orderInfo);

    // Send customer confirmation email
    await sendOrderConfirmation({ name: user?.name || 'Customer', email: user?.email || '' }, { id: String(order._id), createdAt: order.createdAt, orderStatus: 'PENDING' });

    // Send to printer (if PDFs are available)
    try {
      // For now, we'll create a mock PDF URL structure
      // In production, these would come from your file upload system
      const mockPdfUrls = (order.basketItems || []).map((item, index) => ({
        cover: `https://your-cdn.com/covers/${order._id}-${index}-cover.pdf`,
        text: `https://your-cdn.com/texts/${order._id}-${index}-text.pdf`
      })) || [];

      if (mockPdfUrls.length > 0) {
        const printerResult = await sendToPrinter({
          email: user?.email || '',
          order: { ...order, id: order._id },
          userShippingAddress: order.shippingAddress,
          pdfUrls: mockPdfUrls
        });

        if (printerResult.success) {
          console.log('✅ Order sent to printer:', printerResult.printerOrderId);
          
          // Update order info with actual printer order ID
          orderInfo.printerOrderId = printerResult.printerOrderId;
          
          // Send updated admin notification with printer info
          await sendAdminNotification(orderInfo);
        }
      } else {
        console.log('⚠️ No PDF URLs available for printer');
      }
    } catch (printerError) {
      console.error('❌ Printer integration failed:', printerError);
      // Don't fail the entire process if printer fails
    }

    // Log communication
    await db.collection('Communication').insertOne({
      userId: order.userId,
      type: 'EMAIL',
      subject: 'Order Confirmation',
      content: 'Order confirmation email sent',
      status: 'SENT',
      metadata: { 
        emailType: 'orderReceived',
        provider: 'mailchimp',
        paymentId: paymentIntent.id,
        printerOrderId: orderInfo.printerOrderId
      },
      createdAt: new Date()
    });

    console.log('✅ Order processing completed:', order._id);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  
  try {
    const db = await getDb();
    const payment = await db.collection('Payment').findOne(
      { stripePaymentId: paymentIntent.id },
      { projection: { orderId: 1 } }
    );
    if (!payment || !payment.orderId) return;
    const order = await db.collection('Order').findOne(
      { _id: payment.orderId },
      { projection: { userId: 1 } }
    );
    if (!order) return;
    await db.collection('Communication').insertOne({
      userId: order.userId,
      type: 'EMAIL',
      subject: 'Payment Failed',
      content: 'Payment failed notification',
      status: 'SENT',
      metadata: { 
        emailType: 'paymentFailed',
        provider: 'mailchimp',
        paymentId: paymentIntent.id
      },
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}
