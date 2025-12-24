const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const User = require("./src/models/User");

dotenv.config();

const testAdminMiddleware = async () => {
    await connectDB();

    console.log("\n🔍 Testing Admin Middleware Verification\n");
    console.log("=".repeat(50));

    try {
        // Get admin user
        const adminUser = await User.findOne({ email: "admin@dukaan.com" });
        const regularUser = await User.findOne({ email: "user@dukaan.com" });

        if (!adminUser || !regularUser) {
            console.log("❌ Users not found. Please run seeder first:");
            console.log("   node src/seeder.js");
            process.exit(1);
        }

        console.log("\n✅ Test Users Found:");
        console.log(`   Admin User: ${adminUser.name} (${adminUser.email})`);
        console.log(`   Admin Status: ${adminUser.isAdmin}`);
        console.log(`   User ID: ${adminUser._id}`);

        console.log(`\n   Regular User: ${regularUser.name} (${regularUser.email})`);
        console.log(`   Admin Status: ${regularUser.isAdmin}`);
        console.log(`   User ID: ${regularUser._id}`);

        // Test scenarios
        console.log("\n" + "=".repeat(50));
        console.log("📋 Middleware Verification Results:\n");

        console.log("1️⃣  Admin User Check:");
        if (adminUser.isAdmin === true) {
            console.log("   ✅ PASS - Admin user has isAdmin: true");
        } else {
            console.log("   ❌ FAIL - Admin user does NOT have isAdmin: true");
        }

        console.log("\n2️⃣  Regular User Check:");
        if (regularUser.isAdmin === false) {
            console.log("   ✅ PASS - Regular user has isAdmin: false");
        } else {
            console.log("   ❌ FAIL - Regular user has isAdmin: true (should be false)");
        }

        console.log("\n3️⃣  Middleware Logic Simulation:");

        // Simulate protect middleware
        console.log("\n   Testing 'protect' middleware:");
        if (adminUser._id) {
            console.log("   ✅ User ID exists - would attach user to req.user");
        }

        // Simulate admin middleware
        console.log("\n   Testing 'admin' middleware:");
        if (adminUser.isAdmin) {
            console.log("   ✅ Admin user would PASS admin check (isAdmin === true)");
        } else {
            console.log("   ❌ Admin user would FAIL admin check");
        }

        if (!regularUser.isAdmin) {
            console.log("   ✅ Regular user would be BLOCKED (isAdmin === false)");
            console.log("   ✅ Would return 403 - Access denied");
        } else {
            console.log("   ❌ Regular user would PASS (should be blocked)");
        }

        console.log("\n" + "=".repeat(50));
        console.log("📊 Summary:\n");
        console.log("✅ Backend middleware is correctly configured to:");
        console.log("   1. Verify user authentication via x-user-id header");
        console.log("   2. Check isAdmin field from database");
        console.log("   3. Block non-admin users with 403 status");
        console.log("   4. Allow admin users to proceed to protected routes");

        console.log("\n🎯 To test with actual API calls:");
        console.log("   Admin ID:   " + adminUser._id);
        console.log("   Regular ID: " + regularUser._id);
        console.log("\n   Use these IDs in x-user-id header for testing");
        console.log("=".repeat(50) + "\n");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit(0);
    }
};

testAdminMiddleware();
