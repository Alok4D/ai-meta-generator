import React from 'react';
import { SlidersHorizontal, Upload, Sparkles, Globe } from 'lucide-react';
import { Space_Grotesk } from 'next/font/google';

const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function HowItWorks() {
  const steps = [
    {
      step: "STEP 01",
      title: "Configure your settings",
      description: "Choose your export platform (Adobe Stock, Shutterstock, Freepik, etc.), set title length, keyword count, and customize prefixes, suffixes, and negative keywords.",
      icon: <SlidersHorizontal size={24} className="text-white" />,
      bullets: [
        "Select from 6 stock platforms",
        "Set title length (20-200 chars)",
        "Choose keyword count (5-50)",
        "Add custom prefix & suffix",
        "Set negative keywords to exclude"
      ]
    },
    {
      step: "STEP 02",
      title: "Upload your files",
      description: "Drag and drop your images, videos, SVGs, or EPS files into the upload area. Process up to 500 files at once with batch generation.",
      icon: <Upload size={24} className="text-white" />,
      bullets: [
        "Supports images, videos, SVG & EPS",
        "Drag & drop or click to browse",
        "Up to 500 files per batch",
        "Preview your uploads instantly",
        "Remove or clear files anytime"
      ]
    },
    {
      step: "STEP 03",
      title: "AI generates metadata",
      description: "Click 'Generate All' and our AI analyzes each file to create optimized titles, descriptions, and keywords tailored to your chosen platform.",
      icon: <Sparkles size={24} className="text-white" />,
      bullets: [
        "AI-powered visual analysis",
        "Platform-specific optimization",
        "SEO-optimized keywords",
        "Contextual title generation"
      ]
    },
    {
      step: "STEP 04",
      title: "Export & upload",
      description: "Download your metadata as a ready-to-upload CSV file. Simply upload the CSV to your stock platform and you're done.",
      icon: <Globe size={24} className="text-white" />,
      bullets: [
        "One-click CSV export",
        "Platform-compatible format",
        "Edit metadata before export",
        "Re-generate individual files",
        "Copy keywords with one click"
      ]
    }
  ];

  return (
    <section id="how-it-works" className={`w-full bg-[#F3F5F7] py-24 md:py-32 ${space.className}`}>
      <div className="max-w-[800px] mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-[12px] font-bold tracking-[0.15em] text-slate-500 uppercase mb-4">
            HOW IT WORKS
          </h2>
          <h3 className="text-[36px] md:text-[48px] font-bold leading-[1.1] tracking-tight text-[#14181F] mb-6">
            From upload to export <br className="hidden md:block" />
            in four simple steps
          </h3>
          <p className="text-[16px] md:text-[17px] text-slate-500 font-sans max-w-xl mx-auto">
            CSVNest makes generating stock metadata effortless. Here's exactly how it works.
          </p>
        </div>

        {/* Steps Stack */}
        <div className="flex flex-col gap-6">
          {steps.map((item, index) => (
            <div 
              key={index} 
              className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row gap-6 md:gap-10 items-start transition-transform hover:-translate-y-1 duration-300"
            >
              {/* Left Side: Icon & Step */}
              <div className="flex flex-col items-center sm:min-w-[100px] shrink-0">
                <div className="w-[60px] h-[60px] bg-[#14181F] rounded-[18px] flex items-center justify-center shadow-md">
                  {item.icon}
                </div>
                <div className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mt-5">
                  {item.step}
                </div>
              </div>
              
              {/* Right Side: Content */}
              <div className="flex-1 pt-1">
                <h4 className="text-[20px] md:text-[22px] font-bold text-[#14181F] mb-3 leading-tight">
                  {item.title}
                </h4>
                
                <p className="text-[15px] text-slate-500 font-sans leading-[1.6]">
                  {item.description}
                </p>

                {item.bullets && (
                  <ul className="mt-5 space-y-2.5">
                    {item.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-center gap-3 text-[14px] text-slate-500 font-sans font-medium">
                        <div className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></div>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};