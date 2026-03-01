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
        console.warn(`[jwtAuth] No token provided for ${req.method} ${req.path}`);
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No token provided"
        });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('[jwtAuth] JWT_SECRET is not set in environment!');
        return res.status(500).json({
            success: false,
            message: "Server configuration error"
        });
    }

    try {
        const payload = JWT.verify(token, secret);
        req.user = { 
            _id: payload.id, 
            id: payload.id,
            email: payload.email, 
            isAdmin: payload.isAdmin,
            name: payload.name
        };
    } catch (error) {
        console.warn(`[jwtAuth] Token verification failed for ${req.method} ${req.path}: ${error.message}`);
        return res.status(401).json({
            success: false, 
            message: "Unauthorized: " + (error.name === 'TokenExpiredError' ? 'Token expired, please sign in again' : 'Invalid token')
        });
    }
    next();
}

module.exports = jwtAuth;