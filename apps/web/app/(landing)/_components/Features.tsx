"use client";

import { Sparkles, Upload, Layers, Zap, Shield, FileSpreadsheet, SlidersHorizontal, Cpu, ArrowRight, Eraser } from "lucide-react";
import { Space_Grotesk } from 'next/font/google';
import Link from "next/link";
import { motion } from "framer-motion";

const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

interface FeaturesProps {
  limit?: number;
}

export default function Features({ limit }: FeaturesProps) {
  const features = [
    {
      icon: <Sparkles size={18} className="text-[#14181F]" />,
      title: "AI-Powered Metadata",
      description: "Generate titles, descriptions, and keywords automatically using Google Gemini AI.",
    },
    {
      icon: <Upload size={18} className="text-[#14181F]" />,
      title: "Batch Processing",
      description: "Upload hundreds of files at once and generate metadata for all of them in seconds.",
    },
    {
      icon: <Layers size={18} className="text-[#14181F]" />,
      title: "Multi-Platform Export",
      description: "Optimized for Adobe Stock, Shutterstock, Freepik, Vecteezy, and Pond5.",
    },
    {
      icon: <Zap size={18} className="text-[#14181F]" />,
      title: "Lightning Fast",
      description: "Process your entire portfolio in minutes, not hours. Save time and earn more.",
    },
    {
      icon: <Shield size={18} className="text-[#14181F]" />,
      title: "Accurate Keywords",
      description: "AI analyzes your images to generate highly relevant, SEO-optimized keywords.",
    },
    {
      icon: <FileSpreadsheet size={18} className="text-[#14181F]" />,
      title: "CSV Export",
      description: "Export ready-to-upload CSV files compatible with all major stock platforms.",
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
    {
      icon: <Eraser size={18} className="text-[#14181F]" />,
      title: "AI Background Remover",
      description: "Instantly remove backgrounds from your images with high precision using advanced AI models.",
    },
  ];

  const displayFeatures = limit ? features.slice(0, limit) : features;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={`w-full bg-[#F3F5F7] py-20 md:py-20 ${space.className}`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-16 md:mb-20">
          {limit && (
            <h2 className="text-[14px] font-semibold tracking-[0.15em] text-[#6A7181] leading-[20px] uppercase mb-4">
              FEATURES
            </h2>
          )}
          <h3 className="text-[36px] md:text-[48px] font-bold md:leading-[50px] tracking-tight text-[#14181F] mb-6">
            Everything you need to <br className="hidden md:block" />
            <span className="text-slate-500">optimize your workflow</span>
          </h3>
          {!limit && (
            <p className="text-[16px] md:text-[17px] text-slate-500 font-sans max-w-xl mx-auto">
              Powerful tools designed for stock contributors who want to spend less time on metadata and more time creating.
            </p>
          )}
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-4 items-stretch">
          {displayFeatures.map((feature, index) => (
            <motion.div 
              variants={itemVariants}
              key={index} 
              className="bg-[#FBFCFC] rounded-xl p-6 md:p-8 border border-gray-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col items-start transition-transform duration-300 hover:-translate-y-1 h-full"
            >
              <div className="bg-[#EEF0F2] w-10 h-10 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h4 className="text-[18px] font-bold text-[#14181F] mb-3">
                {feature.title}
              </h4>
              <p className="text-[14px] text-[#6A7181] leading-[23px] font-normal">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* View All Features Link */}
        {limit && limit < features.length && (
          <div className="mt-12 flex justify-center">
            <Link 
              href="/features" 
              className="inline-flex items-center gap-2 text-[14px] font-semibold leading-[20px] text-[#14181F] hover:text-[#6A7181] transition-colors"
            >
              View all features
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        )}
      </div>
    </motion.section>
  );
}