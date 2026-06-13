"use client";

import React from 'react';
import { SlidersHorizontal, Upload, Sparkles, Globe } from 'lucide-react';
import { Space_Grotesk } from 'next/font/google';
import { motion } from 'framer-motion';

const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

interface HowItWorksProps {
  variant?: 'landing' | 'full';
}

export default function HowItWorks({ variant = 'full' }: HowItWorksProps) {
  const detailedSteps = [
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

  const landingSteps = [
    {
      step: "STEP 01",
      title: "Upload your files",
      description: "Drag and drop your images, videos, SVGs, or EPS files. Process up to 500 files at once.",
      icon: <Upload size={28} className="text-white" />
    },
    {
      step: "STEP 02",
      title: "AI generates metadata",
      description: "Our AI analyzes each file and generates optimized titles, descriptions, and keywords.",
      icon: <Sparkles size={28} className="text-white" />
    },
    {
      step: "STEP 03",
      title: "Export & upload",
      description: "Download your CSV file and upload directly to your stock platform of choice.",
      icon: <Globe size={28} className="text-white" />
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  if (variant === 'landing') {
    return (
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        id="how-it-works" 
        className={`w-full bg-[#F9FAFB] py-20 md:py-20 ${space.className}`}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-0">
          
          <motion.div variants={itemVariants} className="text-center mb-16 md:mb-20">
         
              <h2 className="text-[14px] font-semibold tracking-[0.15em] text-[#6A7181] leading-[20px] uppercase mb-4">
           HOW IT WORKS
          </h2>
            <h3 className="text-[36px] md:text-[48px] font-bold leading-tight md:leading-[48px] tracking-tight text-[#14181F]">
              Three simple steps
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 items-start">
            {landingSteps.map((item, index) => (
              <motion.div variants={itemVariants} key={index} className="flex flex-col items-center text-center">
                <div className="w-[64px] h-[64px] bg-[#14181F] rounded-[20px] flex items-center justify-center shadow-md mb-6 transition-transform hover:-translate-y-1 duration-300">
                  {item.icon}
                </div>
                <div className="text-[10px] font-bold leading-[15px] tracking-[0.15em] text-[#6A7181] uppercase mb-3">
                  {item.step}
                </div>
                <h4 className="text-[18px] font-bold leading-[28px] text-[#14181F] mb-3">
                  {item.title}
                </h4>
                <p className="text-[14px] text-[#6A7181] leading-[1.6] max-w-[280px]">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <a href="/how-it-works" className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#14181F] hover:text-[#6A7181] transition-colors">
              Learn more
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>

        </div>
      </motion.section>
    );
  }

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      id="how-it-works" 
      className={`w-full bg-[#F3F5F7] py-24 md:py-24 ${space.className}`}
    >
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-16 md:mb-20">
          <h3 className="text-[36px] md:text-[60px] font-bold leading-tight md:leading-[60px] tracking-tight text-[#14181F] mb-6">
            From upload to export <br className="hidden md:block" />
            in four simple steps
          </h3>
          <p className="text-[16px] leading-[24px] font-normal text-[#14181F] max-w-xl mx-auto">
            MetaGen AI makes generating stock metadata effortless. Here's exactly how it works.
          </p>
        </motion.div>

        {/* Steps Stack */}
        <div className="flex flex-col gap-6">
          {detailedSteps.map((item, index) => (
            <motion.div 
              variants={itemVariants}
              key={index} 
              className="bg-white rounded-[20px] p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row gap-6 md:gap-10 items-start transition-transform hover:-translate-y-1 duration-300"
            >
              {/* Left Side: Icon & Step */}
              <div className="flex flex-col items-center sm:min-w-[100px] shrink-0">
                <div className="w-[60px] h-[60px] bg-[#14181F] rounded-[18px] flex items-center justify-center shadow-md">
                  {item.icon}
                </div>
                <div className="text-[11px] font-bold tracking-[0.15em] text-[#6A7181] uppercase mt-5">
                  {item.step}
                </div>
              </div>
              
              {/* Right Side: Content */}
              <div className="flex-1 pt-1">
                <h4 className="text-[20px] md:text-[22px] font-bold text-[#14181F] mb-3 leading-tight">
                  {item.title}
                </h4>
                
                <p className="text-[15px] text-[#6A7181] font-sans leading-[1.6]">
                  {item.description}
                </p>

                {item.bullets && (
                  <ul className="mt-5 space-y-2.5">
                    {item.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-center gap-3 text-[14px] text-[#6A7181] font-sans font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6A7181] opacity-60 shrink-0"></div>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.section>
  );
};