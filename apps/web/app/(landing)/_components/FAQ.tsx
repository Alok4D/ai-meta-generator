"use client";

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Default first one open

  const faqs = [
    {
      question: "Is the AI-generated content SEO-friendly?",
      answer: "Yes. All descriptions and meta tags are optimized using SEO best practices. The AI analyzes keywords, search intent, and product type to ensure your listings rank better on Shopify and WooCommerce."
    },
    {
      question: "Can I edit the AI-generated descriptions?",
      answer: "Absolutely. You have full control over all content generated. You can tweak, refine, or rewrite any part of the descriptions before publishing."
    },
    {
      question: "Which platforms are supported?",
      answer: "We currently support Shopify and WooCommerce, with more platforms like Wix, BigCommerce, and Etsy coming soon."
    },
    {
      question: "How accurate is the AI when generating product details?",
      answer: "Our AI is highly accurate, trained on millions of e-commerce data points to identify product features, materials, and categories from just an image."
    },
    {
      question: "Do I need any technical skills to use it?",
      answer: "No technical skills required. If you can upload a photo, you can use eComSnap to build a professional product listing."
    }
  ];

  return (
    <section className="relative w-full py-24 px-4 overflow-hidden bg-[#E9F9EF]">
      {/* Background Ripple Effect */}
      <div className="absolute inset-0 z-0 opacity-40" 
        style={{ 
          background: 'radial-gradient(circle at center, #C1FFDB 0%, transparent 70%)' 
        }}>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-white text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full mb-6 shadow-sm border border-gray-100">
            FAQs
          </div>
          <h2 className="text-[#111827] text-4xl md:text-5xl font-bold leading-tight">
            Frequently Asked Questions <br />
            Everything You Need to Know
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={`
                border border-[#89D6AE] rounded-2xl overflow-hidden transition-all duration-300
                ${openIndex === index ? 'bg-[#D1F2DE]/50' : 'bg-white/40 hover:bg-white/60'}
              `}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left group"
              >
                <span className="text-lg font-bold text-[#111827]">
                  {faq.question}
                </span>
                <div className="shrink-0 ml-4">
                  {openIndex === index ? (
                    <Minus className="text-gray-600" size={20} />
                  ) : (
                    <Plus className="text-gray-600" size={20} />
                  )}
                </div>
              </button>

              <div 
                className={`
                  transition-all duration-300 ease-in-out
                  ${openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed max-w-[90%]">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;