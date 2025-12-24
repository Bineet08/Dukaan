const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
            index: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false // 🔐 never return password by default
        },

        isAdmin: {
            type: Boolean,
            default: false
        },

        tokenVersion: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

/* =========================
   HASH PASSWORD (MODEL LEVEL)
   ========================= */
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
});


/* =========================
   PASSWORD COMPARISON
   ========================= */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
