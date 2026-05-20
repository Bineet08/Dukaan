const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus
} = require("../controllers/orderController");
const validate = require("../middleware/validate");
const { createOrderSchema, updateOrderStatusSchema } = require("../validators/orderValidators");

/* ========== USER ROUTES ========== */
router.post("/", protect, validate(createOrderSchema), createOrder);                 // Create order
router.get("/my-orders", protect, getUserOrders);       // Get logged-in user's orders

/* ========== ADMIN ROUTES ========== */
router.get("/", protect, adminOnly, getAllOrders);          // Get all orders
router.put("/:id/status", protect, adminOnly, validate(updateOrderStatusSchema), updateOrderStatus); // Update order status

module.exports = router;
