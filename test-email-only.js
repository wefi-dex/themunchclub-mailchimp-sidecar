import 'dotenv/config'
import { sendAdminNotification } from './lib/mailchimp.js'

console.log('📧 Testing Email Delivery Only')
console.log('================================')

async function testEmailDelivery() {
  try {
    console.log('🔍 Checking environment variables...')
    
    const requiredEnvVars = [
      'MAILCHIMP_API_KEY',
      'MAILCHIMP_SERVER_PREFIX',
      'ADMIN_EMAIL'
    ]
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      console.error('❌ Missing environment variables:', missingVars.join(', '))
      return false
    }
    
    console.log('✅ Environment variables check passed')
    
    console.log('\n📧 Testing Admin Notification Email...')
    
    const testData = {
      orderId: 'TEST-EMAIL-' + Date.now(),
      printerOrderId: 'PRINTER-' + Date.now(),
      orderDate: new Date().toISOString(),
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      totalValue: 29.99,
      items: [
        { 
          bookTitle: 'Test Cookbook', 
          quantity: 1, 
          value: 29.99,
          type: 'Layflat',
          productCode: 'TEST-001'
        }
      ],
      shippingAddress: {
        firstName: 'Test',
        lastName: 'Customer',
        addressLine1: '123 Test Street',
        addressLine2: 'Apartment 1A',
        town: 'Test City',
        county: 'Test County',
        postCode: 'TE1 1ST',
        country: 'United Kingdom'
      }
    }
    
    const result = await sendAdminNotification(testData)
    
    if (result && result.length > 0) {
      console.log('📧 Mailchimp email result:', JSON.stringify(result, null, 2))
      
      if (result[0].status === 'sent' || result[0].status === 'queued') {
        console.log('✅ Email sent successfully!')
        console.log(`📬 Check ${process.env.ADMIN_EMAIL} for the test email`)
        return true
      } else if (result[0].status === 'rejected') {
        console.log('⚠️  Email was rejected:', result[0].reject_reason)
        console.log('📝 This might be due to:')
        console.log('   - Email address not verified in Mailchimp')
        console.log('   - Domain authentication issues')
        console.log('   - Spam filters')
        return false
      }
    }
    
    console.log('❌ Email sending failed')
    return false
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message)
    return false
  }
}

async function runEmailTest() {
  console.log('🚀 Starting email delivery test...\n')
  
  const success = await testEmailDelivery()
  
  console.log('\n' + '='.repeat(50))
  if (success) {
    console.log('✅ Email delivery test PASSED!')
    console.log('📧 Check your admin email inbox for the test message')
  } else {
    console.log('❌ Email delivery test FAILED!')
    console.log('🔧 Check your Mailchimp configuration and environment variables')
  }
  console.log('='.repeat(50))
}

// Run the test
runEmailTest().catch(console.error)
