const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus
} = require("../controllers/orderController");

// User routes
router.post("/", protect, createOrder);                    // Create order
router.get("/myorders", protect, getUserOrders);           // Get my orders

// Admin routes
router.get("/", protect, admin, getAllOrders);             // Get all orders
router.put("/:id", protect, admin, updateOrderStatus);     // Update order status

module.exports = router;