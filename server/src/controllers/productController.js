const mongoose = require("mongoose");
const productService = require("../services/productService");

/* =========================
   GET ALL PRODUCTS (PUBLIC)
   ========================= */
const getProducts = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const category = req.query.category;
  const search = req.query.search;

  const { products, total, totalPages } = await productService.getProducts({ page, limit, category, search });

  res.status(200).json({
    success: true,
    page,
    totalPages,
    totalProducts: total,
    products
  });
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

  const product = await productService.getProductById(id);

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
};

/* =========================
   CREATE PRODUCT (ADMIN)
   ========================= */
const addProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);

  res.status(201).json({
    success: true,
    product
  });
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

  const updatedProduct = await productService.updateProduct(id, req.body);

  if (!updatedProduct) {
    return res.status(404).json({
      success: false,
      message: "Product not found"
    });
  }

  res.status(200).json({
    success: true,
    product: updatedProduct
  });
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

  const deletedProduct = await productService.deleteProduct(id);

  if (!deletedProduct) {
    return res.status(404).json({
      success: false,
      message: "Product not found"
    });
  }

  res.status(200).json({
    success: true,
    message: "Product removed successfully"
  });
};

const asyncHandler = require("../utils/asyncHandler");

module.exports = {
  getProducts: asyncHandler(getProducts),
  getProductById: asyncHandler(getProductById),
  addProduct: asyncHandler(addProduct),
  updateProduct: asyncHandler(updateProduct),
  deleteProduct: asyncHandler(deleteProduct)
};
