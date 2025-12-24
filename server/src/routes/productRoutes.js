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

/* =========================
   PUBLIC ROUTES
   ========================= */
router.get("/", getProducts);          // GET all products
router.get("/:id", getProductById);    // GET product by ID

/* =========================
   ADMIN ROUTES
   ========================= */
router.post("/", protect, admin, addProduct);       // CREATE product
router.put("/:id", protect, admin, updateProduct); // UPDATE product
router.delete("/:id", protect, admin, deleteProduct); // DELETE product

module.exports = router;
