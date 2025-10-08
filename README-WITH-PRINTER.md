# Mailchimp Sidecar Service with Printer Integration

This sidecar service handles **both email notifications AND printer integration** while your main app continues running unchanged.

## 🚀 **Complete Integration Features**

✅ **Email Notifications** (via Mailchimp)
- New order alerts → `vpardis@gmail.com`
- Order confirmations → Customer emails
- Order shipped → Customer emails with tracking
- Password reset → Customer emails

✅ **Printer Integration** (via Wowbooks)
- Creates printer orders automatically
- Handles PDF file uploads
- Tracks printer order IDs
- Updates order status from printer webhooks

✅ **Database Integration**
- Uses SAME database as main app
- Reads orders, payments, users
- Writes communication logs
- Updates order statuses

## 🔄 **Complete Order Flow**

1. **Customer places order** → Stripe payment succeeds
2. **Stripe webhook** → Sidecar service receives payment event
3. **Sidecar service** → Reads order from database
4. **Mailchimp** → Sends admin email to `vpardis@gmail.com`
5. **Printer API** → Creates order in Wowbooks
6. **Database** → Updates order with printer order ID
7. **Customer** → Receives confirmation email
8. **Printer webhook** → Updates order status when shipped
9. **Customer** → Receives shipping notification with tracking

## 🧪 **Testing with Printer Integration**

### **Test All Features:**
```bash
node test-with-printer.js
```

### **Test Printer Only:**
```javascript
import { testPrinterIntegration } from './lib/printer.js';
testPrinterIntegration();
```

## 🔗 **Webhook Endpoints**

### **Stripe Webhook** (Payment Events)
- **URL**: `https://your-sidecar-service.vercel.app/api/stripe-webhook-with-printer`
- **Events**: `payment_intent.succeeded`, `payment_intent.payment_failed`

### **Printer Status Webhook** (Order Updates)
- **URL**: `https://your-sidecar-service.vercel.app/api/printer-status-webhook`
- **Purpose**: Handle printer order status updates from Wowbooks

## 🖨️ **Printer Integration Details**

### **How It Works:**
1. **Payment succeeds** → Sidecar receives Stripe webhook
2. **Reads order data** → From database (basket items, shipping address)
3. **Prepares printer payload** → Formats data for Wowbooks API
4. **Calls printer API** → Via main app's `/api/printer/createOrder` endpoint
5. **Updates database** → Stores printer order ID
6. **Creates shipping record** → Links printer order to shipping address

### **Printer API Flow:**
```
Sidecar Service → Main App /api/printer/createOrder → Wowbooks API
```

### **No Additional Credentials Needed:**
- Uses existing main app's printer integration
- Proxies through main app's `/api/printer/*` endpoints
- Leverages existing Wowbooks credentials in main app

## 📊 **Database Schema Updates**

The sidecar service works with your existing schema:
- `Order.printerOrderIds[]` - Stores printer order IDs
- `OrderShipping.printerOrderId` - Links to shipping address
- `Communication` - Logs all email communications
- `OrderStatusHistory` - Tracks status changes

## 🚀 **Deployment Steps**

1. **Set up environment variables:**
   ```env
   DATABASE_URL="your_mongodb_connection"
   MAILCHIMP_API_KEY="your_mailchimp_key"
   STRIPE_SECRET_KEY="your_stripe_key"
   STRIPE_WEBHOOK_SECRET="your_webhook_secret"
   MAIN_APP_URL="https://your-main-app.vercel.app"
   ```

2. **Deploy to Vercel:**
   ```bash
   npx vercel --prod
   ```

3. **Configure webhooks:**
   - **Stripe**: Point to sidecar service
   - **Wowbooks**: Point to sidecar service (if they support webhooks)

## 🎯 **Benefits**

✅ **Complete replacement** for main app's email + printer functionality  
✅ **No changes** to deployed main app  
✅ **Better email deliverability** with Mailchimp  
✅ **Real-time processing** via webhooks  
✅ **Shared database** - admin panel shows real data immediately  
✅ **Automatic printer integration** - orders sent to Wowbooks automatically  
✅ **Status tracking** - order status updates from printer  

## 🔧 **Troubleshooting**

### **Printer Integration Issues:**
- Check if main app's `/api/printer/createOrder` is accessible
- Verify PDF URLs are valid and accessible
- Check Wowbooks portal for created orders

### **Email Issues:**
- Verify Mailchimp API key and sender domain
- Check Mailchimp dashboard for delivery status
- Ensure environment variables are set correctly

### **Database Issues:**
- Verify DATABASE_URL is correct
- Check if Prisma client is generated
- Ensure database is accessible from sidecar service

## 📞 **Support**

If you need help:
1. Check Vercel function logs for errors
2. Verify all environment variables are set
3. Test with `node test-with-printer.js`
4. Check Mailchimp dashboard for email delivery
5. Check Wowbooks portal for printer orders

This sidecar service provides complete email + printer functionality as a replacement for your main app! 🚀
