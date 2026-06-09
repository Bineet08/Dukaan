const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createPaymentOrderSchema, verifyPaymentSchema } = require("../validators/paymentValidator");
const validate = require("../middleware/validate");
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-order", protect, validate(createPaymentOrderSchema), createPaymentOrder);
router.post("/verify", protect, validate(verifyPaymentSchema), verifyPayment);
router.get("/status/:paymentId", protect, getPaymentStatus);

module.exports = router;