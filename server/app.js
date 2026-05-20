const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const requiredEnv = [
  "MONGODB_URL",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_SECRET_KEY"
];
const missingEnv = requiredEnv.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  console.error("FATAL STARTUP ERROR: Missing environment variables:", missingEnv.join(", "));
  process.exit(1);
}

const productRoutes = require("./src/routes/productRoutes");
const userRoutes = require("./src/routes/userRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const contactRoutes = require("./src/routes/contactRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");

const rateLimit = require("express-rate-limit");

const app = express();

app.set("trust proxy", 1);

/* ---------- Rate Limiting ---------- */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts, please try again after 15 minutes."
  }
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many upload attempts, please try again after 15 minutes."
  }
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many contact submissions, please try again after 15 minutes."
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes."
  }
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/upload", uploadLimiter);
app.use("/api/contact", contactLimiter);
app.use("/api", apiLimiter);

/* ---------- Security ---------- */
app.use(helmet());

/* S5 FIX: Enforce HTTPS in production behind a reverse proxy */
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

const allowedOrigins = (process.env.CLIENT_URL || "")
  .replace(/['"]/g, "")
  .split(",")
  .map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: false,
}));

app.use(express.json({ limit: "5mb" }));

/* ---------- Input Sanitization ---------- */
// 1. Prevent NoSQL Operator Injection (MongoDB $ operator stripping)
const sanitizeNoSQL = (obj) => {
  if (!obj || typeof obj !== "object") return;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (key.startsWith("$")) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        sanitizeNoSQL(obj[key]);
      }
    }
  }
};

// 2. Prevent XSS payload persistence by escaping HTML tags in request strings
const sanitizeHTML = (val) => {
  if (typeof val !== "string") return val;
  // Ignore base64 encoded images to avoid corrupting image uploads
  if (val.startsWith("data:")) return val;
  return val
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === "string") {
        obj[key] = sanitizeHTML(obj[key]);
      } else if (typeof obj[key] === "object") {
        sanitizeObject(obj[key]);
      }
    }
  }
};

app.use((req, res, next) => {
  // Sanitize for NoSQL injection
  if (req.body) sanitizeNoSQL(req.body);
  if (req.query) sanitizeNoSQL(req.query);
  if (req.params) sanitizeNoSQL(req.params);

  // Sanitize for XSS persistence
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
});

/* ---------- Routes ---------- */
app.use("/api/products", productRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/upload", uploadRoutes);


/* ---------- Health Check ---------- */
app.get("/health", (_, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

/* ---------- 404 Handler ---------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

/* ---------- Global Error Handler ---------- */
app.use((err, req, res, next) => {
  if (err.message?.startsWith("CORS")) {
    return res.status(403).json({
      success: false,
      message: err.message
    });
  }

  // S4 FIX: Always log stack server-side, but NEVER send to the client
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : (err.message || "Internal Server Error")
  });
});

module.exports = app;
