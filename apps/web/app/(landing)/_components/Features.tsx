import React from "react";
import { Sparkles, Upload, Layers, Zap, Shield, FileSpreadsheet, SlidersHorizontal, Cpu } from "lucide-react";
import { Space_Grotesk } from 'next/font/google';

const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function Features() {
  const features = [
    {
      icon: <Sparkles size={18} className="text-[#14181F]" />,
      title: "AI-Powered Metadata",
      description: "Generate titles, descriptions, and keywords automatically using Google Gemini AI. Our AI deeply analyzes visual content to produce accurate, SEO-optimized metadata.",
    },
    {
      icon: <Upload size={18} className="text-[#14181F]" />,
      title: "Batch Processing",
      description: "Upload hundreds of files at once and generate metadata for all of them in seconds. No more tedious one-by-one workflows.",
    },
    {
      icon: <Layers size={18} className="text-[#14181F]" />,
      title: "Multi-Platform Export",
      description: "Optimized CSV exports for Adobe Stock, Shutterstock, Freepik, Vecteezy, and Pond5. Each platform gets perfectly formatted metadata.",
    },
    {
      icon: <Zap size={18} className="text-[#14181F]" />,
      title: "Lightning Fast",
      description: "Process your entire portfolio in minutes, not hours. Our parallel processing engine handles 500+ files simultaneously.",
    },
    {
      icon: <Shield size={18} className="text-[#14181F]" />,
      title: "Accurate Keywords",
      description: "AI analyzes your images to generate highly relevant, SEO-optimized keywords that boost discoverability and sales.",
    },
    {
      icon: <FileSpreadsheet size={18} className="text-[#14181F]" />,
      title: "CSV Export",
      description: "Export ready-to-upload CSV files compatible with all major stock platforms. One click, perfectly formatted.",
    },
    {
      icon: <SlidersHorizontal size={18} className="text-[#14181F]" />,
      title: "Smart Prefix & Suffix",
      description: "Add custom prefixes and suffixes to titles automatically. Configure negative keywords to exclude unwanted terms.",
    },
    {
      icon: <Cpu size={18} className="text-[#14181F]" />,
      title: "Multiple AI Providers",
      description: "Choose between Google Gemini and other AI providers. Bring your own API key for maximum flexibility.",
    },
  ];

  return (
    <section className={`w-full bg-[#F3F5F7] py-24 md:py-32 ${space.className}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-[12px] font-bold tracking-[0.15em] text-slate-500 uppercase mb-4">
            FEATURES
          </h2>
          <h3 className="text-[36px] md:text-[56px] font-bold leading-[1.1] tracking-tight text-[#14181F] mb-6">
            Everything you need to <br className="hidden md:block" />
            <span className="text-slate-500">optimize your workflow</span>
          </h3>
          <p className="text-[16px] md:text-[17px] text-slate-500 font-sans max-w-xl mx-auto">
            Powerful tools designed for stock contributors who want to spend less time on metadata and more time creating.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col items-start transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="bg-[#EEF0F2] w-10 h-10 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h4 className="text-[18px] font-bold text-[#14181F] mb-3">
                {feature.title}
              </h4>
              <p className="text-[14px] text-slate-500 leading-[1.6] font-medium font-sans">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}