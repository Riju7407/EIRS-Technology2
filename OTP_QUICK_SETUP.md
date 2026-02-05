# OTP Password Reset System - Quick Setup Guide

## ✅ What's Implemented

### Backend Components
- ✅ OTP generation service (`server/services/emailService.js`)
- ✅ Email service with beautiful HTML templates
- ✅ User schema updated with OTP fields
- ✅ 4 new API endpoints for OTP flow
- ✅ Nodemailer dependency installed
- ✅ Environment variables for email configuration

### Frontend Components
- ✅ ForgotPasswordPage with 3-step form
- ✅ OTP request, verification, and password reset
- ✅ Beautiful styling with animations
- ✅ Responsive design (mobile-friendly)
- ✅ Error handling and user feedback
- ✅ 10-minute OTP timer
- ✅ API service methods integrated

### Routes & Navigation
- ✅ `/forgot-password` route configured
- ✅ "Forgot Password?" link on Sign In page
- ✅ Automatic redirect to Sign In after password reset

## 🔧 Configuration Required

### Step 1: Set Up Email Service

Update `.env` file with your email credentials:

```env
EMAIL_USER=info@eirstechnology.com
EMAIL_PASSWORD=your_app_password
```

### For Gmail:
1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Generate App Password
4. Use the 16-character password as `EMAIL_PASSWORD`

### For Other Email Providers:
- Use your email and application password
- Some providers may require SMTP configuration

## 🚀 How to Use

### For Users: Forgot Password Flow

1. Go to Sign In page
2. Click "Forgot Password?"
3. Enter registered email address
4. Click "Send OTP"
5. Check email for 6-digit OTP
6. Enter OTP on website
7. Click "Verify OTP"
8. Set new password
9. Click "Reset Password"
10. Login with new password

### For Developers: API Integration

```javascript
// Request OTP
const response = await authService.requestPasswordChangeOTP(
  'user@example.com',
  'forgot-password'
);

// Verify OTP
const verified = await authService.verifyOTP(
  'user@example.com',
  '123456'
);

// Reset Password
const result = await authService.resetPasswordWithOTP(
  'user@example.com',
  '123456',
  'NewPassword@123',
  'NewPassword@123'
);
```

## 📝 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/request-otp` | POST | Request OTP for password reset |
| `/auth/verify-otp` | POST | Verify OTP validity |
| `/auth/reset-password-otp` | POST | Reset password with OTP |
| `/auth/change-password-otp` | POST | Change password with OTP (logged-in users) |

## 🔒 Security Features

- ✅ 6-digit random OTP
- ✅ 10-minute expiry time
- ✅ OTP cleared after use
- ✅ Email verification required
- ✅ Password hashing with bcrypt
- ✅ Secure email with warnings
- ✅ No sensitive data in logs

## 🧪 Testing

### Test Email Sending:
```bash
# From server directory
node -e "
const { generateOTP, sendOTPEmail } = require('./services/emailService');
sendOTPEmail('your-email@example.com', '123456', 'forgot-password')
  .then(() => console.log('Email sent!'))
  .catch(err => console.error('Error:', err));
"
```

### Test API Endpoints with curl:

```bash
# Request OTP
curl -X POST http://localhost:5000/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","purpose":"forgot-password"}'

# Verify OTP
curl -X POST http://localhost:5000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'

# Reset Password
curl -X POST http://localhost:5000/auth/reset-password-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "otp":"123456",
    "newPassword":"NewPass@123",
    "confirmPassword":"NewPass@123"
  }'
```

## 📊 Database Fields

New fields added to User schema:

```javascript
otp: String              // 6-digit code
otpExpiry: Date        // Expiry timestamp
otpPurpose: String     // 'forgot-password' or 'change-password'
```

## 🐛 Troubleshooting

### Issue: Email not sending
**Solution**: 
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- For Gmail, verify App Password is used
- Check server logs for detailed error messages

### Issue: OTP not validating
**Solution**:
- Ensure OTP hasn't expired (10 min limit)
- Check OTP format (must be 6 digits)
- Verify email matches registered account

### Issue: Password not updating
**Solution**:
- Ensure password is at least 6 characters
- Confirm password confirmation matches
- Check database connection

## 📱 Frontend File Locations

```
client/src/
├── pages/
│   └── ForgotPasswordPage.js      # Main forgot password component
├── services/
│   └── api.js                      # API service methods
└── styles/
    └── ForgotPassword.css          # Styling
```

## 🔌 Backend File Locations

```
server/
├── controller/
│   └── authController.js           # OTP request/verify/reset handlers
├── router/
│   └── authRouter.js               # OTP endpoint routes
├── services/
│   └── emailService.js             # Email sending logic
├── model/
│   └── userSchema.js               # Updated user schema
└── .env                            # Email configuration
```

## 📈 Next Steps / Future Enhancements

1. **SMS OTP**: Add SMS-based OTP alternative
2. **Rate Limiting**: Implement rate limiting for OTP requests
3. **Audit Logs**: Log password reset attempts
4. **2FA**: Two-factor authentication
5. **Security Questions**: Additional verification layer
6. **Login Alerts**: Email notification on password change

## 🎓 Learning Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Bcrypt](https://www.npmjs.com/package/bcrypt)

## 💬 Support

For issues or questions:
1. Check the detailed documentation: `OTP_PASSWORD_RESET_DOCUMENTATION.md`
2. Review server logs for error messages
3. Test API endpoints with curl/Postman
4. Verify environment variables are set correctly

## ✨ Features Recap

- 🔐 Secure OTP-based password reset
- 📧 Beautiful email notifications
- ⏱️ 10-minute OTP expiry
- 📱 Mobile-responsive UI
- ♿ Accessible form design
- 🎨 EIRS brand-consistent styling
- ⚡ Real-time countdown timer
- 🔔 Clear error messages
- 🎯 Multi-step verification flow
- 🚀 Production-ready code

---

**Status**: Ready for Production
**Version**: 1.0
**Date**: February 5, 2026
