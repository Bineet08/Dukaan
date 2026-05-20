const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const registerUser = async ({ email, name, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        const err = new Error("User already exists");
        err.statusCode = 409;
        throw err;
    }

    const user = await User.create({
        email,
        name,
        password
    });

    const token = generateToken(user);
    return {
        _id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        token
    };
};

const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        const err = new Error("Invalid email or password");
        err.statusCode = 401;
        throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        const err = new Error("Invalid email or password");
        err.statusCode = 401;
        throw err;
    }

    const token = generateToken(user);
    return {
        _id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        token
    };
};

const updateProfile = async (userId, { name, email }) => {
    // FIX BUG-06: guard email before use — crashes with TypeError if undefined
    if (email) {
        const emailExists = await User.findOne({
            email,
            _id: { $ne: userId }
        });

        if (emailExists) {
            const err = new Error("Email already in use");
            err.statusCode = 409;
            throw err;
        }
    }

    const user = await User.findById(userId);
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();

    const updatedUser = await user.save();
    return updatedUser;
};

const getAllUsers = async (page = 1, limit = 10) => {
    const sanitizedPage = Math.max(1, Number(page) || 1);
    const sanitizedLimit = Math.min(Math.max(1, Number(limit) || 10), 100);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const users = await User.find({})
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(sanitizedLimit)
        .lean();

    const total = await User.countDocuments();
    return {
        users,
        total,
        totalPages: Math.ceil(total / sanitizedLimit)
    };
};

const getUserById = async (id) => {
    return await User.findById(id).select("-password").lean();
};

const updateUser = async (id, updateData) => {
    const user = await User.findById(id);
    if (!user) return null;

    const { name, email, isAdmin, password } = updateData;

    if (email && email.toLowerCase().trim() !== user.email) {
        const emailExists = await User.findOne({
            email: email.toLowerCase().trim()
        });
        if (emailExists) {
            const err = new Error("Email already in use");
            err.statusCode = 409;
            throw err;
        }
        user.email = email.toLowerCase().trim();
    }

    if (name) user.name = name;
    if (typeof isAdmin === "boolean") user.isAdmin = isAdmin;

    if (password) {
        user.password = password;
        user.tokenVersion += 1;
    }

    return await user.save();
};

const deleteUser = async (id, requestingUserId) => {
    // S6 FIX: prevent admin from deleting themselves
    if (id === requestingUserId) {
        const err = new Error("You cannot delete your own account");
        err.statusCode = 400;
        throw err;
    }

    const user = await User.findById(id);
    if (!user) return null;

    await user.deleteOne();
    return true;
};

module.exports = {
    registerUser,
    loginUser,
    updateProfile,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
