const mongoose = require("mongoose");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Return user data with JWT token
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error("LOGIN USER ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const registerUser = async (req, res) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        return res.status(400).json({ error: "Email, name and password are required" });
    }
    try {
        const user = new User({ email, name, password });
        await user.save();

        // Return user data with JWT token
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error("REGISTER USER ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: Get all users
const getAllUsers = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        res.status(200).json({
            page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total,
            users
        });
    } catch (error) {
        console.error("GET ALL USERS ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: Get user by ID
const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("GET USER BY ID ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: Update user
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, isAdmin } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;

        const updatedUser = await user.save();

        // Return without password
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.status(200).json(userResponse);
    } catch (error) {
        console.error("UPDATE USER ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: Delete user
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("DELETE USER ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    loginUser,
    registerUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
}