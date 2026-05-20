const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Product = require("./models/Product");
const User = require("./models/User");

dotenv.config();

connectDB();

const products = [
    {
        name: "Soap",
        image: "https://via.placeholder.com/150",
        category: "beauty",
        originalPrice: 40,
        newPrice: 30,
    },
    {
        name: "Milk",
        image: "https://via.placeholder.com/150",
        category: "grocery",
        originalPrice: 60,
        newPrice: 55,
    },
    {
        name: "Bread",
        image: "https://via.placeholder.com/150",
        category: "grocery",
        originalPrice: 35,
        newPrice: 30,
    }
];

const users = [
    {
        name: "Admin User",
        email: "admin@dukaan.com",
        password: "Admin@1234",
        isAdmin: true
    },
    {
        name: "Regular User",
        email: "user@dukaan.com",
        password: "User@1234",
        isAdmin: false
    }
];

const importData = async () => {
    if (process.env.NODE_ENV === "production") {
        console.error("❌ FATAL: Cannot run seeder database reset in production mode!");
        process.exit(1);
    }
    try {
        await Product.deleteMany();
        await User.deleteMany();

        await Product.insertMany(products);
        await User.create(users);

        console.log("✅ Data Imported!");
        console.log("\n📋 Sample Users Created (DEV ONLY — change in production!):");
        console.log("Admin: admin@dukaan.com / Admin@1234");
        console.log("User:  user@dukaan.com / User@1234");
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === "-d") {
    // Add destroy data logic if needed
} else {
    importData();
}
