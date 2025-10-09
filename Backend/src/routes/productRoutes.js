const express = require("express");
const { getProducts, getProductById, addProduct } = require("../controllers/productController");

const router = express.Router();

router.get("/", getProducts);         // GET all
router.get("/:id", getProductById);   // GET by id
router.post("/", addProduct);         // POST new

module.exports = router;
