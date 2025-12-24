const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Middleware to verify if user is authenticated (JWT)
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for Bearer token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: "Not authorized, no token provided" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ error: "Not authorized, user not found" });
        }

        req.user = user; // Attach user to request
        next();
    } catch (error) {
        console.error("AUTH MIDDLEWARE ERROR:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Not authorized, invalid token" });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Not authorized, token expired" });
        }
        res.status(401).json({ error: "Not authorized" });
    }
};

// Middleware to verify if user is admin
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
};

module.exports = { protect, admin };
