# Windows Testing Guide for Mailchimp Sidecar Service

## 🧪 **Windows Quick Test Setup**

### 1. **Run Setup Script**
Double-click `setup.bat` or run in Command Prompt:
```cmd
cd themunchclub-mailchimp-sidecar
setup.bat
```

### 2. **Set Up Environment Variables**
Edit the `.env` file that was created with your actual values:

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

## 🧪 **Test Commands (Windows)**

### **Test 1: Basic Email Test**
```cmd
node test-sidecar.js
```

### **Test 2: Comprehensive Email Tests**
```cmd
node test-comprehensive.js
```

### **Test 3: Check Environment Variables**
```cmd
node -e "console.log(process.env.MAILCHIMP_API_KEY ? '✅ Set' : '❌ Missing')"
```

### **Test 4: Database Connection**
```cmd
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.count().then(count => console.log('✅ DB Connected, users:', count)).catch(err => console.error('❌ DB Error:', err.message));"
```

## 🔧 **Windows-Specific Troubleshooting**

### **PowerShell Issues:**
If you get PowerShell execution policy errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Node.js Path Issues:**
If `node` command not found:
```cmd
# Add Node.js to PATH or use full path
"C:\Program Files\nodejs\node.exe" test-sidecar.js
```

### **File Permission Issues:**
If you can't create `.env` file:
```cmd
# Run Command Prompt as Administrator
# Or create .env manually in File Explorer
```

## 📧 **What to Check After Testing**

1. **Check Email Inboxes:**
   - `vpardis@gmail.com` for admin notifications
   - `test@example.com` for customer emails

2. **Check Mailchimp Dashboard:**
   - Go to https://mailchimp.com/
   - Check "Reports" → "Sent" for delivery status

3. **Check Console Output:**
   - Look for ✅ success messages
   - Note any ❌ error messages

## 🚀 **Next Steps**

1. **Deploy to Vercel:**
   ```cmd
   npx vercel --prod
   ```

2. **Configure Stripe Webhooks:**
   - Point to your deployed sidecar service URL
   - Test with real payments

## 📊 **Expected Results**

✅ **Console shows:** "✅ Admin notification sent successfully!"  
✅ **Email arrives:** At `vpardis@gmail.com`  
✅ **Mailchimp shows:** Email in sent reports  
✅ **No errors:** In console output  

## 🆘 **Need Help?**

If you get errors, share:
1. The exact error message
2. Which test failed
3. Your `.env` file (remove sensitive values)

Ready to test? Run `setup.bat` first, then `node test-comprehensive.js`! 🚀
