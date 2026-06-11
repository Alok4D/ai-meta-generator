import React from "react";
import { Sparkles, Upload, Layers, Zap, Shield, FileDown, ArrowRight } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Sparkles size={20} className="text-slate-700" />,
      title: "AI-Powered Metadata",
      description: "Generate titles, descriptions, and keywords automatically using Google Gemini AI.",
    },
    {
      icon: <Upload size={20} className="text-slate-700" />,
      title: "Batch Processing",
      description: "Upload hundreds of files at once and generate metadata for all of them in seconds.",
    },
    {
      icon: <Layers size={20} className="text-slate-700" />,
      title: "Multi-Platform Export",
      description: "Optimized for Adobe Stock, Shutterstock, Freepik, Vecteezy, and Pond5.",
    },
    {
      icon: <Zap size={20} className="text-slate-700" />,
      title: "Lightning Fast",
      description: "Process your entire portfolio in minutes, not hours. Save time and earn more.",
    },
    {
      icon: <Shield size={20} className="text-slate-700" />,
      title: "Accurate Keywords",
      description: "AI analyzes your images to generate highly relevant, SEO-optimized keywords.",
    },
    {
      icon: <FileDown size={20} className="text-slate-700" />,
      title: "CSV Export",
      description: "Export ready-to-upload CSV files compatible with all major stock platforms.",
    },
  ];

  return (
    <section className="w-full bg-[#F3F5F7] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-[12px] md:text-[13px] font-bold tracking-[0.15em] text-slate-500 uppercase mb-4">
            Features
          </h2>
          <h3 className="text-[36px] md:text-[48px] font-bold leading-[1.15] tracking-tight text-[#18181B]">
            Everything you need to <br className="hidden md:block" />
            <span className="text-slate-500">optimize your workflow</span>
          </h3>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-[#FBFCFC] rounded-[24px] p-8 md:p-10 border border-gray-200/50 shadow-sm flex flex-col items-start transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="bg-slate-200/60 w-11 h-11 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h4 className="text-[18px] font-bold text-[#18181B] mb-3">
                {feature.title}
              </h4>
              <p className="text-[15px] text-slate-500 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* View All Features Link */}
        <div className="mt-14 flex justify-center">
          <a 
            href="#" 
            className="flex items-center gap-2 text-[15px] font-bold text-[#18181B] hover:text-slate-600 transition-colors duration-200"
          >
            View all features
            <ArrowRight size={18} strokeWidth={2.5} />
          </a>
        </div>

      </div>
    </section>
  );
}