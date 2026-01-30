const JWT = require('jsonwebtoken');
const User = require('../model/userSchema.js');

// Verify JWT Token
const verifyToken = (req, res, next) => {
    let token = (req.cookies && req.cookies.token) || null;
    
    // Try to get token from Authorization header if not in cookies
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No token provided"
        });
    }
    
    try {
        const payload = JWT.verify(token, process.env.JWT_SECRET);
        req.user = { 
            id: payload.id, 
            email: payload.email, 
            isAdmin: payload.isAdmin 
        };
        next();
    } catch (error) {
        return res.status(401).json({
            success: false, 
            message: "Unauthorized: Invalid or expired token"
        });
    }
};

// Verify Admin Role
const verifyAdmin = async (req, res, next) => {
    try {
        // Check if user is already verified by verifyToken
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No user data"
            });
        }

        // Quick check using token data
        if (req.user.isAdmin) {
            // Verify user still exists in database for security
            const user = await User.findById(req.user.id);
            if (!user || !user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: User is not an admin"
                });
            }
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Admin access required"
            });
        }
    } catch (error) {
        console.error('Admin verification error:', error);
        return res.status(403).json({
            success: false,
            message: "Forbidden: Error verifying admin status"
        });
    }
};

module.exports = { verifyToken, verifyAdmin };
