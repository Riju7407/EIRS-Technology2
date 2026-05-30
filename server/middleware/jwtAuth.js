const JWT = require("jsonwebtoken");

const jwtAuth = (req, res, next) => {

    console.log("\n🔥 ===== JWT AUTH HIT =====");
    console.log("METHOD:", req.method);
    console.log("PATH:", req.originalUrl);
    console.log("QUERY:", req.query);
    console.log("AUTH HEADER:", req.headers.authorization);
    console.log("COOKIE TOKEN:", req.cookies?.token ? "FOUND" : "NOT FOUND");

    let token = null;

    // 1. Cookie Token
    token = req.cookies?.token || null;

    if (token) {
        console.log("✅ Token found from COOKIE");
    }

    // 2. Authorization Header
    if (!token) {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            console.log("✅ Token found from HEADER");
        }
    }

    // 3. Query Token (IMPORTANT FOR BILL DOWNLOAD)
    if (!token && req.query?.token) {
        token = req.query.token;
        console.log("✅ Token found from QUERY PARAM");
    }

    console.log("FINAL TOKEN:", token ? "FOUND" : "NOT FOUND");

    // No Token
    if (!token) {
        console.warn(
            `[jwtAuth] No token provided for ${req.method} ${req.originalUrl}`
        );

        return res.status(401).json({
            success: false,
            message: "Unauthorized: No token provided",
        });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error("❌ JWT_SECRET missing in env");

        return res.status(500).json({
            success: false,
            message: "Server configuration error",
        });
    }

    try {
        const payload = JWT.verify(token, secret);

        console.log("✅ JWT VERIFIED");
        console.log("USER:", payload.email);

        req.user = {
            _id: payload.id,
            id: payload.id,
            email: payload.email,
            isAdmin: payload.isAdmin,
            name: payload.name,
        };

        next();

    } catch (error) {

        console.log("❌ JWT VERIFY FAILED:", error.message);

        return res.status(401).json({
            success: false,
            message:
                "Unauthorized: " +
                (error.name === "TokenExpiredError"
                    ? "Token expired, please sign in again"
                    : "Invalid token"),
        });
    }
};

module.exports = jwtAuth;