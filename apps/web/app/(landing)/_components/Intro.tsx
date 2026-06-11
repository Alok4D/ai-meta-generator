"use client";

import React from "react";
import { Sparkles, ArrowRight, AppWindow, Upload, Image as ImageIcon } from "lucide-react";

export default function Hero() {
  return (
    <section className="w-full bg-[#EFF2F4] pt-20 pb-24 px-4 md:px-8 flex flex-col items-center justify-center overflow-hidden">
      
      {/* Top Badge */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-8 shadow-sm">
        <Sparkles size={14} className="text-slate-500" />
        <span className="text-[13px] text-slate-600 font-medium">
          AI-powered stock metadata generation
        </span>
      </div>

      {/* Hero Headings */}
      <div className="text-center max-w-4xl mx-auto mb-6">
        <h1 className="text-[40px] leading-[1.1] md:text-[64px] font-bold tracking-tight text-[#18181B]">
          Generate Stock <br className="hidden md:block" />
          <span className="text-slate-600">Metadata in Seconds</span>
        </h1>
      </div>

      <p className="text-base md:text-lg text-slate-500 text-center max-w-2xl mb-10 leading-relaxed px-4">
        Upload your images, videos, and vectors — CSVNest uses AI to generate titles, descriptions, and keywords optimized for every major stock platform.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full sm:w-auto px-4">
        <button className="w-full sm:w-auto bg-[#18181B] hover:bg-black text-white px-6 py-3 rounded-full flex items-center justify-center gap-2 text-[15px] font-medium transition-colors duration-200">
          Start for Free
          <ArrowRight size={18} strokeWidth={2} />
        </button>
        <button className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-200 text-slate-700 px-6 py-3 rounded-full flex items-center justify-center gap-2 text-[15px] font-medium transition-colors duration-200 shadow-sm">
          <AppWindow size={18} strokeWidth={2} />
          Chrome Extension
        </button>
      </div>

      {/* App Mockup Window */}
      <div className="w-full max-w-[1000px] bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-200 flex flex-col overflow-hidden">
        
        {/* Mockup Header (Mac-style) */}
        <div className="h-12 border-b border-gray-100 flex items-center px-4 relative bg-white">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 bg-[#EFF2F4] px-4 py-1.5 rounded-full text-[11px] text-slate-500 font-medium">
            csvnest.com/app
          </div>
        </div>

        {/* Mockup Body */}
        <div className="flex p-4 md:p-6 gap-6 bg-[#FAFAFA] min-h-[400px]">
          
          {/* Sidebar (Hidden on small screens) */}
          <div className="hidden md:flex w-64 flex-col gap-6 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="bg-[#18181B] w-7 h-7 rounded flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.5 2C21.5 2 18.5 3 16 5.5C13.5 8 11.5 10 11.5 10L9 9.5L10 12.5L5 16L7.5 14L4 21L10.5 15.5L13 18L13 13.5C13 13.5 16.5 12.5 19 9.5C21.5 6.5 21.5 2 21.5 2Z" />
                  </svg>
                </div>
                <span className="text-gray-900 font-bold text-sm tracking-tight">CSVNest</span>
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
              <a href="#" className="text-slate-500 hover:bg-gray-50 text-[13px] font-medium px-3 py-2 rounded-lg transition-colors mt-4">
                Pricing
              </a>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-slate-700">
              <Upload size={16} strokeWidth={2} />
              <h2 className="text-[13px] font-semibold">Upload Files</h2>
            </div>
            
            <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer min-h-[250px]">
              <ImageIcon size={32} className="mb-3 text-slate-300" strokeWidth={1.5} />
              <p className="text-[13px] font-medium text-slate-500">Drag & drop files here</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}