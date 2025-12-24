const express = require("express");
const {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getProducts);         // GET all products
router.get("/:id", getProductById);   // GET product by id

// Admin-only routes (protected)
router.post("/add", protect, admin, addProduct);           // POST new product
router.put("/:id", protect, admin, updateProduct);         // PUT update product
router.delete("/:id", protect, admin, deleteProduct);      // DELETE product

module.exports = router;
