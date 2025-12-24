import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import axiosInstance from "../lib/axios";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH FEATURED PRODUCTS
     ========================= */
  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedProducts = async () => {
      try {
        const { data } = await axiosInstance.get("/products");

        if (!isMounted) return;

        const products = data.products || [];
        setFeaturedProducts(products.slice(0, 4));
      } catch (error) {
        console.error("FETCH FEATURED PRODUCTS ERROR:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFeaturedProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    {
      name: "Dairy Products",
      image:
        "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop",
      description: "Fresh milk, yogurt, and dairy essentials",
    },
    {
      name: "Grains & Cereals",
      image:
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop",
      description: "Rice, wheat, and premium grains",
    },
    {
      name: "Personal Care",
      image:
        "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop",
      description: "Soaps, shampoos, and hygiene products",
    },
    {
      name: "Fresh Vegetables",
      image:
        "https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=300&fit=crop",
      description: "Farm fresh vegetables daily",
    },
    {
      name: "Medicines",
      image: "#",
      description: "Medicines for daily requirement",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-500 to-green-700 text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to Gupta General Store
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Your neighborhood store for fresh products, daily essentials, and
            quality groceries at affordable prices
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Shop Now
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Shop by Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/products?category=${encodeURIComponent(
                  category.name
                )}`}
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl">
                  <div className="h-48">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-gray-600">
              Our most popular and recommended items
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-600">
              Loading featured products...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/products"
              className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
