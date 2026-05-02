const mongoose = require("mongoose");
const Product = require("../models/Product");

/* =========================
   GET ALL PRODUCTS (PUBLIC)
   ========================= */
const getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      products
    });

  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/* =========================
   GET PRODUCT BY ID (PUBLIC)
   ========================= */
const getProductById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID"
    });
  }

  try {
    const product = await Product.findOne({
      _id: id,
      isActive: true
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      product
    });

  } catch (error) {
    console.error("GET PRODUCT BY ID ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/* =========================
   CREATE PRODUCT (ADMIN)
   ========================= */
const addProduct = async (req, res) => {
  const { name, image, category, originalPrice, newPrice, stock } = req.body;

  if (!name || !category || originalPrice == null || newPrice == null) {
    return res.status(400).json({
      success: false,
      message: "Required fields are missing"
    });
  }

  try {
    const product = await Product.create({
      name,
      image,
      category,
      originalPrice,
      newPrice,
      stock
    });

    res.status(201).json({
      success: true,
      product
    });

  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/* =========================
   UPDATE PRODUCT (ADMIN)
   ========================= */
const updateProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID"
    });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    Object.assign(product, req.body);

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      product: updatedProduct
    });

  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/* =========================
   SOFT DELETE PRODUCT (ADMIN)
   ========================= */
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID"
    });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product removed successfully"
    });

  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
};
