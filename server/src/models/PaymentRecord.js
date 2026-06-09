const mongoose = require('mongoose');

const paymentRecordSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true,
        unique: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },

    provider: {
        type: String,
        enum: ['Cash on Delivery', 'Razorpay'],
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending',
    },
    amount: {
        type: Number,
        required: true,
    },
    providerId: {
        type: String,
        default: null,
    },

    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, { timestamps: true });

const PaymentRecord = mongoose.model('PaymentRecord', paymentRecordSchema);

module.exports = PaymentRecord ;