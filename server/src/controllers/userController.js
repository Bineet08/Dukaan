const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/* =========================
   REGISTER USER
   ========================= */
const registerUser = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        if (!email || !name || !password) {
            return res.status(400).json({
                success: false,
                message: "Email, name and password are required"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const user = await User.create({
            email,
            name,
            password
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            _id: user._id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
            token
        });

    } catch (error) {
        console.error("REGISTER USER ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/* =========================
   LOGIN USER
   ========================= */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            console.log(`LOGIN FAILED: User not found for ${email}`);
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // console.log(`LOGIN FAILED: Password mismatch for ${email}`);
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        console.log(`LOGIN SUCCESS: ${email}`);
        const token = generateToken(user);

        res.status(200).json({
            success: true,
            _id: user._id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
            token
        });

    } catch (error) {
        console.error("LOGIN USER ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// =========================
// UPDATE LOGGED-IN USER PROFILE
// =========================
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, email } = req.body;

        // Basic validation
        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required",
            });
        }

        // Check if email is already used by another user
        const emailExists = await User.findOne({
            email,
            _id: { $ne: userId },
        });

        if (emailExists) {
            return res.status(409).json({
                message: "Email already in use",
            });
        }

        // Update user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.name = name.trim();
        user.email = email.toLowerCase().trim();

        const updatedUser = await user.save();

        // Return updated user (NO password, NO token change)
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });

    } catch (error) {
        console.error("UPDATE PROFILE ERROR:", error);
        res.status(500).json({
            message: "Failed to update profile",
        });
    }
};



/* =========================
   ADMIN: GET ALL USERS
   ========================= */
const getAllUsers = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find({})
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await User.countDocuments();

        res.status(200).json({
            success: true,
            page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total,
            users
        });

    } catch (error) {
        console.error("GET ALL USERS ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/* =========================
   ADMIN: GET USER BY ID
   ========================= */
const getUserById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID"
        });
    }

    try {
        const user = await User.findById(id).select("-password").lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error("GET USER BY ID ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/* =========================
   ADMIN: UPDATE USER
   ========================= */
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, isAdmin, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID"
        });
    }

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (typeof isAdmin === "boolean") user.isAdmin = isAdmin;

        if (password) {
            user.password = password;
            user.tokenVersion += 1; // invalidate old tokens
        }

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                name: updatedUser.name,
                isAdmin: updatedUser.isAdmin
            }
        });

    } catch (error) {
        console.error("UPDATE USER ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/* =========================
   ADMIN: DELETE USER
   ========================= */
const deleteUser = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID"
        });
    }

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("DELETE USER ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateProfile
};
