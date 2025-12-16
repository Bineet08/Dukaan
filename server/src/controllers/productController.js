const Product = require("../models/Product");

// GET all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// GET single product by id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// POST add product
const addProduct = async (req, res) => {
  const { name, image, category, originalPrice, newPrice } = req.body;

  if (!name || !image || !category || !originalPrice || !newPrice) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const product = new Product({
      name,
      image,
      category,
      originalPrice,
      newPrice,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getProducts, getProductById, addProduct };
