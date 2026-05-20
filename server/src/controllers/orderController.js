const mongoose = require("mongoose");
const orderService = require("../services/orderService");

/* =========================
   CREATE ORDER (USER)
   ========================= */
const createOrder = async (req, res) => {
    const order = await orderService.createOrder(req.user._id, req.body);

    res.status(201).json({
        success: true,
        order
    });
};

/* =========================
   GET LOGGED-IN USER ORDERS
   ========================= */
const getUserOrders = async (req, res) => {
    const orders = await orderService.getUserOrders(req.user._id);

    res.status(200).json({
        success: true,
        orders
    });
};

/* =========================
   ADMIN: GET ALL ORDERS
   ========================= */
const getAllOrders = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const { orders, total, totalPages } = await orderService.getAllOrders(page, limit);

    res.status(200).json({
        success: true,
        page,
        totalPages,
        totalOrders: total,
        orders
    });
};

/* =========================
   ADMIN: UPDATE ORDER STATUS
   ========================= */
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid order ID"
        });
    }

    const updatedOrder = await orderService.updateOrderStatus(id, status);

    if (!updatedOrder) {
        return res.status(404).json({
            success: false,
            message: "Order not found"
        });
    }

    res.status(200).json({
        success: true,
        order: updatedOrder
    });
};

const asyncHandler = require("../utils/asyncHandler");

module.exports = {
    createOrder: asyncHandler(createOrder),
    getUserOrders: asyncHandler(getUserOrders),
    getAllOrders: asyncHandler(getAllOrders),
    updateOrderStatus: asyncHandler(updateOrderStatus)
};
