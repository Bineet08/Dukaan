const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const productRoutes = require("./src/routes/productRoutes");
const userRoutes = require("./src/routes/userRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const contactRoutes = require("./src/routes/contactRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");

const app = express();

app.set("trust proxy", 1);

/* ---------- Security ---------- */
app.use(helmet());

const allowedOrigins = process.env.CLIENT_URL
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

/* ---------- Global Error Handler ---------- */
app.use((err, req, res, next) => {
  if (err.message?.startsWith("CORS")) {
    return res.status(403).json({
      success: false,
      message: err.message
    });
  }

  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

module.exports = app;
