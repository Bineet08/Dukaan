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

/* ---------- Security ---------- */
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json({ limit: "10kb" }));

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
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

module.exports = app;
