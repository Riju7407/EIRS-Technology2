const JWT = require('jsonwebtoken');

const jwtAuth = (req, res, next) => {

    console.log("🔥 JWT AUTH HIT");
    console.log("PATH:", req.originalUrl);
    console.log("QUERY:", req.query);
    console.log("HEADERS AUTH:", req.headers.authorization);
    console.log("COOKIE TOKEN:", req.cookies?.token);

    let token = null;

    // 1. Cookie
    token = req.cookies?.token || null;

    // 2. Authorization Header
    if (!token) {
        const authHeader = req.headers.authorization;

        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7);
            console.log("✅ Token from header");
        }
    }

    // 3. Query Token
    if (!token && req.query?.token) {
        token = req.query.token;
        console.log("✅ Token from query");
    }

    console.log("FINAL TOKEN:", token ? "FOUND" : "NOT FOUND");

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No token provided"
        });
    }

    try {
        const payload = JWT.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("✅ JWT VERIFIED:", payload.email);

        req.user = {
            _id: payload.id,
            email: payload.email,
            isAdmin: payload.isAdmin
        };

        next();

    } catch (error) {

        console.log("❌ JWT ERROR:", error.message);

        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid token"
        });
    }
};

module.exports = jwtAuth;