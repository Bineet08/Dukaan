const mongoose = require("mongoose");
const User = require("../models/User");

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
        res.status(200).json(user);
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
        res.status(201).json(user);
    } catch (error) {
        console.error("REGISTER USER ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    loginUser,
    registerUser
}