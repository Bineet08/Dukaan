const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getAllUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Admin-only routes
router.get("/", protect, admin, getAllUsers);           // GET all users
router.get("/:id", protect, admin, getUserById);        // GET user by ID
router.put("/:id", protect, admin, updateUser);         // UPDATE user
router.delete("/:id", protect, admin, deleteUser);      // DELETE user

module.exports = router;