const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus
} = require("../controllers/orderController");

/* ========== USER ROUTES ========== */
router.post("/", protect, createOrder);                 // Create order
router.get("/my-orders", protect, getUserOrders);       // Get logged-in user's orders

/* ========== ADMIN ROUTES ========== */
router.get("/", protect, admin, getAllOrders);          // Get all orders
router.put("/:id/status", protect, admin, updateOrderStatus); // Update order status

module.exports = router;
