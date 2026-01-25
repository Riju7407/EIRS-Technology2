const userSchema = require("../model/userSchema");
const emailvalidator = require("email-validation");
const bcrypt = require("bcrypt");

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
        const userData = await userSchema.findByIdAndUpdate({_id:req.user.id}, {$set:{name:req.body.name, phoneNumber:req.body.phoneNumber, address:req.body.address, email:req.body.email}});
        res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User not found"
        });next(error);
    }
}


module.exports = {
    signup,
    signin,
    getuser,
    logout,
    editUserProfile,
    postEditUserProfile
};