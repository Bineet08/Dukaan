const Order = require("../models/Order");
const mongoose = require("mongoose");

/* =========================
   CREATE ORDER (USER)
   ========================= */
const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress, phoneNumber } = req.body;
        const userId = req.user._id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order must contain at least one item"
            });
        }

        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid total amount"
            });
        }

        if (!shippingAddress || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Shipping address and phone number are required"
            });
        }

        const order = await Order.create({
            user: userId,
            items,
            totalAmount,
            shippingAddress,
            phoneNumber,
            status: "Pending"
        });

        res.status(201).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("CREATE ORDER ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/* =========================
   GET LOGGED-IN USER ORDERS
   ========================= */
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate("items.product")
            .lean();

        res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("GET USER ORDERS ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/* =========================
   ADMIN: GET ALL ORDERS
   ========================= */
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
            .populate("items.product")
            .lean();

        const total = await Order.countDocuments();

        res.status(200).json({
            success: true,
            page,
            totalPages: Math.ceil(total / limit),
            totalOrders: total,
            orders
        });

    } catch (error) {
        console.error("GET ALL ORDERS ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/* =========================
   ADMIN: UPDATE ORDER STATUS
   ========================= */
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
    ];

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid order ID"
        });
    }

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid order status"
        });
    }

    try {
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        order.status = status;
        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            order: updatedOrder
        });

    } catch (error) {
        console.error("UPDATE ORDER STATUS ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus
};
