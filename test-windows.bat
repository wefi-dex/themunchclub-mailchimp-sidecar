@echo off
echo 🧪 Testing Mailchimp Sidecar Service
echo ====================================

echo.
echo 🔍 Checking environment variables...
node -e "const required = ['MAILCHIMP_API_KEY', 'MAILCHIMP_SERVER_PREFIX', 'ADMIN_EMAIL', 'FROM_EMAIL']; const missing = required.filter(key => !process.env[key]); if (missing.length > 0) { console.error('❌ Missing:', missing.join(', ')); process.exit(1); } else { console.log('✅ Environment check passed'); }"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Environment variables missing!
    echo 📝 Please edit .env file with your actual values
    pause
    exit /b 1
)

echo.
echo 🚀 Starting email tests...
node test-comprehensive.js

echo.
echo 📋 Check your email inboxes for test emails:
echo    - vpardis@gmail.com (admin notifications)
echo    - test@example.com (customer emails)
echo.
echo 📊 Check Mailchimp dashboard for delivery status
echo.

pause
