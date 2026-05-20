import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, Zap, Clock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <section className="relative overflow-hidden bg-slate-900 rounded-2xl mx-3 sm:mx-4 mt-3">
      {/* Single subtle glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(16,185,129,0.12),transparent_60%)]" />

      <div className="relative z-10 container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-6 sm:px-10 py-12 sm:py-16">

        {/* Left content */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-semibold">
              <Zap className="h-3 w-3" /> Same-day delivery available
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.12]"
          >
            Your neighbourhood{" "}
            <span className="text-green-400">store</span>,<br className="hidden sm:inline" /> now online.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-slate-400 text-sm sm:text-base max-w-md"
          >
            Groceries, medicines & daily essentials — delivered fast from your trusted local store.
          </motion.p>

          {/* Search */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            onSubmit={handleSearch}
            className="flex items-center gap-2 p-1.5 bg-white/[0.07] border border-white/10 rounded-xl max-w-sm hover:border-white/20 focus-within:border-green-500/40 transition-all"
          >
            <div className="pl-3 text-slate-500">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-0 py-2 px-1 text-sm placeholder:text-slate-500 focus:outline-none text-white"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition cursor-pointer shrink-0"
            >
              Search
            </button>
          </motion.form>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex flex-wrap gap-3"
          >
            <button
              onClick={() => navigate("/products")}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 group cursor-pointer"
            >
              Shop Now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/products?category=grocery")}
              className="bg-white/[0.07] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white px-6 py-3 rounded-xl font-bold text-sm transition cursor-pointer"
            >
              Browse Offers
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap gap-5 pt-3 border-t border-white/5"
          >
            {[
              { icon: Zap, text: "Same-Day Delivery" },
              { icon: Clock, text: "Order Tracking" },
              { icon: ShieldCheck, text: "Fresh Guarantee" },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-1.5 text-slate-500">
                <b.icon className="h-3.5 w-3.5 text-green-500/60" />
                <span className="text-[11px] font-medium">{b.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — image */}
        <div className="lg:col-span-5 hidden lg:flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-green-500/10 rounded-full blur-3xl" />
            <div className="relative rounded-2xl overflow-hidden border border-white/10 max-w-[300px]">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fm=webp&q=80"
                alt="Fresh groceries"
                className="w-full h-[340px] object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 bg-white/10 backdrop-blur-lg border border-white/15 rounded-xl p-3 flex items-center gap-2.5">
                <div className="h-8 w-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Open Now</p>
                  <p className="text-[11px] font-medium text-white/70">Delivery slots active</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
