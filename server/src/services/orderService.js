const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");

const createOrderWithTransactions = async (userId, { items, shippingAddress, phoneNumber, paymentMethod }) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const resolvedItems = [];
        let calculatedTotal = 0;

        for (const item of items) {
            const itemQty = Math.max(1, Number(item.qty) || 1);

            // Atomic update to decrement stock, checking if there is sufficient stock
            const product = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: itemQty } },
                { $inc: { stock: -itemQty } },
                { new: true, session }
            );

            if (!product) {
                const exists = await Product.findById(item.product).session(session);
                const errorMsg = exists
                    ? `Insufficient stock for product: ${exists.name} (Available: ${exists.stock}, Requested: ${itemQty})`
                    : `Product not found: ${item.product}`;
                
                const err = new Error(errorMsg);
                err.statusCode = 400;
                throw err;
            }

            const itemPrice = Number(product.newPrice) || 0;
            calculatedTotal += itemPrice * itemQty;

            resolvedItems.push({
                product: product._id,
                name: product.name,
                qty: itemQty,
                price: itemPrice
            });
        }

        const order = await Order.create([{
            user: userId,
            items: resolvedItems,
            totalAmount: calculatedTotal,
            shippingAddress,
            phoneNumber,
            paymentMethod,
            status: "Pending"
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return order[0];

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const createOrderWithoutTransactions = async (userId, { items, shippingAddress, phoneNumber, paymentMethod }) => {
    const decrementedProducts = [];
    try {
        const resolvedItems = [];
        let calculatedTotal = 0;

        for (const item of items) {
            const itemQty = Math.max(1, Number(item.qty) || 1);

            const product = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: itemQty } },
                { $inc: { stock: -itemQty } },
                { new: true }
            );

            if (!product) {
                // Rollback previously decremented products
                for (const rollbackItem of decrementedProducts) {
                    await Product.findByIdAndUpdate(rollbackItem.id, {
                        $inc: { stock: rollbackItem.qty }
                    });
                }

                const exists = await Product.findById(item.product);
                const errorMsg = exists
                    ? `Insufficient stock for product: ${exists.name} (Available: ${exists.stock}, Requested: ${itemQty})`
                    : `Product not found: ${item.product}`;

                const err = new Error(errorMsg);
                err.statusCode = 400;
                throw err;
            }

            decrementedProducts.push({ id: product._id, qty: itemQty });

            const itemPrice = Number(product.newPrice) || 0;
            calculatedTotal += itemPrice * itemQty;

            resolvedItems.push({
                product: product._id,
                name: product.name,
                qty: itemQty,
                price: itemPrice
            });
        }

        const order = await Order.create({
            user: userId,
            items: resolvedItems,
            totalAmount: calculatedTotal,
            shippingAddress,
            phoneNumber,
            paymentMethod,
            status: "Pending"
        });

        return order;

    } catch (error) {
        // Rollback previously decremented products
        for (const rollbackItem of decrementedProducts) {
            await Product.findByIdAndUpdate(rollbackItem.id, {
                $inc: { stock: rollbackItem.qty }
            });
        }
        throw error;
    }
};

const createOrder = async (userId, orderData) => {
    try {
        return await createOrderWithTransactions(userId, orderData);
    } catch (error) {
        if (error.message && (error.message.includes("replica set") || error.message.includes("Transaction"))) {
            console.warn("MongoDB deployment does not support transactions. Falling back to manual rollback safety flow.");
            return await createOrderWithoutTransactions(userId, orderData);
        }
        throw error;
    }
};

const getUserOrders = async (userId) => {
    return await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate("items.product")
        .lean();
};

const getAllOrders = async (page = 1, limit = 20) => {
    const sanitizedPage = Math.max(1, Number(page) || 1);
    const sanitizedLimit = Math.min(Math.max(1, Number(limit) || 20), 100);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const orders = await Order.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(sanitizedLimit)
        .populate("user", "name email")
        .populate("items.product")
        .lean();

    const total = await Order.countDocuments();
    return {
        orders,
        total,
        totalPages: Math.ceil(total / sanitizedLimit)
    };
};

const updateOrderStatus = async (id, status) => {
    const order = await Order.findById(id);
    if (!order) return null;

    order.status = status;
    return await order.save();
};

module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus
};
