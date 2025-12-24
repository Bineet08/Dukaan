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

const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", protect, updateProfile);

// Admin routes
router.get("/users", protect, admin, getAllUsers);   // ✅ FIX
router.get("/users/:id", protect, admin, getUserById);
router.put("/users/:id", protect, admin, updateUser);
router.delete("/users/:id", protect, admin, deleteUser);

module.exports = router;
