const Razorpay = require('razorpay');
const crypto = require('crypto');
require("dotenv").config();
/**
 * PaymentService
 *
 * This service encapsulates payment gateway logic. It keeps gateway
 * integration code separate from controller/business logic.
 *
 * Learnings:
 * - createOrder: build an order with the payment gateway
 * - verifyPaymentSignature: confirm gateway response authenticity
 * - getPaymentDetails: fetch details after payment completes
 * - createRefund: initiate refunds through the gateway
 * - validateWebhookSignature: secure webhook events
 */
class PaymentService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Create a new Razorpay order.
   *
   * @param {number|string} amount - Amount in rupees.
   * @param {string} orderId - Your internal order ID.
   * @param {object} metadata - Additional metadata to attach.
   */
  async createOrder(amount, orderId, metadata = {}) {
    const amountInPaise = Math.round(Number(amount) * 100);
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${orderId}`,
      notes: {
        orderId,
        ...metadata,
      },
    };

    return await this.razorpay.orders.create(options);
  }

  /**
   * Verify the Razorpay payment signature.
   *
   * This is a critical security step. The frontend returns both the
   * payment ID and a signature. The server recreates the signature
   * using the secret key and compares it.
   *
   * @param {object} paymentData
   * @param {string} paymentData.razorpay_order_id
   * @param {string} paymentData.razorpay_payment_id
   * @param {string} paymentData.razorpay_signature
   * @returns {boolean}
   */
  verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    return expectedSignature === razorpay_signature;
  }

  /**
   * Fetch payment details from Razorpay.
   *
   * Use this after verification to confirm status, capture information,
   * or save gateway-specific metadata.
   */
  async getPaymentDetails(paymentId) {
    return await this.razorpay.payments.fetch(paymentId);
  }

  /**
   * Create a refund for a captured payment.
   *
   * @param {string} paymentId
   * @param {number|null} amount - Refund amount in rupees, or null for full refund.
   * @param {string} reason
   */
  async createRefund(paymentId, amount = null, reason = '') {
    const refundData = {};
    if (amount !== null) {
      refundData.amount = Math.round(Number(amount) * 100);
    }
    if (reason) {
      refundData.notes = { reason };
    }

    return await this.razorpay.payments.refund(paymentId, refundData);
  }

  /**
   * Validate a webhook signature from Razorpay.
   *
   * Razorpay sends event notifications asynchronously. This method ensures
   * the payload is really from Razorpay and was not modified in transit.
   *
   * @param {string} signature
   * @param {string|Buffer} rawBody
   */
  validateWebhookSignature(signature, rawBody) {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(rawBody)
      .digest('hex');

    return expectedSignature === signature;
  }
}

module.exports = new PaymentService();
