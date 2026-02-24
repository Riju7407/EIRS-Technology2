const nodemailer = require('nodemailer');

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email transporter error:', error.message);
    } else {
        console.log('✅ Email server is ready to send emails');
    }
});

// Generate OTP (6 digit)
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, purpose) => {
    try {
        const subject = purpose === 'forgot-password' 
            ? 'Password Reset OTP - EIRS Technology'
            : 'Change Password OTP - EIRS Technology';

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">EIRS Technology</h1>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">Security Solutions</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
                    <h2 style="color: #333; margin-top: 0;">Verify Your Identity</h2>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        Hello,
                    </p>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        ${purpose === 'forgot-password' 
                            ? 'You requested a password reset for your EIRS Technology account.' 
                            : 'You requested to change your password for your EIRS Technology account.'}
                        Use the OTP below to proceed:
                    </p>
                    
                    <div style="background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; margin: 30px 0; text-align: center;">
                        <p style="margin: 0; color: #999; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your OTP Code</p>
                        <h1 style="margin: 15px 0 0 0; color: #667eea; font-size: 48px; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
                    </div>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        <strong style="color: #333;">Important:</strong>
                    </p>
                    <ul style="color: #666; font-size: 15px; line-height: 1.8;">
                        <li>This OTP is valid for 10 minutes</li>
                        <li>Do not share this OTP with anyone</li>
                        <li>If you did not request this, please ignore this email</li>
                    </ul>
                    
                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; color: #856404; font-size: 14px;">
                            ⚠️ For security reasons, never share your OTP with anyone, including EIRS Technology staff.
                        </p>
                    </div>
                    
                    <p style="color: #999; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        This is an automated email. Please do not reply to this message.<br>
                        <strong>EIRS Technology</strong> | Advanced Security Solutions
                    </p>
                </div>
            </div>
        `;

        const mailOptions = {
            from: `"EIRS Technology" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};

// Send password reset email with link
const sendPasswordResetEmail = async (email, resetToken, frontendUrl) => {
    try {
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">EIRS Technology</h1>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">Security Solutions</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
                    <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">Hello,</p>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password for your EIRS Technology account. 
                        Click the button below to reset your password:
                    </p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${resetLink}" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                            Reset My Password
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.6;">
                        Or copy and paste this link into your browser:
                    </p>
                    <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 13px; color: #555;">
                        ${resetLink}
                    </p>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        <strong style="color: #333;">Important:</strong>
                    </p>
                    <ul style="color: #666; font-size: 15px; line-height: 1.8;">
                        <li>This link is valid for <strong>1 hour</strong></li>
                        <li>If you did not request this, please ignore this email</li>
                        <li>Your password will not change until you click the link and set a new one</li>
                    </ul>
                    
                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; color: #856404; font-size: 14px;">
                            ⚠️ For security, never share this link with anyone, including EIRS Technology staff.
                        </p>
                    </div>
                    
                    <p style="color: #999; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        This is an automated email. Please do not reply to this message.<br>
                        <strong>EIRS Technology</strong> | Advanced Security Solutions
                    </p>
                </div>
            </div>
        `;

        const mailOptions = {
            from: `"EIRS Technology" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Link - EIRS Technology',
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent successfully to ${email}`);
        console.log(`Reset link: ${resetLink}`);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail,
    sendPasswordResetEmail
};
