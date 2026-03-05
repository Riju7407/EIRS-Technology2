# FORGOT PASSWORD - QUICK FIX (5 MINUTES)

## The Problem
❌ Forgot password not working after Vercel/Render deployment

## Root Causes Found
1. **Invalid Gmail credentials** on Render
2. **Missing Render backend URL** in password reset flow
3. **No FRONTEND_URL** configured on Render

## IMMEDIATE ACTION REQUIRED

### 1️⃣ Generate Gmail App Password (2 minutes)
```
Go to: myaccount.google.com → Security → App passwords
Select: Mail + Your Device
Copy: 16-character password (remove spaces)
Result: Should look like "abcd1234efgh5678"
```

### 2️⃣ Update Render Dashboard (2 minutes)
```
Dashboard → Your Service → Environment Variables

Change these 2 variables:

1. EMAIL_PASSWORD = [Your 16-char App Password, NO SPACES]
2. FRONTEND_URL = https://your-vercel-url.vercel.app
   
   (Find your Vercel URL at vercel.com/dashboard)
```

### 3️⃣ Redeploy (1 minute)
```
Render Dashboard → Your Service → Redeploy
Watch the logs for: ✅ Email server is ready
```

### 4️⃣ Test It
```
Your Website → Sign In → Forgot Password?
Enter your email → Should receive OTP in 1-2 minutes
```

---

## What Changed in Your Code
✅ `render.yaml` - Added FRONTEND_URL variable  
✅ `emailService.js` - Better error messages  
✅ `authController.js` - Production logging  

---

## Still Not Working?
1. Check Render logs after redeploy
2. Verify App Password has NO SPACES
3. Make sure FRONTEND_URL matches your actual Vercel domain
4. Hard refresh browser (Ctrl+Shift+R)
5. Try in incognito mode

See FORGOT_PASSWORD_FIX_GUIDE.md for detailed troubleshooting.
