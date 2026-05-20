const Joi = require("joi");

const categories = [
    "electronics",
    "fashion",
    "grocery",
    "home",
    "beauty",
    "sports",
    "medicine",
    "books",
    "other"
];

const addProductSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    image: Joi.string().uri().allow("").optional(),
    category: Joi.string().valid(...categories).required(),
    originalPrice: Joi.number().min(0).max(1000000).required(),
    newPrice: Joi.number().min(0).max(1000000).max(Joi.ref("originalPrice")).required()
        .messages({ "number.max": "New price cannot be greater than original price" }),
    stock: Joi.number().integer().min(0).max(10000).default(0).optional(),
    description: Joi.string().allow("").optional()
});

const updateProductSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    image: Joi.string().uri().allow("").optional(),
    category: Joi.string().valid(...categories).optional(),
    originalPrice: Joi.number().min(0).max(1000000).optional(),
    newPrice: Joi.number().min(0).max(1000000).optional(),
    stock: Joi.number().integer().min(0).max(10000).optional(),
    description: Joi.string().allow("").optional()
}).custom((value, helpers) => {
    const orig = value.originalPrice;
    const nPrice = value.newPrice;
    if (orig !== undefined && nPrice !== undefined && nPrice > orig) {
        return helpers.message("New price cannot be greater than original price");
    }
    return value;
});

module.exports = {
    addProductSchema,
    updateProductSchema
};
