import React, { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "react-hot-toast";

const Newsletter = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    toast.success("Thank you for subscribing to our newsletter!");
    setNewsletterEmail("");
  };

  return (
    <section className="container mx-auto px-6 mt-8">
      <div className="relative bg-slate-900 border border-slate-800 rounded-[32px] p-8 md:p-12 text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_50%)]" />
        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          <div className="mx-auto w-12 h-12 bg-green-500/10 text-green-400 rounded-2xl flex items-center justify-center border border-green-500/20">
            <Mail className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Stay updated with fresh deals</h3>
            <p className="text-slate-400 text-xs md:text-sm">
              Subscribe to our weekly weekly list to receive discounts, stocking alerts, and holiday specials.
            </p>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 bg-slate-800/80 border border-slate-700/80 text-white rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-500 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition duration-200 shadow-lg shadow-green-600/10 cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
