const userSchema = require("../model/userSchema");
const emailvalidator = require("email-validation");
const bcrypt = require("bcrypt");
const { generateOTP, sendOTPEmail, sendPasswordResetEmail } = require("../services/emailService");

// Signup logic

const signup = async (req, res, next) => {
    try {
        const {name, phoneNumber, address, email, password, confirmPassword} = req.body;

        console.log('Signup attempt:', {name, email, phoneNumber});

        if(!name || !phoneNumber || !address || !email || !password || !confirmPassword){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match"
            });
        }

        if(password.length < 6){
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Prepare user data
        const userData = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phoneNumber: phoneNumber.toString().trim(),
            address: address.trim(),
            password: password
        };

        const userInfo = new userSchema(userData);
        const savedUser = await userInfo.save();
        
        console.log('User created successfully:', savedUser._id);
        
        res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email
            }
        });
    } catch (error) {
        console.error('Signup error details:', error);
        
        if(error.code === 11000){
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }
        
        // Handle validation errors
        if(error.errors) {
            const errorMessages = Object.values(error.errors).map(err => err.message).join(', ');
            console.error('Validation errors:', errorMessages);
            return res.status(400).json({
                success: false,
                message: errorMessages || "Validation error"
            });
        }
        
        return res.status(500).json({
            success: false,
            message: error.message || "Error during signup"
        });
    }
}


// Signin logic
const signin = async (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            success: false,
            message: "Email and Password are required"
        });
    }

    try {
        const user = await userSchema.findOne({email: email.toLowerCase().trim()});

        if(!user || !(await bcrypt.compare(password, user.password))){
            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

        const token = user.jwtToken();
        
        const cookieOptions = {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        };

        res.cookie('token', token, cookieOptions);
        res.status(200).json({
            success: true,
            message: "Signed in successfully",
            token: token,
            data: {
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
}

// Get user details logic
const getuser = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const user = await userSchema.findById(userId, {password: 0});
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error"
        });next(error);
    }
}

// Logout logic
const logout = async (req, res, next) => {
    try {
        const cookieOptions = {
            maxAge: 0,
            httpOnly: true,
        };
        res.cookie('token', null, cookieOptions);
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error"
        });next(error);
    }
}

// Edit User Profile logic to be implemented
const editUserProfile = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const user = await userSchema.findById(userId, {password: 0});
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error"
        });next(error);
    }
}

//Post Edit User Profile logic to be implemented
const postEditUserProfile = async (req, res, next) => {
    try{
        const { name, phoneNumber, address, email, city, state, pincode } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!name || !phoneNumber || !address) {
            return res.status(400).json({
                success: false,
                message: "Name, phone number, and address are required"
            });
        }

        // Update user with all fields
        const updatedUser = await userSchema.findByIdAndUpdate(
            userId, 
            {
                $set: {
                    name: name.trim(),
                    phoneNumber: phoneNumber.toString().trim(),
                    address: address.trim(),
                    email: email || undefined,
                    city: city?.trim() || undefined,
                    state: state?.trim() || undefined,
                    pincode: pincode?.toString().trim() || undefined
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber,
                address: updatedUser.address,
                city: updatedUser.city,
                state: updatedUser.state,
                pincode: updatedUser.pincode
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error while updating profile"
        });
    }
}

// Change Password logic
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
        }

        // Get user from database
        const user = await userSchema.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify current password
        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Check if new password is same as current
        const isNewPasswordSame = await bcrypt.compare(newPassword, user.password);
        if (isNewPasswordSame) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password"
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error while changing password"
        });
    }
}

// Forgot Password logic - Send reset email
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Check if user exists
        const user = await userSchema.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email"
            });
        }

        // Generate reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

        // Store reset token in user document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiry = resetTokenExpiry;
        await user.save();

        // Send reset link email
        const frontendUrl = process.env.FRONTEND_URL || 
            (process.env.NODE_ENV === 'production' ? 'https://eirs.vercel.app' : 'http://localhost:3000');
        await sendPasswordResetEmail(user.email, resetToken, frontendUrl);

        res.status(200).json({
            success: true,
            message: "Password reset link has been sent to your email. Please check your inbox."
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error while processing forgot password"
        });
    }
}

// Reset Password logic
const resetPassword = async (req, res, next) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, reset token, and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
        }

        // Find user and verify reset token
        const user = await userSchema.findOne({ 
            email: email.toLowerCase().trim(),
            resetPasswordToken: resetToken,
            resetPasswordExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        // Update password and clear reset token
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password has been reset successfully"
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error while resetting password"
        });
    }
}

// Request OTP for Password Change or Forgot Password
const requestPasswordChangeOTP = async (req, res, next) => {
    try {
        const { email, purpose } = req.body; // purpose: 'change-password' or 'forgot-password'

        if (!email || !purpose) {
            return res.status(400).json({
                success: false,
                message: "Email and purpose are required"
            });
        }

        if (!['change-password', 'forgot-password'].includes(purpose)) {
            return res.status(400).json({
                success: false,
                message: "Invalid purpose. Must be 'change-password' or 'forgot-password'"
            });
        }

        // Check if user exists
        const user = await userSchema.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email"
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Store OTP in user document
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        user.otpPurpose = purpose;
        await user.save();

        // Send OTP email
        try {
            await sendOTPEmail(email, otp, purpose);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP. Please check your email configuration."
            });
        }

        res.status(200).json({
            success: true,
            message: `OTP has been sent to ${email}. Valid for 10 minutes.`
        });
    } catch (error) {
        console.error('Request OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error while requesting OTP"
        });
    }
}

// Verify OTP
const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        // Find user with matching OTP
        const user = await userSchema.findOne({ 
            email: email.toLowerCase().trim(),
            otp: otp,
            otpExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            verified: true
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error while verifying OTP"
        });
    }
}

// Reset Password with OTP
const resetPasswordWithOTP = async (req, res, next) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP, new password, and confirm password are required"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
        }

        // Find user with matching OTP
        const user = await userSchema.findOne({ 
            email: email.toLowerCase().trim(),
            otp: otp,
            otpExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        // Update password and clear OTP
        user.password = newPassword;
        user.otp = undefined;
        user.otpExpiry = undefined;
        user.otpPurpose = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password has been reset successfully. Please login with your new password."
        });
    } catch (error) {
        console.error('Reset password with OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error while resetting password"
        });
    }
}

// Change Password with OTP (for logged-in users)
const changePasswordWithOTP = async (req, res, next) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;
        const userId = req.user?.id;

        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP, new password, and confirm password are required"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
        }

        // Find user with matching OTP
        const user = await userSchema.findOne({ 
            email: email.toLowerCase().trim(),
            otp: otp,
            otpExpiry: { $gt: new Date() },
            otpPurpose: 'change-password'
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        // Update password and clear OTP
        user.password = newPassword;
        user.otp = undefined;
        user.otpExpiry = undefined;
        user.otpPurpose = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password has been changed successfully"
        });
    } catch (error) {
        console.error('Change password with OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error while changing password"
        });
    }
}

module.exports = {
    signup,
    signin,
    getuser,
    logout,
    editUserProfile,
    postEditUserProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    requestPasswordChangeOTP,
    verifyOTP,
    resetPasswordWithOTP,
    changePasswordWithOTP
};