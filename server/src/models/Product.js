const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
            index: true
        },

        image: {
            type: String,
            trim: true,
            default: "",
            match: [
                /^(https?:\/\/.*\.(?:png|jpg|jpeg|webp|svg))$/i,
                "Invalid image URL"
            ]
        },

        category: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            enum: [
                "electronics",
                "fashion",
                "grocery",
                "home",
                "beauty",
                "sports",
                "books",
                "other"
            ],
            index: true
        },

        originalPrice: {
            type: Number,
            required: true,
            min: 0
        },

        newPrice: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: function (value) {
                    return value <= this.originalPrice;
                },
                message: "New price cannot be greater than original price"
            }
        },

        stock: {
            type: Number,
            default: 0,
            min: 0
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);

/* =========================
   INDEXES FOR PERFORMANCE
   ========================= */
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model("Product", productSchema);
