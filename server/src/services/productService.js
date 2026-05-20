const Product = require("../models/Product");

const getProducts = async ({ page = 1, limit = 20, category, search }) => {
    const sanitizedPage = Math.max(1, Number(page) || 1);
    const sanitizedLimit = Math.min(Math.max(1, Number(limit) || 20), 100);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const query = { isActive: true };
    if (category) {
        query.category = String(category).toLowerCase().trim();
    }
    if (search) {
        query.$or = [
            { name: { $regex: String(search).trim(), $options: "i" } },
            { category: { $regex: String(search).trim(), $options: "i" } }
        ];
    }

    const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(sanitizedLimit)
        .lean();

    const total = await Product.countDocuments(query);
    return {
        products,
        total,
        totalPages: Math.ceil(total / sanitizedLimit)
    };
};

const getProductById = async (id) => {
    return await Product.findOne({ _id: id, isActive: true }).lean();
};

const createProduct = async (productData) => {
    if (productData.name) {
        const existing = await Product.findOne({
            name: { $regex: new RegExp(`^${productData.name.trim()}$`, "i") },
            isActive: true
        });
        if (existing) {
            const err = new Error("Product with this name already exists");
            err.statusCode = 409;
            throw err;
        }
    }
    return await Product.create(productData);
};

const updateProduct = async (id, updateData) => {
    const product = await Product.findById(id);
    if (!product) return null;

    if (updateData.name) {
        const existing = await Product.findOne({
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${updateData.name.trim()}$`, "i") },
            isActive: true
        });
        if (existing) {
            const err = new Error("Product with this name already exists");
            err.statusCode = 409;
            throw err;
        }
    }

    const allowedUpdates = [
        "name",
        "image",
        "category",
        "originalPrice",
        "newPrice",
        "stock",
        "description"
    ];

    allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
            product[field] = updateData[field];
        }
    });

    // FIX BUG-15: enforce price constraint even on partial updates
    // (Joi validator only checks when BOTH prices are sent together)
    if (product.newPrice > product.originalPrice) {
        const err = new Error("New price cannot be greater than original price");
        err.statusCode = 400;
        throw err;
    }

    return await product.save();
};

const deleteProduct = async (id) => {
    const product = await Product.findById(id);
    if (!product) return null;

    product.isActive = false;
    return await product.save();
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
