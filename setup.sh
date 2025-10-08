#!/bin/bash

echo "🚀 Setting up Mailchimp Sidecar Service Test Environment"
echo "=================================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database (SAME as your main app - this is crucial!)
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
EOF
    echo "✅ .env file created!"
    echo "⚠️  Please edit .env with your actual values before testing"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "🧪 Ready to test! Run:"
echo "   node test-sidecar.js"
echo ""
echo "📋 Don't forget to:"
echo "   1. Edit .env with your actual values"
echo "   2. Get Mailchimp API key from https://mailchimp.com/developer/"
echo "   3. Get Stripe keys from https://dashboard.stripe.com/apikeys"
echo "   4. Use your actual MongoDB connection string"
