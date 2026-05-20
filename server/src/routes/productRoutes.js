const express = require("express");
const {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { addProductSchema, updateProductSchema } = require("../validators/productValidators");

const router = express.Router();

/* =========================
   PUBLIC ROUTES
   ========================= */
router.get("/", getProducts);          // GET all products
router.get("/:id", getProductById);    // GET product by ID

/* =========================
   ADMIN ROUTES
   ========================= */
router.post("/add", protect, adminOnly, validate(addProductSchema), addProduct);       // CREATE product
router.put("/:id", protect, adminOnly, validate(updateProductSchema), updateProduct); // UPDATE product
router.delete("/:id", protect, adminOnly, deleteProduct); // DELETE product

module.exports = router;
