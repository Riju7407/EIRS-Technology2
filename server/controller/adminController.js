const User = require('../model/userSchema.js');
const Contact = require('../model/contactSchema.js');



// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0});
        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found"
            });
        }
        return res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        next(error);
    }
}

//get all contacts
const contactForm = async (req, res, next) => {
    try {
        const contacts = await Contact.find();
        if (!contacts || contacts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No contacts found"
            });
        }
        return res.status(200).json({
            success: true,
            data: contacts
        });
    } catch (error) {
        next(error);
    }
}

//delete user by id
const deleteUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

// Promote user to admin
const promoteToAdmin = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndUpdate(
            userId,
            { isAdmin: true },
            { new: true, runValidators: false }
        );
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "User promoted to admin successfully",
            data: user
        });
    } catch (error) {
        next(error);
    }
}

// Check if current user is admin
const checkAdminStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            data: {
                isAdmin: user.isAdmin,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllUsers,
    contactForm,
    deleteUserById,
    promoteToAdmin,
    checkAdminStatus
};