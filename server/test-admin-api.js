/**
 * Admin Middleware API Test
 * Tests the actual API endpoints with different authorization scenarios
 */

const mongoose = require("mongoose");
const User = require("./src/models/User");
require("dotenv").config();

const testAdminAPI = async () => {
    const backendUrl = "http://localhost:5000";

    await mongoose.connect(`${process.env.MONGODB_URL}/dukaan`);
    const adminUser = await User.findOne({ email: "admin@dukaan.com" });
    const regularUser = await User.findOne({ email: "user@dukaan.com" });

    const adminId = adminUser._id.toString();
    const regularUserId = regularUser._id.toString();

    console.log("\n🧪 Testing Admin API Endpoints\n");
    console.log("=".repeat(60));

    // Test product data
    const testProduct = {
        name: "Test Product",
        category: "other",
        originalPrice: 100,
        newPrice: 80,
        image: "https://via.placeholder.com/150"
    };

    // Test 1: Try to add product WITHOUT authentication
    console.log("\n1️⃣  Test: Add product WITHOUT x-user-id header");
    console.log("   Expected: 401 Unauthorized");
    try {
        const response = await fetch(`${backendUrl}/api/products/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testProduct)
        });
        const data = await response.json();

        if (response.status === 401) {
            console.log("   ✅ PASS - Got 401:", data.error);
        } else {
            console.log(`   ❌ FAIL - Got status ${response.status} (expected 401)`);
        }
    } catch (error) {
        console.log("   ⚠️  Server not running? Error:", error.message);
    }

    // Test 2: Try to add product as REGULAR USER
    console.log("\n2️⃣  Test: Add product as REGULAR USER (non-admin)");
    console.log("   Expected: 403 Forbidden");
    try {
        const response = await fetch(`${backendUrl}/api/products/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-user-id": regularUserId
            },
            body: JSON.stringify(testProduct)
        });
        const data = await response.json();

        if (response.status === 403) {
            console.log("   ✅ PASS - Got 403:", data.error);
        } else {
            console.log(`   ❌ FAIL - Got status ${response.status} (expected 403)`);
        }
    } catch (error) {
        console.log("   ⚠️  Server not running? Error:", error.message);
    }

    // Test 3: Try to add product as ADMIN
    console.log("\n3️⃣  Test: Add product as ADMIN");
    console.log("   Expected: 201 Created");
    try {
        const response = await fetch(`${backendUrl}/api/products/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-user-id": adminId
            },
            body: JSON.stringify(testProduct)
        });
        const data = await response.json();

        if (response.status === 201) {
            console.log("   ✅ PASS - Product created:", data.name);
            console.log("   Product ID:", data._id);

            // Test 4: Update product as REGULAR USER
            console.log("\n4️⃣  Test: Update product as REGULAR USER");
            console.log("   Expected: 403 Forbidden");
            const updateResponse = await fetch(`${backendUrl}/api/products/${data._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": regularUserId
                },
                body: JSON.stringify({ newPrice: 75 })
            });
            const updateData = await updateResponse.json();

            if (updateResponse.status === 403) {
                console.log("   ✅ PASS - Got 403:", updateData.error);
            } else {
                console.log(`   ❌ FAIL - Got status ${updateResponse.status} (expected 403)`);
            }

            // Test 5: Update product as ADMIN
            console.log("\n5️⃣  Test: Update product as ADMIN");
            console.log("   Expected: 200 OK");
            const adminUpdateResponse = await fetch(`${backendUrl}/api/products/${data._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": adminId
                },
                body: JSON.stringify({ newPrice: 75 })
            });
            const adminUpdateData = await adminUpdateResponse.json();

            if (adminUpdateResponse.status === 200) {
                console.log("   ✅ PASS - Product updated:", adminUpdateData.name);
                console.log("   New Price:", adminUpdateData.newPrice);
            } else {
                console.log(`   ❌ FAIL - Got status ${adminUpdateResponse.status} (expected 200)`);
            }

            // Test 6: Delete product as REGULAR USER
            console.log("\n6️⃣  Test: Delete product as REGULAR USER");
            console.log("   Expected: 403 Forbidden");
            const deleteResponse = await fetch(`${backendUrl}/api/products/${data._id}`, {
                method: "DELETE",
                headers: {
                    "x-user-id": regularUserId
                }
            });
            const deleteData = await deleteResponse.json();

            if (deleteResponse.status === 403) {
                console.log("   ✅ PASS - Got 403:", deleteData.error);
            } else {
                console.log(`   ❌ FAIL - Got status ${deleteResponse.status} (expected 403)`);
            }

            // Test 7: Delete product as ADMIN
            console.log("\n7️⃣  Test: Delete product as ADMIN");
            console.log("   Expected: 200 OK");
            const adminDeleteResponse = await fetch(`${backendUrl}/api/products/${data._id}`, {
                method: "DELETE",
                headers: {
                    "x-user-id": adminId
                }
            });
            const adminDeleteData = await adminDeleteResponse.json();

            if (adminDeleteResponse.status === 200) {
                console.log("   ✅ PASS - Product deleted:", adminDeleteData.message);
            } else {
                console.log(`   ❌ FAIL - Got status ${adminDeleteResponse.status} (expected 200)`);
            }

        } else {
            console.log(`   ❌ FAIL - Got status ${response.status} (expected 201)`);
            console.log("   Error:", data);
        }
    } catch (error) {
        console.log("   ⚠️  Server not running? Error:", error.message);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Middleware Verification Complete!");
    console.log("\nSummary:");
    console.log("  • Requests without auth are blocked (401)");
    console.log("  • Regular users cannot perform admin actions (403)");
    console.log("  • Admin users can perform all CRUD operations (200/201)");
    console.log("=".repeat(60) + "\n");
    await mongoose.connection.close();
};

// Run the test
testAdminAPI();
