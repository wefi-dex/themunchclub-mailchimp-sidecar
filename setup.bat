@echo off
echo 🚀 Setting up Mailchimp Sidecar Service Test Environment
echo ==================================================

REM Check if .env exists
if not exist .env (
    echo 📝 Creating .env file...
    (
        echo # Database (SAME as your main app - this is crucial!^)
        echo DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database_name"
        echo.
        echo # Mailchimp Configuration
        echo MAILCHIMP_API_KEY="your_mailchimp_api_key_here"
        echo MAILCHIMP_SERVER_PREFIX="us1"
        echo.
        echo # Stripe Configuration  
        echo STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
        echo STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
        echo.
        echo # Email Configuration
        echo ADMIN_EMAIL="vpardis@gmail.com"
        echo FROM_EMAIL="tan@causeverse.io"
        echo.
        echo # App URLs
        echo MAIN_APP_URL="https://your-themunchclub-app.vercel.app"
    ) > .env
    echo ✅ .env file created!
    echo ⚠️  Please edit .env with your actual values before testing
) else (
    echo ✅ .env file already exists
)

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo 🔧 Generating Prisma client...
call npx prisma generate

echo.
echo 🧪 Ready to test! Run:
echo    node test-sidecar.js
echo.
echo 📋 Don't forget to:
echo    1. Edit .env with your actual values
echo    2. Get Mailchimp API key from https://mailchimp.com/developer/
echo    3. Get Stripe keys from https://dashboard.stripe.com/apikeys
echo    4. Use your actual MongoDB connection string

pause
