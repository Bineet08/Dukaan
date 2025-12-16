const express = require("express");
const cors = require("cors");
process.env.NODE_ENV !== "production" && require("dotenv").config();
const connectDB = require("./src/config/db.js");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

app.use(cors());
app.use(express.json());

// Routes
const productRoutes = require("./src/routes/productRoutes");
app.use("/api/products", productRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
