const JWT = require('jsonwebtoken');

const jwtAuth = (req, res, next) => {
    let token = null;

    // 1. Cookie token
    token = (req.cookies && req.cookies.token) || null;

    // 2. Authorization header token
    if (!token) {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    // 3. Query token (PDF download support)
    if (!token && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        console.warn(
            `[jwtAuth] No token provided for ${req.method} ${req.path}`
        );

        return res.status(401).json({
            success: false,
            message: "Unauthorized: No token provided"
        });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error(
            '[jwtAuth] JWT_SECRET is not set in environment!'
        );

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

        next();

    } catch (error) {
        console.warn(
            `[jwtAuth] Token verification failed for ${req.method} ${req.path}: ${error.message}`
        );

        return res.status(401).json({
            success: false,
            message:
                "Unauthorized: " +
                (
                    error.name === 'TokenExpiredError'
                        ? 'Token expired, please sign in again'
                        : 'Invalid token'
                )
        });
    }
};

module.exports = jwtAuth;