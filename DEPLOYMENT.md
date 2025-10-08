# 🚀 Safe AWS Deployment Guide for Sidecar Service

## ✅ Your Admin Panel is SAFE!
- **Admin Panel**: Already running (untouched)
- **Sidecar Service**: New separate deployment
- **No conflicts**: Completely independent services

## 📋 Prerequisites

1. **Install Serverless Framework**:
   ```bash
   npm install -g serverless
   ```

2. **Configure AWS CLI**:
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Enter your default region (e.g., us-east-1)
   ```

3. **Install Dependencies**:
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
SIDECAR_URL="https://your-sidecar-url.com"

# Printer API
PRINTER_URL="https://wowbook.co.uk"
PRINTER_API_EMAIL="vpardis@gmail.com"
PRINTER_API_PASSWORD="C410r135!"

# Stripe (if using)
STRIPE_SECRET_KEY="sk_test_your_stripe_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

## 🚀 Deployment Steps

### 1. Test Locally First
```bash
npm run offline
# Test at http://localhost:3001/api/stripe-webhook
```

### 2. Deploy to Development
```bash
npm run deploy:dev
```

### 3. Deploy to Production
```bash
npm run deploy:prod
```

## 📡 API Endpoints (After Deployment)

Your sidecar will be available at:
- `https://your-api-gateway-url.amazonaws.com/dev/api/stripe-webhook`
- `https://your-api-gateway-url.amazonaws.com/dev/api/printer-status-webhook`
- `https://your-api-gateway-url.amazonaws.com/dev/api/order-status-webhook`
- `https://your-api-gateway-url.amazonaws.com/dev/api/password-reset`

## 🔗 Connect to Admin Panel

Update your admin panel to call the sidecar endpoints:
```javascript
const SIDECAR_URL = 'https://your-api-gateway-url.amazonaws.com/dev'
```

## 🛡️ Safety Features

- **Separate AWS Account/Region**: No shared resources
- **Independent Lambda Functions**: Each endpoint is isolated
- **Rollback Capability**: `serverless remove` to undo deployment
- **Environment Separation**: Dev/Prod stages

## 📊 Monitoring

- **CloudWatch Logs**: Automatic logging
- **API Gateway Metrics**: Request monitoring
- **Lambda Metrics**: Function performance

## 🆘 Rollback (If Needed)

```bash
serverless remove --stage prod
```

This will completely remove the sidecar service without affecting your admin panel.
