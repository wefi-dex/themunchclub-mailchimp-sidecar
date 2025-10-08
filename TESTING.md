# Testing Guide for Mailchimp Sidecar Service

## 🧪 **Quick Test Setup**

### 1. **Install Dependencies**
```bash
cd themunchclub-mailchimp-sidecar
npm install
```

### 2. **Set Up Environment Variables**
Create `.env` file with your actual values:

```env
# Database (SAME as your main app)
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database_name"

# Mailchimp Configuration
MAILCHIMP_API_KEY="your_mailchimp_api_key_here"
MAILCHIMP_SERVER_PREFIX="us1"

# Stripe Configuration  
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Email Configuration
ADMIN_EMAIL="vpardis@gmail.com"
FROM_EMAIL="tan@causeverse.io"

# App URLs
MAIN_APP_URL="https://your-themunchclub-app.vercel.app"
```

### 3. **Generate Prisma Client**
```bash
npx prisma generate
```

## 🧪 **Test Scenarios**

### **Test 1: Basic Email Test**
```bash
node test-sidecar.js
```
- Sends admin notification to `vpardis@gmail.com`
- Tests basic Mailchimp integration

### **Test 2: Comprehensive Email Tests**
```bash
node test-comprehensive.js
```
- Tests all email types: admin, confirmation, shipped, password reset
- Validates environment variables
- Sends multiple test emails

### **Test 3: Stripe Webhook Test**
```bash
# Install Stripe CLI
stripe listen --forward-to http://localhost:3000/api/stripe-webhook

# In another terminal, trigger a test payment
stripe trigger payment_intent.succeeded
```

## 📧 **What to Check**

### **Email Delivery**
1. **Admin Email** → Check `vpardis@gmail.com`
2. **Customer Emails** → Check `test@example.com` (or your test email)
3. **Mailchimp Dashboard** → Check sent emails and delivery status

### **Database Integration**
1. **Communication Records** → Check if emails are logged in database
2. **Admin Panel** → Verify data appears in your admin dashboard

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Missing environment variables"**
   - Check `.env` file exists and has correct values
   - Verify Mailchimp API key is valid

2. **"Mailchimp send error"**
   - Verify sender email (`tan@causeverse.io`) is verified in Mailchimp
   - Check API key permissions
   - Ensure server prefix is correct (us1, us2, etc.)

3. **"Database connection failed"**
   - Verify DATABASE_URL is correct
   - Ensure MongoDB is accessible
   - Check if Prisma client is generated

### **Debug Steps:**
```bash
# Check environment variables
node -e "console.log(process.env.MAILCHIMP_API_KEY ? '✅ Set' : '❌ Missing')"

# Test database connection
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => console.log('✅ DB Connected, users:', count)).catch(err => console.error('❌ DB Error:', err.message));
"

# Test Mailchimp connection
node -e "
const mailchimp = require('@mailchimp/mailchimp_marketing');
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});
console.log('✅ Mailchimp configured');
"
```

## 🚀 **Next Steps After Testing**

1. **Deploy to Vercel:**
   ```bash
   npx vercel --prod
   ```

2. **Configure Stripe Webhooks:**
   - Point to your deployed sidecar service
   - Test with real payments

3. **Monitor Email Delivery:**
   - Check Mailchimp dashboard
   - Verify emails arrive at `vpardis@gmail.com`

## 📊 **Expected Results**

✅ **Admin notification** arrives at `vpardis@gmail.com`  
✅ **Customer emails** arrive at test email addresses  
✅ **Mailchimp dashboard** shows sent emails  
✅ **Database** logs communication records  
✅ **Admin panel** shows real data  

Ready to test? Run `node test-comprehensive.js` and let me know the results! 🚀
