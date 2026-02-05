# OTP-Based Password Reset System Documentation

## Overview
The EIRS Technology platform now has a comprehensive OTP (One-Time Password) based password reset and change password system. Users can securely reset or change their password using email-based OTP verification.

## Features

### 1. **Request OTP**
- Users can request an OTP for password reset or change
- OTP is sent to the user's registered email
- Valid for 10 minutes from request time

### 2. **Verify OTP**
- Users verify their identity using the 6-digit OTP sent to their email
- OTP verification is required before password reset

### 3. **Password Reset/Change**
- After OTP verification, users can set a new password
- Password must be at least 6 characters long
- Users must confirm their new password

### 4. **Email Notifications**
- Beautiful formatted emails with OTP codes
- Clear instructions and security warnings
- Professional branding with EIRS Technology logo

## Backend Implementation

### API Endpoints

#### 1. Request OTP
```
POST /auth/request-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "purpose": "forgot-password" // or "change-password"
}

Response:
{
  "success": true,
  "message": "OTP has been sent to user@example.com. Valid for 10 minutes."
}
```

#### 2. Verify OTP
```
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

Response:
{
  "success": true,
  "message": "OTP verified successfully",
  "verified": true
}
```

#### 3. Reset Password (Forgot Password Flow)
```
POST /auth/reset-password-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword@123",
  "confirmPassword": "NewPassword@123"
}

Response:
{
  "success": true,
  "message": "Password has been reset successfully. Please login with your new password."
}
```

#### 4. Change Password (Logged-in Users - Optional OTP)
```
POST /auth/change-password-otp
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword@123",
  "confirmPassword": "NewPassword@123"
}

Response:
{
  "success": true,
  "message": "Password has been changed successfully"
}
```

### Database Schema Updates

The User schema has been updated with new fields:

```javascript
{
  otp: {
    type: String,
    default: undefined
  },
  otpExpiry: {
    type: Date,
    default: undefined
  },
  otpPurpose: {
    type: String,
    enum: ['forgot-password', 'change-password'],
    default: undefined
  }
}
```

### Email Service

Location: `server/services/emailService.js`

Features:
- Generates 6-digit OTP
- Sends formatted HTML emails via Nodemailer
- Beautiful email templates with security warnings
- Includes OTP validity information

### Configuration

Set the following environment variables in `.env`:

```
EMAIL_USER=info@eirstechnology.com
EMAIL_PASSWORD=your_app_password_here
```

**Note:** For Gmail, you need to:
1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password
3. Use the App Password in EMAIL_PASSWORD

## Frontend Implementation

### Components

#### ForgotPasswordPage (`client/src/pages/ForgotPasswordPage.js`)

A multi-step form for password reset:

**Step 1: Email Input**
- User enters their registered email
- Request OTP is sent

**Step 2: OTP Verification**
- User enters 6-digit OTP from email
- Real-time countdown timer (10 minutes)
- Can request new OTP or change email

**Step 3: New Password**
- User sets new password
- Password confirmation required
- Password strength requirements displayed

### API Integration

Location: `client/src/services/api.js`

Methods added to `authService`:

```javascript
authService.requestPasswordChangeOTP(email, purpose)
authService.verifyOTP(email, otp)
authService.resetPasswordWithOTP(email, otp, newPassword, confirmPassword)
authService.changePasswordWithOTP(email, otp, newPassword, confirmPassword)
```

### Styling

Location: `client/src/styles/ForgotPassword.css`

Features:
- Gradient backgrounds consistent with EIRS brand
- Responsive design (mobile-friendly)
- Animations and transitions
- Clear error and success messages
- Security warning section

### Routes

- `/forgot-password` - Main forgot password page
- Can be linked from Sign In page

## Security Considerations

### ✅ Implemented Security Features

1. **OTP Expiration**: OTP expires in 10 minutes
2. **One-time Use**: OTP is cleared after successful password reset
3. **Email Verification**: Only registered email can reset password
4. **Password Hashing**: Passwords are hashed using bcrypt
5. **HTTPS Only**: Configure in production environment
6. **Rate Limiting**: Recommended to implement rate limiting
7. **Security Warnings**: Users informed about not sharing OTP

### 🔒 Recommended Practices

1. Always use HTTPS in production
2. Implement rate limiting for OTP requests
3. Implement CSRF protection
4. Log password reset attempts for audit trails
5. Notify users of password changes via email

## User Flow

### Forgot Password Flow

```
1. User clicks "Forgot Password" on Sign In page
2. User enters email address
3. System sends OTP to registered email
4. User receives email with 6-digit OTP
5. User enters OTP on website
6. System verifies OTP (10 minute expiry)
7. User sets new password
8. System updates password
9. User redirected to Sign In page
10. User can login with new password
```

### Change Password Flow (Logged-in Users)

```
1. User goes to Account Settings
2. User requests to change password
3. System sends OTP to registered email
4. User enters OTP
5. System verifies OTP
6. User sets new password
7. System updates password
8. User session remains active
```

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "No account found with this email" | Email not registered | Register account first |
| "Invalid or expired OTP" | Wrong OTP or expired (>10 min) | Request new OTP |
| "Passwords do not match" | Password confirmation mismatch | Re-enter matching passwords |
| "New password must be at least 6 characters" | Password too short | Use stronger password |
| "Failed to send OTP" | Email service issue | Check EMAIL_USER and EMAIL_PASSWORD in .env |

## Testing

### Manual Testing Checklist

- [ ] Request OTP with valid email
- [ ] Verify OTP received in email
- [ ] Attempt to reset password with correct OTP
- [ ] Attempt to reset password with incorrect OTP
- [ ] Attempt to use expired OTP (wait >10 min)
- [ ] Verify new password works for login
- [ ] Test with invalid email address
- [ ] Test on mobile devices
- [ ] Test form validations

### Automated Testing (Todo)

```javascript
// Example test cases
describe('OTP Password Reset', () => {
  test('should send OTP to registered email');
  test('should reject invalid OTP');
  test('should reject expired OTP');
  test('should successfully reset password with valid OTP');
  test('should handle invalid email gracefully');
});
```

## Future Enhancements

1. **SMS OTP**: Add SMS-based OTP as alternative to email
2. **Biometric Login**: Fingerprint/Face ID for password-less authentication
3. **Recovery Codes**: Backup recovery codes for account access
4. **Security Questions**: Additional security layer
5. **2FA**: Two-factor authentication with authenticator apps
6. **Login Alerts**: Notify user of password changes
7. **Device Management**: Login from specific devices

## Troubleshooting

### OTP Not Received

1. Check email spam/junk folder
2. Verify EMAIL_USER and EMAIL_PASSWORD in .env
3. Check Gmail App Password (if using Gmail)
4. Check email service logs in server console

### Email Service Issues

1. Verify `nodemailer` is installed: `npm list nodemailer`
2. Check EMAIL_USER format (must be valid email)
3. Test with simple email address first
4. Check for firewall/network issues

### OTP Expired

1. OTP valid for exactly 10 minutes
2. User must request new OTP after expiry
3. No way to extend OTP validity (by design)

## Support & Contact

For issues or questions regarding the OTP system:
- Email: support@eirstechnology.com
- Documentation: See EIRS Technology Wiki
- Developers: Check server logs for detailed error messages

## Version History

- **v1.0** (2026-02-05) - Initial OTP system implementation
  - Email-based OTP verification
  - Forgot password flow
  - Change password flow (optional)
  - Email notifications with templates

---

**Last Updated**: February 5, 2026
**Status**: Active
**Maintenance**: Regular security updates recommended
