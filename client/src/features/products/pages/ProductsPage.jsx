import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { productService } from "../services/productService";
import { handleApiError } from "../../../lib/errorHandler";
import { PRODUCT_CATEGORIES } from "../../../constants";
import { Grid, Search, HelpCircle, ArrowLeft } from "lucide-react";

// Emoji map for categories
const categoryEmojis = {
  "": "🛍️",
  "grocery": "🍚",
  "beauty": "🧴",
  "home": "🏠",
  "medicine": "💊",
  "electronics": "⚡",
  "fashion": "👕",
  "sports": "⚽",
  "books": "📚",
  "other": "📦"
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFilter = searchParams.get("category") || "";
  const searchFilter = searchParams.get("search") || "";

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {};
        if (categoryFilter) params.category = categoryFilter;
        if (searchFilter) params.search = searchFilter;

        const data = await productService.getProducts(params, controller.signal);
        setProducts(data.products || []);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") {
          return;
        }
        console.error("FETCH PRODUCTS ERROR:", err);
        setError(handleApiError(err, "Unable to load products"));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, [categoryFilter, searchFilter]);

  const handleCategorySelect = (value) => {
    const currentParams = {};
    if (searchFilter) currentParams.search = searchFilter;
    if (value) currentParams.category = value;
    setSearchParams(currentParams);
  };

  const clearSearch = () => {
    const currentParams = {};
    if (categoryFilter) currentParams.category = categoryFilter;
    setSearchParams(currentParams);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Title Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          {searchFilter ? "Search Results" : "Explore Products"}
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          {searchFilter ? (
            <span>
              Showing matches for <strong className="text-slate-800">"{searchFilter}"</strong>
              {categoryFilter && <span> in <strong className="text-slate-800">{categoryFilter}</strong></span>}
            </span>
          ) : (
            "Fresh quality products from your neighborhood physical store"
          )}
        </p>
      </div>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        {PRODUCT_CATEGORIES.map((cat) => {
          const isSelected = categoryFilter === cat.value;
          const emoji = categoryEmojis[cat.value] || "🏷️";
          return (
            <button
              key={cat.name}
              onClick={() => handleCategorySelect(cat.value)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-soft border ${
                isSelected
                  ? "bg-green-600 border-green-600 text-white"
                  : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200"
              }`}
            >
              <span>{emoji}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main product display grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col gap-3 shadow-card"
            >
              <div className="w-full aspect-square rounded-xl shimmer shrink-0" />
              <div className="h-3 w-1/3 rounded shimmer" />
              <div className="h-5 w-3/4 rounded shimmer" />
              <div className="flex justify-between items-center mt-4 pt-2">
                <div className="h-4 w-1/4 rounded shimmer" />
                <div className="h-9 w-20 rounded-xl shimmer shrink-0" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500 font-semibold">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 max-w-md mx-auto flex flex-col items-center justify-center space-y-5 bg-white border border-slate-100 rounded-3xl p-8 shadow-soft">
          <div className="p-4 bg-slate-50 rounded-full text-slate-400">
            <Search className="h-10 w-10" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">No products found</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              We couldn't find any products matching your search query. Try checking your spelling or selecting a different category.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={clearSearch}
              className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              Clear Search
            </button>
            <button
              onClick={() => handleCategorySelect("")}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              View All Products
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
