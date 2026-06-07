const JWT = require("jsonwebtoken");

const jwtAuth = (req, res, next) => {
    try {
        

        let token = null;



        // 1. Cookie Token
        if (req.cookies?.token) {
            token = req.cookies.token;
            console.log("✅ Token Source: COOKIE");
        }

        // 2. Authorization Header
        if (!token) {
            const authHeader = req.headers.authorization;

            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
                console.log("✅ Token Source: AUTH HEADER");
            }
        }

        // 3. Query Param
        if (!token && req.query?.token) {
            token = req.query.token;
            console.log("✅ Token Source: QUERY PARAM");
        }

        console.log(
            "TOKEN PREVIEW:",
            token ? `${token.substring(0, 20)}...` : "NO TOKEN"
        );

        // No Token
        if (!token) {
            console.log("❌ NO TOKEN FOUND");

            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided"
            });
        }

        // JWT Secret Check
        if (!process.env.JWT_SECRET) {
            console.log("❌ JWT_SECRET NOT FOUND");

            return res.status(500).json({
                success: false,
                message: "JWT_SECRET missing"
            });
        }

        // Verify Token
        const payload = JWT.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("✅ TOKEN VERIFIED");
        console.log("USER ID:", payload.id);
        console.log("EMAIL:", payload.email);

        req.user = {
            _id: payload.id,
            id: payload.id,
            email: payload.email,
            isAdmin: payload.isAdmin,
            name: payload.name
        };

        console.log("✅ AUTH SUCCESS");
        console.log("================================================\n");

        next();

    } catch (error) {
        console.log("❌ JWT VERIFY ERROR");
        console.log("ERROR NAME:", error.name);
        console.log("ERROR MESSAGE:", error.message);

        return res.status(401).json({
            success: false,
            message:
                error.name === "TokenExpiredError"
                    ? "Token expired, please login again"
                    : "Invalid token"
        });
    }
};

module.exports = jwtAuth;