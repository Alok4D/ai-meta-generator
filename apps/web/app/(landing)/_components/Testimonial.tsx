"use client";

import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { Space_Grotesk } from 'next/font/google';

const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function Testimonials() {
  const reviews = [
    {
      text: "\"CSVNest cut my metadata workflow from 4 hours to 15 minutes. Absolutely game-changing.\"",
      name: "Sarah Chen",
      role: "Stock Photographer",
      initial: "S",
    },
    {
      text: "\"The AI understands my illustrations perfectly. My sales have increased 40% since switching.\"",
      name: "Marcus Reid",
      role: "Digital Artist",
      initial: "M",
    },
    {
      text: "\"Finally a tool that handles video metadata too. The batch processing is incredibly fast.\"",
      name: "Anika Patel",
      role: "Video Creator",
      initial: "A",
    },
  ];

  return (
    <section className={`w-full bg-[#F3F5F7] py-24 md:py-32 ${space.className}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-[12px] font-bold tracking-[0.15em] text-slate-500 uppercase mb-4">
            TESTIMONIALS
          </h2>
          <h3 className="text-[36px] md:text-[48px] font-bold leading-[1] md:leading-[48px] tracking-tight text-[#14181F]">
            Loved by creators
          </h3>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
          {reviews.map((review, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col transition-transform hover:-translate-y-1 duration-300"
            >
              {/* Stars */}
              <div className="flex items-center gap-1.5 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>
              
              {/* Review Text */}
              <p className="text-[15px] text-[#14181F] leading-[1.6] font-medium">
                {review.text}
              </p>
              
              <div className="mt-8 flex items-center gap-3.5">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#EEF0F2] flex items-center justify-center text-[#14181F] font-bold text-[14px]">
                  {review.initial}
                </div>
                
                {/* Author Info */}
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold text-[#14181F] leading-tight">
                    {review.name}
                  </span>
                  <span className="text-[12px] text-slate-500 mt-0.5">
                    {review.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Read More Link */}
        <div className="mt-16 flex justify-center">
          <a 
            href="#" 
            className="flex items-center gap-2 text-[15px] font-bold text-[#14181F] hover:text-slate-600 transition-colors duration-200"
          >
            Read more testimonials
            <ArrowRight size={18} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </section>
  );
}