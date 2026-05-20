const mongoose = require("mongoose");
const userService = require("../services/userService");

/* =========================
   REGISTER USER
   ========================= */
const registerUser = async (req, res) => {
    const result = await userService.registerUser(req.body);
    res.status(201).json({
        success: true,
        ...result
    });
};

/* =========================
   LOGIN USER
   ========================= */
const loginUser = async (req, res) => {
    const result = await userService.loginUser(req.body);
    res.status(200).json({
        success: true,
        ...result
    });
};

/* =========================
   UPDATE LOGGED-IN USER PROFILE
   ========================= */
const updateProfile = async (req, res) => {
    const userId = req.user._id;
    const updatedUser = await userService.updateProfile(userId, req.body);

    res.status(200).json({
        success: true,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin
    });
};

/* =========================
   ADMIN: GET ALL USERS
   ========================= */
const getAllUsers = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const { users, total, totalPages } = await userService.getAllUsers(page, limit);

    res.status(200).json({
        success: true,
        page,
        totalPages,
        totalUsers: total,
        users
    });
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

    const user = await userService.getUserById(id);

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
};

/* =========================
   ADMIN: UPDATE USER
   ========================= */
const updateUser = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID"
        });
    }

    const updatedUser = await userService.updateUser(id, req.body);

    if (!updatedUser) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    res.status(200).json({
        success: true,
        user: {
            id: updatedUser._id,
            email: updatedUser.email,
            name: updatedUser.name,
            isAdmin: updatedUser.isAdmin
        }
    });
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

    const deleted = await userService.deleteUser(id, req.user._id.toString());

    if (!deleted) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });
};

const asyncHandler = require("../utils/asyncHandler");

module.exports = {
    registerUser: asyncHandler(registerUser),
    loginUser: asyncHandler(loginUser),
    getAllUsers: asyncHandler(getAllUsers),
    getUserById: asyncHandler(getUserById),
    updateUser: asyncHandler(updateUser),
    deleteUser: asyncHandler(deleteUser),
    updateProfile: asyncHandler(updateProfile)
};
