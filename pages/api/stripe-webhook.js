import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { sendAdminNotification, sendOrderConfirmation } from '../lib/mailchimp.js';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

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
    // Find the order by payment ID
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntent.id },
      include: {
        order: {
          include: {
            user: true,
            basketItems: true
          }
        }
      }
    });

    if (!payment) {
      console.log('No order found for payment:', paymentIntent.id);
      return;
    }

    const { order } = payment;

    // Send admin notification
    const orderInfo = {
      orderId: order.id,
      printerOrderId: order.printerOrderIds[0] || 'pending',
      orderDate: order.createdAt,
      customerName: order.user.name,
      customerEmail: order.user.email,
      shippingAddress: {
        firstName: 'Customer',
        lastName: order.user.name,
        addressLine1: 'Address',
        addressLine2: '',
        town: 'City',
        county: 'County',
        postCode: 'Postcode',
        country: 'Country'
      },
      items: order.basketItems || [],
      totalValue: payment.amount
    };

    await sendAdminNotification(orderInfo);

    // Send customer confirmation
    await sendOrderConfirmation(order.user, order);

    // Log communication
    await prisma.communication.create({
      data: {
        userId: order.userId,
        type: 'EMAIL',
        subject: 'Order Confirmation',
        content: 'Order confirmation email sent',
        status: 'SENT',
        metadata: { 
          emailType: 'orderReceived',
          provider: 'mailchimp',
          paymentId: paymentIntent.id
        },
      },
    });

    console.log('Emails sent for order:', order.id);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  
  try {
    // Find the order by payment ID
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntent.id },
      include: {
        order: {
          include: {
            user: true
          }
        }
      }
    });

    if (payment) {
      // Log failed payment communication
      await prisma.communication.create({
        data: {
          userId: payment.order.userId,
          type: 'EMAIL',
          subject: 'Payment Failed',
          content: 'Payment failed notification',
          status: 'SENT',
          metadata: { 
            emailType: 'paymentFailed',
            provider: 'mailchimp',
            paymentId: paymentIntent.id
          },
        },
      });
    }
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}
