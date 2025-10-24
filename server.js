import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sendAdminNotification } from './lib/mailchimp.js'
import { sendToPrinter } from './lib/printer.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'munchclub-sidecar',
    timestamp: new Date().toISOString()
  })
})

// Stripe webhook endpoint for order emails
app.post('/api/stripe-webhook', async (req, res) => {
  try {    
    const { paymentIntent, order } = req.body
    
    if (!paymentIntent || !order) {
      return res.status(400).json({ error: 'Missing paymentIntent or order data' })
    }
    
    // Extract order information
    const orderInfo = {
      orderId: order.id,
      printerOrderId: order.printerOrderIds?.[0] || 'pending',
      orderDate: order.createdAt,
      customerName: order.user?.name || 'Customer',
      customerEmail: order.user?.email || paymentIntent.metadata?.email,
      totalValue: paymentIntent.amount / 100, // Convert from cents
      items: order.basketItems?.map(item => ({
        bookTitle: item.book?.title || 'Unknown Book',
        type: item.type,
        productCode: `MC-${item.type?.substring(0, 2).toUpperCase()}`,
        quantity: item.quantity,
        value: item.typePrice?.price * item.quantity || 0
      })) || [],
      shippingAddress: {
        firstName: 'Customer',
        lastName: order.user?.name || 'Name',
        addressLine1: 'Address',
        addressLine2: '',
        town: 'City',
        county: 'County',
        postCode: 'Postcode',
        country: 'Country'
      }
    }
    
    // Send admin notification
    await sendAdminNotification(orderInfo)
    
    // Send customer confirmation
    if (order.user) {
      const { sendOrderConfirmation } = await import('./lib/mailchimp.js')
      await sendOrderConfirmation(order.user, order)
    }
    
    
    res.status(200).json({ 
      success: true, 
      message: 'Order emails sent successfully',
      orderId: order.id 
    })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Stripe webhook with printer integration
app.post('/api/stripe-webhook-with-printer', async (req, res) => {
  try {
    
    const { type, data } = req.body
    
    if (type === 'payment_intent.succeeded') {
      const orderInfo = {
        orderId: data.object.metadata?.orderId || 'unknown',
        printerOrderId: data.object.metadata?.printerOrderId || 'unknown',
        orderDate: new Date(),
        customerName: data.object.metadata?.customerName || 'Unknown',
        customerEmail: data.object.metadata?.customerEmail || 'unknown@example.com',
        totalValue: data.object.amount / 100,
        items: JSON.parse(data.object.metadata?.items || '[]'),
        shippingAddress: JSON.parse(data.object.metadata?.shippingAddress || '{}')
      }
      
      // Send admin notification
      await sendAdminNotification(orderInfo)
      
      // Send to printer
      try {
        await sendToPrinter(orderInfo)
      } catch (printerError) {
        console.error('Printer integration failed:', printerError)
        // Don't fail the webhook if printer fails
      }
    }
    
    res.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook with printer error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Printer status webhook
app.post('/api/printer-status-webhook', async (req, res) => {
  try {
    
    // Process printer status update
    const { orderId, status, trackingNumber, estimatedDelivery } = req.body
    
    // Update order status in database
    // This would typically update your database
    
    res.json({ received: true })
  } catch (error) {
    console.error('Printer status webhook error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Order status webhook
app.post('/api/order-status-webhook', async (req, res) => {
  try {
    
    // Process order status update
    const { orderId, status } = req.body
    
    
    res.json({ received: true })
  } catch (error) {
    console.error('Order status webhook error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Password reset endpoint
app.post('/api/password-reset', async (req, res) => {
  try {
    
    const { email, resetUrl } = req.body
    
    // Send password reset email
    // This would typically use your mailchimp service
    
    res.json({ sent: true })
  } catch (error) {
    console.error('Password reset error:', error)
    res.status(500).json({ error: error.message })
  }
})

// User registration webhook endpoint
app.post('/api/user-registration-webhook', async (req, res) => {
  try {
    
    const { userId, email, name, timestamp } = req.body

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' })
    }

    // For now, just simulate the email sending without database operations
    res.status(200).json({ 
      message: 'Welcome email would be sent successfully',
      user: {
        id: userId,
        name: name || 'New User',
        email: email
      },
      timestamp: new Date().toISOString(),
      note: 'Database operations disabled for testing'
    })
  } catch (error) {
    console.error('User registration webhook error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MunchClub Sidecar Service running on port ${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/health`)
  console.log(`📧 Webhooks: http://localhost:${PORT}/api/*`)
})

export default app
