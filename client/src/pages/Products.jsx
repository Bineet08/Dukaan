import React from 'react'
import ProductCard from "../components/ProductCard";

const sampleProducts = [
  { 
    id: 1, 
    name: "Fresh Milk", 
    price: 50, 
    originalPrice: 60,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop" 
  },
  { 
    id: 2, 
    name: "Basmati Rice", 
    price: 120, 
    originalPrice: 140,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop" 
  },
  { 
    id: 3, 
    name: "Antibacterial Soap", 
    price: 25, 
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop" 
  },
  { 
    id: 4, 
    name: "Wheat Flour", 
    price: 80, 
    originalPrice: 90,
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop" 
  },
  { 
    id: 5, 
    name: "Cooking Oil", 
    price: 150, 
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop" 
  },
  { 
    id: 6, 
    name: "Sugar", 
    price: 45, 
    originalPrice: 50,
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop" 
  },
];

const Products = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Products</h1>
        <p className="text-gray-600">Fresh quality products for your daily needs</p>
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sampleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {sampleProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default Products;