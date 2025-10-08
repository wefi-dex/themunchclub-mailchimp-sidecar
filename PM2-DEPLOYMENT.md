# 🚀 PM2 Deployment Guide for Sidecar Service

## ✅ Your Admin Panel is SAFE!
- **Admin Panel**: Already running with PM2 (untouched)
- **Sidecar Service**: New separate PM2 process
- **Different Port**: Sidecar runs on port 3001
- **No conflicts**: Completely independent services

## 📋 Prerequisites

1. **Install PM2** (if not already installed):
   ```bash
   npm install -g pm2
   ```

2. **Install Dependencies**:
   ```bash
   cd themunchclub-mailchimp-sidecar
   npm install
   ```

## 🔧 Environment Variables Setup

Create a `.env` file with your actual values:

```bash
# Database
DATABASE_URL="your_mongodb_connection_string"

# Mailchimp
MAILCHIMP_API_KEY="your_mailchimp_api_key"
MAILCHIMP_SERVER_PREFIX="us1"
MAILCHIMP_TRANSACTIONAL_API_KEY="your_mandrill_api_key"

# Email
ADMIN_EMAIL="vpardis@gmail.com"
FROM_EMAIL="tan@causeverse.io"

# URLs
MAIN_APP_URL="https://your-admin-panel-url.com"
SIDECAR_URL="http://localhost:3001"

# Printer API
PRINTER_URL="https://wowbook.co.uk"
PRINTER_API_EMAIL="vpardis@gmail.com"
PRINTER_API_PASSWORD="C410r135!"

# Stripe (if using)
STRIPE_SECRET_KEY="sk_test_your_stripe_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Server
PORT=3001
NODE_ENV=production
```

## 🚀 PM2 Deployment Steps

### 1. Test Locally First
```bash
npm start
# Test at http://localhost:3001/health
```

### 2. Start with PM2
```bash
npm run pm2:start
```

### 3. Check Status
```bash
npm run pm2:status
```

### 4. View Logs
```bash
npm run pm2:logs
```

## 📡 API Endpoints (After Deployment)

Your sidecar will be available at:
- `http://localhost:3001/health` - Health check
- `http://localhost:3001/api/stripe-webhook` - Stripe webhook
- `http://localhost:3001/api/stripe-webhook-with-printer` - Stripe + Printer
- `http://localhost:3001/api/printer-status-webhook` - Printer status
- `http://localhost:3001/api/order-status-webhook` - Order status
- `http://localhost:3001/api/password-reset` - Password reset

## 🔗 Connect to Admin Panel

Update your admin panel to call the sidecar endpoints:
```javascript
const SIDECAR_URL = 'http://localhost:3001'
// or your server IP: http://your-server-ip:3001
```

## 🛠️ PM2 Management Commands

```bash
# Start service
npm run pm2:start

# Stop service
npm run pm2:stop

# Restart service
npm run pm2:restart

# Delete service
npm run pm2:delete

# View logs
npm run pm2:logs

# Check status
npm run pm2:status

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## 🛡️ Safety Features

- **Separate Port**: Runs on port 3001 (different from admin panel)
- **Independent Process**: Separate PM2 process
- **Easy Rollback**: `pm2 delete munchclub-sidecar`
- **Process Monitoring**: PM2 handles restarts and monitoring

## 📊 Monitoring

- **PM2 Dashboard**: `pm2 monit`
- **Logs**: `pm2 logs munchclub-sidecar`
- **Status**: `pm2 status`

## 🔄 Auto-restart on Server Reboot

```bash
pm2 save
pm2 startup
# Follow the instructions to setup auto-start
```

## 🆘 Rollback (If Needed)

```bash
pm2 delete munchclub-sidecar
```

This will completely stop the sidecar service without affecting your admin panel.

## 🌐 Production Setup

For production, you might want to:
1. Use a reverse proxy (nginx) to route traffic
2. Set up SSL certificates
3. Configure firewall rules
4. Set up monitoring and alerting
