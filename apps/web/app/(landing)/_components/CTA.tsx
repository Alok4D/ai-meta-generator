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
        <div className="bg-[#18181B] rounded-[32px] px-6 py-16 md:py-20 flex flex-col items-center text-center shadow-lg border-0">
          
          <h2 className="text-[32px] md:text-[48px] font-bold text-white mb-5 tracking-tight leading-[1] md:leading-[48px]">
            {title}
          </h2>
          
          <p className="text-slate-400 text-[16px] md:text-[17px] max-w-xl mx-auto mb-10 leading-[1.6] font-medium font-sans">
            {subtitle}
          </p>
          
          <button className="bg-white hover:bg-gray-100 text-[#18181B] px-8 py-3.5 rounded-full flex items-center justify-center gap-2 text-[15px] font-bold transition-all duration-200 hover:scale-105 font-sans">
            {buttonText}
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
          
        </div>
        
      </div>
    </section>
  );
}