const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    // NOTE: x-user-id bypass removed (BUG-05) — was a security vulnerability
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "Authentication required"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
        error: "Invalid token payload"
      });
    }

    const user = await User.findById(decoded.id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
        error: "User no longer exists"
      });
    }

    // FIX BUG-13: tokenVersion 0 is falsy in JS — old check skipped validation
    // for ALL new users. Now uses explicit undefined check.
    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Token revoked",
        error: "Token revoked"
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);

    const message =
      err.name === "TokenExpiredError"
        ? "Token expired"
        : "Invalid token";

    res.status(401).json({
      success: false,
      message,
      error: message
    });
  }
};

// FIX BUG-16: 'admin' function was dead code — no routes used it.
// All admin routes use 'adminOnly'. Removed to avoid confusion.
const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Admin only",
      error: "Admin only"
    });
  }

  next();
};

module.exports = { protect, adminOnly };
