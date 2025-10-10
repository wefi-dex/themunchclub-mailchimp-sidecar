import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

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

// Simple test endpoint
app.post('/api/test-webhook', (req, res) => {
  console.log('Test webhook received:', req.body)
  res.json({ 
    message: 'Test webhook working!',
    received: req.body,
    timestamp: new Date().toISOString()
  })
})

// User registration webhook endpoint (simplified for testing)
app.post('/api/user-registration-webhook', async (req, res) => {
  try {
    console.log('User registration webhook received:', req.body)
    
    const { userId, email, name, timestamp } = req.body

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' })
    }

    // For now, just return success without database operations
    console.log(`✅ Would send welcome email to: ${email} (${name})`)

    res.status(200).json({ 
      message: 'Welcome email would be sent successfully',
      user: {
        id: userId,
        name: name || 'New User',
        email: email
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('User registration webhook error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MunchClub Sidecar Service running on port ${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/health`)
  console.log(`📧 Webhooks: http://localhost:${PORT}/api/*`)
})

export default app
