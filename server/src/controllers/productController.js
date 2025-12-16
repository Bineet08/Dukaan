// Fake "database"
let products = [
    {
      id: 1,
      name: "Soap",
      image: "https://via.placeholder.com/150",
      category: "Daily Needs",
      originalPrice: 40,
      newPrice: 30,
    },
    {
      id: 2,
      name: "Milk",
      image: "https://via.placeholder.com/150",
      category: "Groceries",
      originalPrice: 60,
      newPrice: 55,
    }
  ];
  
  // GET all products
  const getProducts = (req, res) => {
    res.json(products);
  };
  
  // GET single product by id
  const getProductById = (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  };
  
  // POST add product
  const addProduct = (req, res) => {
    const { name, image, category, originalPrice, newPrice } = req.body;
    if (!name || !image || !category || !originalPrice || !newPrice) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
    const newProduct = {
      id: products.length + 1,
      name,
      image,
      category,
      originalPrice,
      price: newPrice,
    };
  
    products.push(newProduct);
    res.status(201).json(newProduct);
  };
  
  module.exports = { getProducts, getProductById, addProduct };
  