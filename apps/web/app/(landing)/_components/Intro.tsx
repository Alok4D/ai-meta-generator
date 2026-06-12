"use client";

import React from "react";
import { Sparkles, ArrowRight, PlayCircle, Upload, ImageIcon } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="w-full bg-[#EFF2F4] pt-20 pb-12 md:pb-24 px-4 md:px-8 flex flex-col items-center justify-center overflow-hidden">
      
      {/* Top Badge */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-8 shadow-sm">
        <Sparkles size={14} className="text-slate-500" />
        <span className="text-[14px] text-[#6A7181] font-normal leading-[20px] py-0.5">
          AI-powered stock metadata generation
        </span>
      </div>

      {/* Hero Headings */}
      <div className="text-center max-w-4xl mx-auto mb-6">
        <h1 className="text-[30px] md:text-[54px] lg:text-[72px] font-bold text-[#111827] leading-tight md:leading-[1] tracking-tight max-w-4xl mx-auto mb-6">
          Generate SEO-Optimized Metadata in Seconds
        </h1>
        {/* Subheading / Description */}
        <p className="text-[18px] text-[#6A7181] leading-[28px] font-normal mb-10 max-w-2xl mx-auto">
          AI Metadata Generator for Images & Stock Content. Upload your images, videos, and vectors — MetaGen AI uses AI to generate titles, descriptions, and keywords optimized for every major stock platform.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 md:mb-20 w-full sm:w-auto px-4">
       <Link href={"/dashboard/generator"} className="w-full sm:w-auto">
        <button className="w-full sm:w-auto bg-[#18181B] hover:bg-black text-white px-6 py-3 rounded-full flex items-center justify-center gap-2 text-[15px] font-medium transition-colors duration-200">
          Start for Free
          <ArrowRight size={18} strokeWidth={2} />
        </button>
       </Link>
        <Link href="/how-it-works" className="w-full sm:w-auto">
          <button className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-slate-700 px-6 py-3 rounded-full flex items-center justify-center gap-2 text-[15px] font-medium transition-colors duration-200 shadow-sm">
            <PlayCircle size={18} strokeWidth={2} />
            How it works
          </button>
        </Link>
      </div>

      {/* App Mockup Window */}
      <div className="hidden md:flex bg-white rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden w-full max-w-6xl mx-auto h-[600px] flex-col pointer-events-none select-none">
        
        {/* Mockup Header (Mac-style) */}
        <div className="h-12 bg-[#F9FAFB] border-b border-gray-100 flex items-center px-4 gap-2 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
          </div>
          <div className="mx-auto bg-white border border-gray-200 rounded text-[11px] font-medium text-gray-500 px-24 py-1 flex items-center justify-center font-sans tracking-wide">
            metagenai.com/app
          </div>
        </div>

        {/* Mockup Body */}
        <div className="flex p-4 md:p-6 gap-6 bg-[#FAFAFA] min-h-[400px]">
          
          {/* Sidebar (Hidden on small screens) */}
          <div className="hidden md:flex w-64 flex-col gap-6 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className=" w-8 h-8 flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="MetaGen AI" className="w-full h-full object-contain p-0.5" />
                </div>
                <span className="text-gray-900 font-medium text-sm tracking-tight">MetaGen AI</span>
              </div>
              <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">PRO</span>
            </div>

            <nav className="flex flex-col gap-1">
              <a href="#" className="bg-[#18181B] text-white text-[13px] font-medium px-3 py-2 rounded-lg">
                Generator
              </a>
              <a href="#" className="text-slate-500 hover:bg-gray-50 text-[13px] font-medium px-3 py-2 rounded-lg transition-colors">
                Events
              </a>
              <a href="#" className="text-slate-500 hover:bg-gray-50 text-[13px] font-medium px-3 py-2 rounded-lg transition-colors">
                Pricing
              </a>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-4">
            
            {/* Upload Section */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-3 text-slate-700">
                <Upload size={14} strokeWidth={2.5} />
                <h2 className="text-[13px] font-semibold">Upload Files</h2>
              </div>
              <div className="h-[110px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-white">
                <ImageIcon size={28} className="mb-2 text-slate-300" strokeWidth={1.5} />
                <p className="text-[12px] font-medium text-slate-500">Drag & drop files here</p>
              </div>
            </div>

            {/* Generated Results Section */}
            <div className="flex-1 bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-slate-700">
                <Sparkles size={14} strokeWidth={2.5} />
                <h2 className="text-[13px] font-semibold">Generated Results</h2>
              </div>
              
              <div className="grid grid-cols-3 gap-4 flex-1">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex flex-col gap-2 p-3 bg-[#F9FAFB] border border-gray-100 rounded-xl">
                    <div className="h-[140px] bg-[#EAECEE] rounded-lg w-full"></div>
                    <div className="h-2.5 bg-[#EAECEE] rounded-full w-[90%] mt-2"></div>
                    <div className="h-2.5 bg-[#EAECEE] rounded-full w-[60%]"></div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}