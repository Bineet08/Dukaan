const Joi = require("joi");

// S7 FIX: Enforce strong passwords — min 8 chars, must include uppercase, lowercase, digit, and special char
const strongPassword = Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s])/)
    .messages({
        "string.pattern.base": "Password must include uppercase, lowercase, number, and special character",
        "string.min": "Password must be at least 8 characters",
    });

const registerSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().max(255).required(),
    name: Joi.string().min(2).max(50).required(),
    password: strongPassword.required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().max(255).required(),
    password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().lowercase().trim().max(255).required()
});

const adminUpdateUserSchema = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().lowercase().trim().max(255).optional(),
    isAdmin: Joi.boolean().optional(),
    password: strongPassword.optional()
});

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    adminUpdateUserSchema
};
