const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createOrderSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            product: Joi.string().pattern(objectIdPattern).required()
                .messages({ "string.pattern.base": "Invalid product ID format" }),
            qty: Joi.number().integer().min(1).max(100).required()
        })
    ).min(1).max(50).unique((a, b) => a.product === b.product).required()
        .messages({ "array.unique": "Duplicate products in order items are not allowed" }),
    shippingAddress: Joi.string().max(500).required(),
    phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).required()
        .messages({ "string.pattern.base": "Invalid phone number" }),
    paymentMethod: Joi.string().valid("COD", "ONLINE").default("COD").optional()
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid("Pending", "Processing", "Shipped", "Delivered", "Cancelled").required()
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema
};
