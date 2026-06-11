import React from "react";
import { ArrowRight } from "lucide-react";
import { Space_Grotesk } from "next/font/google";

const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

interface CTAProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  buttonText?: string;
}

export default function CTA({ 
  title = "Ready to automate your workflow?", 
  subtitle = <>Join thousands of stock contributors who save hours <br className="hidden sm:block" />every week with MetaGen AI.</>,
  buttonText = "Get Started Free"
}: CTAProps) {
  return (
    <section className={`w-full bg-[#F3F5F7] py-20 md:py-28 ${space.className}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        
        {/* CTA Card */}
        <div className="bg-[#18181B] rounded-[30px] px-6 py-16 md:py-16 flex flex-col items-center text-center">
          
          <h2 className="text-[32px] md:text-[48px] font-bold text-white mb-5 tracking-tight leading-[1] md:leading-[48px]">
            {title}
          </h2>
          
          <p className="text-white/70 text-[18px] max-w-xl mx-auto mb-10 leading-[28px] font-normal">
            {subtitle}
          </p>
          
          <button className="bg-white hover:bg-gray-100 text-[#14181F] px-8 py-3.5 rounded-full flex items-center justify-center gap-2 text-[14px] leading-[20px] font-semibold transition-all duration-200 hover:scale-105">
            {buttonText}
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
          
        </div>
        
      </div>
    </section>
  );
}