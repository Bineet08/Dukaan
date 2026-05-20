import React from "react";
import { Users, ShoppingBag, Star, CheckCircle2 } from "lucide-react";

const stats = [
  { icon: Users, value: "1,500+", label: "Happy Customers" },
  { icon: ShoppingBag, value: "250+", label: "Products Catalog" },
  { icon: Star, value: "4.9★", label: "Store Rating" },
  { icon: CheckCircle2, value: "100%", label: "Satisfaction Guaranteed" }
];

const Stats = () => {
  return (
    <section className="container mx-auto px-6 -mt-8 relative z-20">
      <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y divide-slate-100 lg:divide-y-0 lg:divide-x divide-slate-100">
          {stats.map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center p-3 pt-6 lg:pt-3">
                <div className="p-3 bg-green-50 text-green-700 rounded-2xl mb-3.5">
                  <StatIcon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">{stat.value}</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;
