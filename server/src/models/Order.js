const mongoose = require("mongoose");

/* =========================
   ORDER ITEM SCHEMA
   ========================= */
const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        qty: {
            type: Number,
            required: true,
            min: 1,
        },

        price: {
            type: Number,
            required: true,
            min: 0, // price frozen at purchase time
        },
    },
    { _id: false }
);

/* =========================
   ORDER SCHEMA
   ========================= */
const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        items: {
            type: [orderItemSchema],
            default: [],
            validate: {
                validator: (v) => Array.isArray(v) && v.length > 0,
                message: "Order must contain at least one item",
            },
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
            default: "Pending",
            index: true,
        },

        shippingAddress: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },

        phoneNumber: {
            type: String,
            required: true,
            match: [/^[0-9]{10,15}$/, "Invalid phone number"],
        },

        paymentMethod: {
            type: String,
            enum: ["COD", "ONLINE"],
            default: "COD",
        },

        paymentResult: {
            id: String,
            status: String,
            updateTime: String,
            email: String,
        },
    },
    { timestamps: true }
);

/* =========================
   INDEXES
   ========================= */
orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
