import express from 'express'

const app = express()
const PORT = 3001

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'minimal-test' })
})

app.post('/api/user-registration-webhook', (req, res) => {
  console.log('Webhook received:', req.body)
  res.json({ 
    message: 'Success!',
    received: req.body
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
