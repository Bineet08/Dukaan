import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import axiosInstance from "../lib/axios";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const { data } = await axiosInstance.get("/products");

        if (!isMounted) return;

        setProducts(data.products || []);
      } catch (err) {
        console.error("FETCH PRODUCTS ERROR:", err);
        if (isMounted) setError("Unable to load products");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="text-center py-20">Loading products…</div>;
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Our Products
        </h1>
        <p className="text-gray-600">
          Fresh quality products for your daily needs
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No products available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
