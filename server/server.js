const express = require("express");
const cors = require("cors");
process.env.NODE_ENV !== "production" && require("dotenv").config();
const connectDB = require("./src/config/db.js");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database


app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Routes
const productRoutes = require("./src/routes/productRoutes");
app.use("/api/products", productRoutes);

const userRoutes = require("./src/routes/userRoutes");
app.use("/api/auth", userRoutes);

const orderRoutes = require("./src/routes/orderRoutes");
app.use("/api/orders", orderRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  connectDB();
});
