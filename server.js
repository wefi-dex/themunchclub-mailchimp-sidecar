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

// Stripe webhook endpoint
app.post('/api/stripe-webhook', async (req, res) => {
  try {
    console.log('Stripe webhook received:', req.body)
    
    // Process the webhook
    const { type, data } = req.body
    
    if (type === 'payment_intent.succeeded') {
      // Send admin notification
      const orderInfo = {
        orderId: data.object.metadata?.orderId || 'unknown',
        printerOrderId: data.object.metadata?.printerOrderId || 'unknown',
        orderDate: new Date(),
        customerName: data.object.metadata?.customerName || 'Unknown',
        customerEmail: data.object.metadata?.customerEmail || 'unknown@example.com',
        totalValue: data.object.amount / 100, // Convert from cents
        items: JSON.parse(data.object.metadata?.items || '[]'),
        shippingAddress: JSON.parse(data.object.metadata?.shippingAddress || '{}')
      }
      
      await sendAdminNotification(orderInfo)
    }
    
    res.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Stripe webhook with printer integration
app.post('/api/stripe-webhook-with-printer', async (req, res) => {
  try {
    console.log('Stripe webhook with printer received:', req.body)
    
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
        console.log('Order sent to printer successfully')
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
    console.log('Printer status webhook received:', req.body)
    
    // Process printer status update
    const { orderId, status, trackingNumber, estimatedDelivery } = req.body
    
    // Update order status in database
    // This would typically update your database
    console.log(`Order ${orderId} status updated to: ${status}`)
    
    res.json({ received: true })
  } catch (error) {
    console.error('Printer status webhook error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Order status webhook
app.post('/api/order-status-webhook', async (req, res) => {
  try {
    console.log('Order status webhook received:', req.body)
    
    // Process order status update
    const { orderId, status } = req.body
    
    console.log(`Order ${orderId} status updated to: ${status}`)
    
    res.json({ received: true })
  } catch (error) {
    console.error('Order status webhook error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Password reset endpoint
app.post('/api/password-reset', async (req, res) => {
  try {
    console.log('Password reset request received:', req.body)
    
    const { email, resetUrl } = req.body
    
    // Send password reset email
    // This would typically use your mailchimp service
    
    res.json({ sent: true })
  } catch (error) {
    console.error('Password reset error:', error)
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
