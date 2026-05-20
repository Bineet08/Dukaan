const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateProfile
} = require("../controllers/userController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    adminUpdateUserSchema
} = require("../validators/userValidators");

// Public routes
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.put("/profile", protect, validate(updateProfileSchema), updateProfile);

// Admin routes
router.get("/", protect, adminOnly, getAllUsers);
router.get("/:id", protect, adminOnly, getUserById);
router.put("/:id", protect, adminOnly, validate(adminUpdateUserSchema), updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;
