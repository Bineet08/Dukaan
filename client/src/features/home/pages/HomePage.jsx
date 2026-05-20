import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../products/components/ProductCard";
import { productService } from "../../products/services/productService";
import { ArrowRight, Truck, Percent, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import Hero from "../components/Hero";
import Categories from "../components/Categories";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetch = async () => {
      try {
        const data = await productService.getProducts({}, controller.signal);
        setProducts(data.products || []);
      } catch (error) {
        if (error.name === "CanceledError" || error.name === "AbortError") return;
        console.error("FETCH ERROR:", error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetch();
    return () => controller.abort();
  }, []);

  const trending = products.slice(0, 4);
  const featured = products.slice(4, 12);

  const SectionHeader = ({ label, title, linkTo, linkText }) => (
    <div className="flex items-end justify-between mb-6">
      <div>
        {label && <span className="text-[11px] font-bold uppercase tracking-wider text-green-600">{label}</span>}
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">{title}</h2>
      </div>
      {linkTo && (
        <Link to={linkTo} className="text-green-600 hover:text-green-700 font-semibold text-xs flex items-center gap-1 transition group">
          {linkText} <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );

  const SkeletonGrid = ({ count = 4 }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-64 sm:h-72 bg-white border border-slate-100 rounded-2xl p-3 flex flex-col gap-3">
          <div className="w-full h-32 sm:h-36 rounded-xl shimmer" />
          <div className="h-4 w-3/4 rounded shimmer" />
          <div className="h-4 w-1/2 rounded shimmer mt-auto" />
        </div>
      ))}
    </div>
  );

  const ProductGrid = ({ items }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* 1. Hero */}
      <Hero />

      {/* 2. Value props — compact strip */}
      <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { icon: Truck, title: "Free Delivery", desc: "Orders ₹500+", color: "text-green-600 bg-green-50" },
            { icon: Percent, title: "Daily Deals", desc: "Up to 40% off", color: "text-amber-600 bg-amber-50" },
            { icon: ShieldCheck, title: "Fresh Promise", desc: "Quality guaranteed", color: "text-violet-600 bg-violet-50" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * i }}
              className="flex items-center gap-2.5 p-3 bg-white border border-slate-100 rounded-xl"
            >
              <div className={`p-2 rounded-lg shrink-0 ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">{item.title}</p>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Categories */}
      <Categories />

      {/* 4. Trending Products */}
      <section className="container mx-auto px-4 py-10">
        <SectionHeader label="Popular now" title="Trending Products" linkTo="/products" linkText="See all" />
        {loading ? <SkeletonGrid count={4} /> : <ProductGrid items={trending} />}
      </section>

      {/* 5. Offer banner — one clean strip */}
      <section className="container mx-auto px-4 pb-10">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-white font-bold text-sm">15% off on Beauty & Personal Care</p>
            <p className="text-orange-100 text-xs mt-0.5">
              Use code <span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-white font-bold">CARE15</span> at checkout
            </p>
          </div>
          <Link
            to="/products?category=beauty"
            className="bg-white text-orange-600 font-bold text-xs px-4 py-2 rounded-lg hover:bg-orange-50 transition shrink-0"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* 6. Featured / More Products */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 pb-10">
          <SectionHeader title="More to Explore" linkTo="/products" linkText="View all" />
          {loading ? <SkeletonGrid count={8} /> : <ProductGrid items={featured} />}
        </section>
      )}
    </div>
  );
};

export default HomePage;
