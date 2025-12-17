const mongoose = require("mongoose");
const Product = require("../models/Product");


 // GET /api/products
const getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments();

    res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

 // GET /api/products/:id
const getProductById = async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("GET PRODUCT BY ID ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

 // POST /api/products/add
const addProduct = async (req, res) => {
  const { name, image, category, originalPrice, newPrice } = req.body;

  // Basic validation
  if (
    !name ||
    !category ||
    typeof originalPrice !== "number" ||
    typeof newPrice !== "number"
  ) {
    return res.status(400).json({
      error: "Invalid input data",
    });
  }

  if (newPrice > originalPrice) {
    return res.status(400).json({
      error: "New price cannot be greater than original price",
    });
  }

  try {
    const product = new Product({
      name: name.trim(),
      image: image || "",
      category: category.trim(),
      originalPrice,
      newPrice,
    });

    const createdProduct = await product.save();

    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
};
