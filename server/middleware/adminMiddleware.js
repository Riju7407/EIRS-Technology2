const jwt = require('jsonwebtoken');
const User = require('../model/userSchema.js');

const adminMiddleware = async (req, res, next) => {
    try {
        // Try to get token from cookies first, then from Authorization header
        let token = req.cookies.token;
        
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        
        if (!token) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Admins only"
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // First check if isAdmin is in the token itself (faster)
        if (decoded.isAdmin) {
            // Still verify user exists in database for security
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: User not found"
                });
            }
            return next();
        }
        
        // If not in token, check database
        const user = await User.findById(decoded.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Admins only"
            });
        }
        next();
    } catch (error) {
        console.error('Admin middleware error:', error.message);
        res.status(403).json({
            success: false,
            message: "Forbidden: Admins only"
        });
    }
}
module.exports = {
    adminMiddleware
};