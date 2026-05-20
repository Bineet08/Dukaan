import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  { name: "Groceries", query: "grocery", emoji: "🍚", desc: "Rice, flour, oils & spices", bg: "bg-emerald-50 border-emerald-100 hover:border-emerald-200", text: "text-emerald-800" },
  { name: "Dairy", query: "grocery", emoji: "🥛", desc: "Milk, butter, paneer & eggs", bg: "bg-blue-50 border-blue-100 hover:border-blue-200", text: "text-blue-800" },
  { name: "Medicine", query: "medicine", emoji: "💊", desc: "OTC pills, wellness & first-aid", bg: "bg-red-50 border-red-100 hover:border-red-200", text: "text-red-800" },
  { name: "Beauty", query: "beauty", emoji: "🧴", desc: "Soaps, skin & hair care", bg: "bg-pink-50 border-pink-100 hover:border-pink-200", text: "text-pink-800" },
  { name: "Home", query: "home", emoji: "🏠", desc: "Cleaners, sprays & utility", bg: "bg-amber-50 border-amber-100 hover:border-amber-200", text: "text-amber-800" },
  { name: "Books", query: "books", emoji: "📚", desc: "Notebooks, pens & guides", bg: "bg-violet-50 border-violet-100 hover:border-violet-200", text: "text-violet-800" },
];

const Categories = () => {
  return (
    <section className="py-12 bg-white border-y border-slate-100/60">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-7">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-green-600">Quick Categories</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">Shop by Category</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Link
                to={`/products?category=${cat.query}`}
                className={`group flex flex-col h-full p-4 rounded-xl border transition-all ${cat.bg}`}
              >
                <span className="text-2xl mb-2.5 group-hover:scale-110 transition-transform duration-200">{cat.emoji}</span>
                <h3 className={`font-bold text-sm ${cat.text}`}>{cat.name}</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-relaxed">{cat.desc}</p>
                <div className={`mt-auto pt-2 flex items-center text-[10px] font-bold ${cat.text} gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity`}>
                  Browse <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
