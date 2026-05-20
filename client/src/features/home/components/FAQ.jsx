import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "What are your store hours and delivery slots?",
    a: "Our neighborhood physical store is open from 8:00 AM to 9:30 PM. Delivery slots are active daily from 9:00 AM to 8:00 PM."
  },
  {
    q: "Is there a minimum order amount for free delivery?",
    a: "Yes! Delivery is completely free for all orders above ₹500. For orders under ₹500, a small local flat shipping fee of ₹40 applies."
  },
  {
    q: "How do I return or exchange an item?",
    a: "If there's any issue with product freshness or damage, you can request an easy exchange or return within 24 hours of delivery directly via our support phone line."
  }
];

const FAQ = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-3xl space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-green-600">FAQ</span>
          <h2 className="text-3xl font-extrabold text-slate-800">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 text-sm md:text-base cursor-pointer hover:bg-slate-50/50"
                >
                  <span>{faq.q}</span>
                  <span className="p-1 bg-slate-50 rounded-lg text-slate-500">
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>

                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-40 border-t border-slate-50" : "max-h-0"
                  }`}
                >
                  <p className="p-5 text-xs md:text-sm text-slate-500 leading-relaxed bg-slate-50/20">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
