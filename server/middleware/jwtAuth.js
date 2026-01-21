const JWT = require('jsonwebtoken');

const jwtAuth = (req, res, next) => {
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
        req.user = { id: payload.id, email: payload.email, isAdmin: payload.isAdmin };
    } catch (error) {
        return res.status(401).json({
            success: false, 
            message: "Unauthorized: Invalid token"
        });
    }
    next();
}

module.exports = jwtAuth;