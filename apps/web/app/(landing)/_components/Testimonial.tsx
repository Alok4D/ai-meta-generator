"use client";

import React from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const Testimonials = () => {
  const reviews = [
    {
      text: "The AI descriptions and SEO tags are spot-on. My listings finally look consistent and professional.",
      name: "Mark L.",
      role: "Multi-vendor Store Owner",
    },
    {
      text: "Loved the accuracy. Images, videos, keywords — everything generated perfectly.",
      name: "Helena J.",
      role: "Fashion Retailer",
    },
    {
      text: "One photo in → complete listing out. This tool removed 90% of my manual work.",
      name: "Sarah M.",
      role: "Shopify Store Owner",
    },
    {
      text: "The speed is incredible. I can now launch 50 products in the time it used to take for one.",
      name: "David K.",
      role: "E-com Director",
    },
  ];

  return (
    <section className="w-full py-24 bg-[#F9FFF8] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-[#00A64C] text-4xl md:text-5xl font-bold mb-4">What Our Customer Say</h2>
          <div className="inline-block bg-[#E3F9EC] text-[#00A64C] text-[12px] font-bold px-4 py-1.5 rounded-full mb-6 border border-[#C1F1D6]">
            Trusted by 10,000+ E-commerce Sellers
          </div>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            Real users who streamlined their workflow, saved hours, and scaled their stores with AI-powered product uploads.
          </p>
        </div>

        {/* Swiper Slider */}
        <div className="relative px-12">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            centeredSlides={true}
            loop={true}
            autoplay={{ delay: 3000 }}
            navigation={{
              nextEl: '.next-btn',
              prevEl: '.prev-btn',
            }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="testimonial-swiper !overflow-visible"
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={index}>
                <div 
                  className={`
                    bg-[#EAF9F0] p-8 rounded-[32px] min-h-[320px] flex flex-col justify-between transition-transform duration-500
                    ${index % 2 === 0 ? 'rotate-[-3deg]' : 'rotate-[3deg]'} 
                    hover:rotate-0 hover:scale-105 border border-[#D5F2E1]
                  `}
                >
                  <div>
                    <Quote className="text-[#4ADE80] mb-6 fill-[#4ADE80] opacity-50" size={40} />
                    <p className="text-[#1A1A1A] text-xl font-semibold leading-snug">
                      &quot;{review.text}&quot;
                    </p>
                  </div>
                  
                  <div className="mt-8">
                    <p className="text-[#1A1A1A] font-bold text-sm">{review.name}</p>
                    <p className="text-gray-500 text-[12px]">{review.role}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-12">
            <button className="prev-btn w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-[#00A64C] hover:text-white hover:border-[#00A64C] transition-all">
              <ChevronLeft size={24} />
            </button>
            <button className="next-btn w-12 h-12 rounded-full border border-[#00A64C] flex items-center justify-center text-[#00A64C] hover:bg-[#00A64C] hover:text-white transition-all">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;