const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/Order");
const PaymentRecord = require("../models/PaymentRecord");
const paymentService = require("../services/paymentService");

const createPaymentOrder = async (req, res) => {
  const { orderId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID",
    });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized to access this order",
    });
  }

  if (order.paymentMethod !== "ONLINE") {
    return res.status(400).json({
      success: false,
      message: "Payment order can only be created for online payment orders",
    });
  }

  if (order.isPaid) {
    return res.status(400).json({
      success: false,
      message: "Order is already paid",
    });
  }

  const razorpayOrder = await paymentService.createOrder(order.totalAmount, orderId, {
    userId: req.user._id.toString(),
    email: req.user.email,
  });

  res.status(200).json({
    success: true,
    razorpayOrderId: razorpayOrder.id,
    amount: order.totalAmount,
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId,
  });
};

const verifyPayment = async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID",
    });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized to verify this payment",
    });
  }

  if (order.isPaid) {
    return res.status(400).json({
      success: false,
      message: "Order is already paid",
    });
  }

  if (!paymentService.verifyPaymentSignature({
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  })) {
    return res.status(400).json({
      success: false,
      message: "Payment verification failed",
    });
  }

  const paymentDetails = await paymentService.getPaymentDetails(razorpayPaymentId);

  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentMethod = "ONLINE";
  order.paymentResult = {
    id: razorpayPaymentId,
    status: paymentDetails.status,
    updateTime: paymentDetails.created_at,
    email: paymentDetails.email,
  };
  order.status = "Processing";

  const paymentRecord = await PaymentRecord.create({
    order: orderId,
    user: req.user._id,
    provider: "Razorpay",
    status: paymentDetails.status,
    amount: order.totalAmount,
    providerId: razorpayPaymentId,
    details: {
      razorpayOrderId,
      receipt: paymentDetails.receipt,
      paymentStatus: paymentDetails.status,
    },
  });

  order.paymentRef = paymentRecord._id;
  const savedOrder = await order.save();

  res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    order: savedOrder,
  });
};

const getPaymentStatus = async (req, res) => {
  const { paymentId } = req.params;

  const payment = await PaymentRecord.findOne({
    providerId: paymentId,
    user: req.user._id,
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: "Payment not found",
    });
  }

  res.status(200).json({
    success: true,
    payment,
  });
};

module.exports = {
  createPaymentOrder: asyncHandler(createPaymentOrder),
  verifyPayment: asyncHandler(verifyPayment),
  getPaymentStatus: asyncHandler(getPaymentStatus),
};