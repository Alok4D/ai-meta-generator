"use client";

import React from "react";
import { Check, ArrowRight } from "lucide-react";
import { Space_Grotesk } from 'next/font/google';
import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";
import CTA from "../_components/CTA";
import { useGetSubscriptionsQuery } from "@/lib/feature/subscription/subscriptionApi";

const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function PricingPage() {
  const { data: plans = [], isLoading } = useGetSubscriptionsQuery(undefined);

  return (
    <>
      <Navbar />
      
      <section className={`w-full bg-[#F3F5F7] py-16 md:py-16 ${space.className} min-h-[80vh]`}>
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-16 md:mb-20">
           
            <h3 className="text-[36px] md:text-[56px] font-bold leading-[1.1] tracking-tight text-[#14181F] mb-6">
              Simple, transparent pricing
            </h3>
            <p className="text-[16px] md:text-[17px] text-slate-500 font-sans max-w-xl mx-auto">
              Choose the perfect plan for your needs. Upgrade anytime to unlock more features and credits.
            </p>
          </div>

          {/* Pricing Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14181F]"></div>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 text-slate-500 font-sans">
              No pricing plans available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start max-w-5xl mx-auto">
              {plans.map((plan: any, index: number) => (
                <div 
                  key={plan._id || index} 
                  className={`bg-white rounded-2xl p-8 flex flex-col relative transition-transform duration-300 hover:-translate-y-1
                    ${plan.isPopular 
                      ? 'shadow-[0_8px_40px_rgba(0,0,0,0.08)] border-2 border-[#14181F] md:-mt-4 md:mb-4' 
                      : 'shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100'}
                  `}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#14181F] text-white text-[12px] font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="mb-8">
                    <h4 className="text-[22px] font-bold text-[#14181F] mb-2">{plan.name}</h4>
                    <p className="text-[14px] text-slate-500 font-sans leading-[1.6] min-h-[44px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-[48px] font-bold text-[#14181F] leading-none">${plan.price}</span>
                    <span className="text-[15px] font-medium text-slate-500 font-sans">/{plan.period || 'mo'}</span>
                  </div>

                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features?.map((feature: string, fIndex: number) => (
                      <li key={fIndex} className="flex items-start gap-3 font-sans">
                        <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[#EEF0F2] flex items-center justify-center">
                          <Check className="text-[#14181F]" size={12} strokeWidth={3} />
                        </div>
                        <span className="text-[15px] text-[#14181F] font-medium leading-[1.5]">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all duration-200 font-sans text-[15px]
                      ${plan.isPopular 
                        ? 'bg-[#14181F] text-white hover:bg-black hover:scale-105' 
                        : 'bg-[#F3F5F7] text-[#14181F] hover:bg-[#EEF0F2]'}
                    `}
                  >
                    {plan.buttonText || "Get Started"} 
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTA 
        title="Start generating metadata today"
        subtitle={<>Try MetaGen AI for free with 150 daily credits. No credit card <br className="hidden sm:block" />required.</>}
        buttonText="Get Started Free"
      />
      <Footer />
    </>
  );
}