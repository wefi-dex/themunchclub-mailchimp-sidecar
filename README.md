# Mailchimp Sidecar Service for TheMunchClub

This sidecar service handles all email notifications via Mailchimp while your main app continues running unchanged.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd themunchclub-mailchimp-sidecar
npm install
```

### 2. Set Up Environment Variables
Copy `env.example` to `.env` and fill in your values:

```env
# Database (SAME as your main app - this is crucial!)
DATABASE_URL="your_mongodb_connection_string"

# Mailchimp Configuration
MAILCHIMP_API_KEY="your_mailchimp_api_key"
MAILCHIMP_SERVER_PREFIX="us1"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Email Configuration
ADMIN_EMAIL="vpardis@gmail.com"
FROM_EMAIL="tan@causeverse.io"

# App URLs
MAIN_APP_URL="https://your-themunchclub-app.vercel.app"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Deploy to Vercel
```bash
npx vercel --prod
```

## 📧 Email Types Handled

- **New Order Notifications** → `vpardis@gmail.com`
- **Order Confirmations** → Customer emails
- **Order Shipped** → Customer emails with tracking
- **Password Reset** → Customer emails

## 🔗 Webhook Endpoints

After deployment, configure these webhooks:

### Stripe Webhook
- **URL**: `https://your-sidecar-service.vercel.app/api/stripe-webhook`
- **Events**: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Order Status Webhook (if needed)
- **URL**: `https://your-sidecar-service.vercel.app/api/order-status-webhook`
- **Purpose**: Handle printer order status updates

## 🧪 Testing

### Test Email Sending
```bash
node test-sidecar.js
```

### Test Stripe Webhook
Use Stripe CLI:
```bash
stripe listen --forward-to https://your-sidecar-service.vercel.app/api/stripe-webhook
```

## 📊 Database Integration

This service uses the **SAME database** as your main app:
- ✅ Reads orders, payments, users from main app
- ✅ Writes communication logs to main app
- ✅ Admin panel shows real data immediately
- ✅ No data migration needed

## 🔧 API Endpoints

- `POST /api/stripe-webhook` - Stripe payment events
- `POST /api/order-status-webhook` - Order status updates
- `POST /api/password-reset` - Password reset emails

## 🎯 Benefits

- ✅ **No changes** to your deployed main app
- ✅ **Better deliverability** with Mailchimp
- ✅ **Real-time email** notifications
- ✅ **Shared database** with main app
- ✅ **Easy to maintain** and update

## 🚨 Important Notes

1. **Use the SAME DATABASE_URL** as your main app
2. **Configure Stripe webhooks** to point to this service
3. **Verify sender domain** in Mailchimp (`tan@causeverse.io`)
4. **Test with real orders** to ensure end-to-end flow works

## 📞 Support

If you need help:
1. Check Mailchimp dashboard for sent emails
2. Verify environment variables are set correctly
3. Test with `node test-sidecar.js`
4. Check Vercel function logs for errors
