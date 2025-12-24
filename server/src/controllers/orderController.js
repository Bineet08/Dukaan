const Order = require("../models/Order");
const mongoose = require("mongoose");

// Create new order
const createOrder = async (req, res) => {
    const { items, totalAmount, shippingAddress, phoneNumber } = req.body;
    const userId = req.user._id;

    // Validation
    if (!items || items.length === 0) {
        return res.status(400).json({ error: "No items in order" });
    }

    if (!totalAmount || totalAmount <= 0) {
        return res.status(400).json({ error: "Invalid total amount" });
    }

    try {
        const order = new Order({
            user: userId,
            items,
            totalAmount,
            shippingAddress,
            phoneNumber,
            status: "Pending"
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error("CREATE ORDER ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get user's orders
const getUserOrders = async (req, res) => {
    const userId = req.user._id;

    try {
        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate("items.product");

        res.status(200).json(orders);
    } catch (error) {
        console.error("GET USER ORDERS ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const orders = await Order.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "name email")
            .populate("items.product");

        const total = await Order.countDocuments();

        res.status(200).json({
            page,
            totalPages: Math.ceil(total / limit),
            totalOrders: total,
            orders
        });
    } catch (error) {
        console.error("GET ALL ORDERS ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    try {
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        order.status = status;
        const updatedOrder = await order.save();

        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error("UPDATE ORDER STATUS ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus
};
