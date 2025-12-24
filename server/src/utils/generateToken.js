const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            tokenVersion: user.tokenVersion
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
};
 module.exports = generateToken;
