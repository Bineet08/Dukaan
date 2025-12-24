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
        category: "Daily Needs",
        originalPrice: 40,
        newPrice: 30,
    },
    {
        name: "Milk",
        image: "https://via.placeholder.com/150",
        category: "Groceries",
        originalPrice: 60,
        newPrice: 55,
    },
    {
        name: "Bread",
        image: "https://via.placeholder.com/150",
        category: "Bakery",
        originalPrice: 35,
        newPrice: 30,
    }
];

const users = [
    {
        name: "Admin User",
        email: "admin@dukaan.com",
        password: "admin123",
        isAdmin: true
    },
    {
        name: "Regular User",
        email: "user@dukaan.com",
        password: "user123",
        isAdmin: false
    }
];

const importData = async () => {
    try {
        await Product.deleteMany();
        await User.deleteMany();

        await Product.insertMany(products);
        await User.insertMany(users);

        console.log("✅ Data Imported!");
        console.log("\n📋 Sample Users Created:");
        console.log("Admin: admin@dukaan.com / admin123");
        console.log("User:  user@dukaan.com / user123");
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
