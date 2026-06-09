const Joi = require("joi");

const createPaymentOrderSchema = Joi.object({
  orderId: Joi.string().hex().length(24).required().messages({
    "string.length": "orderId must be a valid MongoDB ObjectId",
    "string.empty": "orderId is required",
  }),
});

const verifyPaymentSchema = Joi.object({
  orderId: Joi.string().hex().length(24).required().messages({
    "string.length": "orderId must be a valid MongoDB ObjectId",
    "string.empty": "orderId is required",
  }),
  razorpayOrderId: Joi.string().required().messages({
    "string.empty": "razorpayOrderId is required",
  }),
  razorpayPaymentId: Joi.string().required().messages({
    "string.empty": "razorpayPaymentId is required",
  }),
  razorpaySignature: Joi.string().required().messages({
    "string.empty": "razorpaySignature is required",
  }),
});

module.exports = {
  createPaymentOrderSchema,
  verifyPaymentSchema,
};