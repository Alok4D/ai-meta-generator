import React from 'react';
import { Upload, Sparkles, Globe, ArrowRight } from 'lucide-react';

const HowItWorks = () =>{
  const steps = [
    {
      step: "STEP 01",
      title: "Upload your files",
      description: "Drag and drop your images, videos, SVGs, or EPS files. Process up to 500 files at once.",
      icon: <Upload size={20} className="text-white" />,
    },
    {
      step: "STEP 02",
      title: "AI generates metadata",
      description: "Our AI analyzes each file and generates optimized titles, descriptions, and keywords.",
      icon: <Sparkles size={20} className="text-white" />,
    },
    {
      step: "STEP 03",
      title: "Export & upload",
      description: "Download your CSV file and upload directly to your stock platform of choice.",
      icon: <Globe size={20} className="text-white" />,
    }
  ];

  return (
    <section className="w-full bg-white py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-[12px] md:text-[13px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-4">
            HOW IT WORKS
          </h2>
          <h3 className="text-[36px] md:text-[44px] font-bold leading-[1.15] tracking-tight text-[#111827]">
            Three simple steps
          </h3>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 px-4 md:px-0">
          {steps.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {/* Icon Container */}
              <div className="w-[60px] h-[60px] bg-[#18181B] rounded-[18px] flex items-center justify-center shadow-md mb-8 transition-transform hover:scale-105 duration-300">
                {item.icon}
              </div>
              
              {/* Step Label */}
              <div className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-3">
                {item.step}
              </div>
              
              {/* Title */}
              <h4 className="text-[19px] font-bold text-[#111827] mb-3">
                {item.title}
              </h4>
              
              {/* Description */}
              <p className="text-[15px] text-slate-500 leading-[1.6] max-w-[280px]">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Learn More Link */}
        <div className="mt-16 md:mt-20 flex justify-center">
          <a 
            href="#" 
            className="flex items-center gap-2 text-[15px] font-bold text-[#111827] hover:text-slate-600 transition-colors duration-200"
          >
            Learn more
            <ArrowRight size={18} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;