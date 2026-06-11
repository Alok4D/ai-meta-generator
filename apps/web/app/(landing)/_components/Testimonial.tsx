"use client";

import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { Space_Grotesk } from 'next/font/google';

const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function Testimonials() {
  const reviews = [
    {
      text: "\"CSVNest cut my metadata workflow from 4 hours to 15 minutes. Absolutely game-changing for my stock portfolio. I used to dread uploading days, now I actually look forward to them.\"",
      name: "Sarah Chen",
      role: "Stock Photographer",
      initial: "S",
    },
    {
      text: "\"The AI understands my illustrations perfectly. Keywords are spot-on and my sales have increased 40% since switching. The batch processing alone saves me an entire day every week.\"",
      name: "Marcus Reid",
      role: "Digital Artist",
      initial: "M",
    },
    {
      text: "\"Finally a tool that handles video metadata too. The batch processing is incredibly fast and reliable. I've recommended CSVNest to every creator I know.\"",
      name: "Anika Patel",
      role: "Video Creator",
      initial: "A",
    },
    {
      text: "\"I was skeptical about AI-generated keywords but CSVNest proved me wrong. The quality is consistently high, and the platform-specific formatting saves me so much time.\"",
      name: "James Whitfield",
      role: "Freelance Photographer",
      initial: "J",
    },
    {
      text: "\"As someone with 10,000+ vectors on multiple platforms, CSVNest is a lifesaver. The multi-platform export feature alone is worth it. My workflow is 10x faster now.\"",
      name: "Lina Yamamoto",
      role: "Vector Illustrator",
      initial: "L",
    },
    {
      text: "\"The prefix and suffix features are brilliant for maintaining brand consistency across my portfolio. And the negative keywords option ensures I never get irrelevant tags.\"",
      name: "David Okafor",
      role: "Stock Contributor",
      initial: "D",
    }
  ];

  return (
    <section className={`w-full bg-[#F3F5F7] py-24 md:py-32 ${space.className}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-[12px] font-bold tracking-[0.15em] text-slate-500 uppercase mb-4">
            TESTIMONIALS
          </h2>
          <h3 className="text-[36px] md:text-[48px] font-bold leading-[1.1] tracking-tight text-[#14181F] mb-6">
            Loved by creators <br className="hidden md:block" />
            around the world
          </h3>
          <p className="text-[16px] md:text-[17px] text-slate-500 font-sans max-w-xl mx-auto">
            Hear from stock contributors who transformed their metadata workflow with CSVNest.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
          {reviews.map((review, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col transition-transform hover:-translate-y-1 duration-300 relative"
            >
              {/* Quote Icon SVG */}
              <svg className="w-10 h-10 text-slate-100 absolute top-6 left-8 mb-4" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>

              <div className="pt-8">
                {/* Stars */}
                <div className="flex items-center gap-1.5 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                
                {/* Review Text */}
                <p className="text-[15px] text-[#14181F] leading-[1.6] font-medium font-sans">
                  {review.text}
                </p>
                
                <div className="mt-8 flex items-center gap-3.5">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#EEF0F2] flex items-center justify-center text-[#14181F] font-bold text-[14px]">
                    {review.initial}
                  </div>
                  
                  {/* Author Info */}
                  <div className="flex flex-col font-sans">
                    <span className="text-[15px] font-bold text-[#14181F] leading-tight">
                      {review.name}
                    </span>
                    <span className="text-[12px] text-slate-500 mt-0.5">
                      {review.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}