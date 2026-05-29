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

        // verifyToken middleware pehle hi req.user set kar chuka hai
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Direct token data check
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Admin access required"
            });
        }

        // Optional DB verification
        const user = await User.findById(req.user.id);

        if (!user || !user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Admin not found"
            });
        }

        next();

    } catch (error) {
        console.error("verifyAdmin error:", error);

        return res.status(500).json({
            success: false,
            message: "Admin verification failed"
        });
    }
};

module.exports = { verifyToken, verifyAdmin };
