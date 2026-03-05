# Forgot Password Fix Guide - Complete Setup

## Problem Summary
The forgot password feature is not working after deploying to Vercel (frontend) and Render (backend) because:
1. ❌ Gmail App Password is invalid or incorrect
2. ❌ FRONTEND_URL is not set on Render (defaults to localhost:3000)
3. ❌ Email service configuration is missing proper credentials

---

## ✅ Step 1: Generate Gmail App Password (REQUIRED)

### Why?
Gmail no longer allows regular passwords for third-party apps. You must use a 16-character **App Password** instead.

### How to Generate:

1. **Enable 2-Step Verification** on your Gmail account:
   - Go to [myaccount.google.com](https://myaccount.google.com)
   - Click **Security** (left sidebar)
   - Scroll to "2-Step Verification"
   - Click **Enable 2-Step Verification** (if not already enabled)
   - Follow the prompts with your phone

2. **Generate App Password**:
   - Go back to [myaccount.google.com](https://myaccount.google.com)
   - Click **Security** (left sidebar)
   - Scroll to "App passwords" (appears only after 2-Step Verification is enabled)
   - Click **App passwords**
   - Select **Mail** from the first dropdown
   - Select **Windows Computer** (or your device) from the second dropdown
   - Click **Generate**
   - Copy the 16-character password shown (it will be formatted like: `xxxx xxxx xxxx xxxx`)

3. **Remove Spaces from Password**:
   - Gmail shows the password with spaces
   - Remove all spaces before using it
   - Example: `xxxx xxxx xxxx xxxx` → `xxxxxxxxxxxxxxxx`

---

## ✅ Step 2: Update Render Environment Variables

### Where to Update:
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your "eirs-backend" service
3. Click on it to view details
4. Go to **Environment** tab (or Settings → Environment)

### What to Change:

| Variable | Current Value | New Value |
|----------|---------------|-----------|
| `EMAIL_PASSWORD` | `alvkfppkptaptzta` | Your 16-character Gmail App Password (NO SPACES) |
| `FRONTEND_URL` | (not set) | `https://your-vercel-url.vercel.app` |

### Example Configuration:
```
EMAIL_USER: technologyeirs@gmail.com
EMAIL_PASSWORD: xxxxxxxxxxxx     ← Your 16-char Gmail App Password (no spaces)
FRONTEND_URL: https://eirs.vercel.app   ← Your actual Vercel frontend URL
NODE_ENV: production
```

### To Find Your Vercel URL:
- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Find your EIRS project
- The URL is shown at the top (e.g., `https://eirs-technology-production-xyz.vercel.app`)
- Use this exact URL

---

## ✅ Step 3: Verify Configuration

### Check Server Logs on Render:
1. Go to your service on Render
2. Click **Logs** tab
3. Restart the service (redeploy)
4. Look for messages like:
   ```
   ✅ Email server is ready to send emails
   ```
   **OR**
   ```
   ❌ Email transporter error: Invalid login...
   ```

### What These Mean:
- ✅ **Email ready** = Configuration is correct, forgot password will work
- ❌ **Email error** = App Password is wrong or not updated properly

---

## ✅ Step 4: Test Forgot Password Flow

### Test Steps:
1. Go to your Vercel frontend: `https://your-domain.vercel.app`
2. Click **Sign In**
3. Click **Forgot Password?**
4. Enter an email address (use `technologyeirs@gmail.com` to test)
5. Click **Send OTP**
6. Check gmail inbox for OTP email
7. If you don't see it, check spam folder
8. Enter the OTP and set new password

### If Email Still Doesn't Arrive:
1. Check server logs for errors
2. Verify FRONTEND_URL is set correctly
3. Re-generate Gmail App Password (the previous one might not have spaces removed)
4. Re-deploy Render service to apply new environment variables

---

## 📋 Checklist

Before declaring it fixed, ensure:

- [ ] Gmail 2-Step Verification is enabled
- [ ] Gmail App Password generated (16 characters)
- [ ] Spaces removed from App Password
- [ ] `EMAIL_PASSWORD` updated on Render
- [ ] `FRONTEND_URL` updated on Render (with your actual Vercel URL)
- [ ] Render service redeployed (redeploy triggered)
- [ ] Server logs show ✅ Email server is ready
- [ ] Test forgot password works end-to-end
- [ ] OTP arrives in email within 10 minutes
- [ ] Password reset completes successfully

---

## 🚨 Troubleshooting

### "Failed to send OTP email. Please check your email address..."
**Solution:** App Password is incorrect
1. Re-generate App Password from Gmail
2. Make sure no spaces in the password
3. Update Render and redeploy

### "OTP generated (dev mode — email failed). Check the server console..."
**This shouldn't happen in production.** The message means NODE_ENV is not set to `production`.
1. Check Render environment: `NODE_ENV=production`
2. Redeploy service

### OTP arrives but reset link doesn't work
**Solution:** FRONTEND_URL is wrong or missing
1. Check you updated `FRONTEND_URL` on Render
2. Verify it matches your Vercel domain exactly
3. Redeploy

### Still not working?
1. Check recent changes to Render logs
2. Ensure both EMAIL_PASSWORD and FRONTEND_URL are set
3. Restart the Render service
4. Try in an incognito/private browser window (clear cache)
5. Contact support with the Render service logs

---

## 📝 Current Configuration Reference

### Local Development (.env - Server)
```
EMAIL_USER=technologyeirs@gmail.com
EMAIL_PASSWORD=[Your Gmail App Password]
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Production (Render Dashboard)
```
EMAIL_USER=technologyeirs@gmail.com
EMAIL_PASSWORD=[Your Gmail App Password - NO SPACES]
FRONTEND_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
```

---

## Files Modified
- ✅ `/render.yaml` - Added FRONTEND_URL
- ✅ `/server/services/emailService.js` - Enhanced error messages
- ✅ `/server/controller/authController.js` - Better logging
