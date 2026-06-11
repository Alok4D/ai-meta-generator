"use client";

import React, { useState } from "react";
import { Moon, ArrowRight, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "#" },
    { name: "How it works", href: "#" },
    { name: "Testimonials", href: "#" },
    { name: "Pricing", href: "#" },
  ];

  return (
    <nav className="w-full bg-[#F3F5F6]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-[72px]">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="bg-[#18181B] w-9 h-9 rounded-lg flex items-center justify-center">
              {/* Custom SVG to match the specific bird logo in the design */}
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="white" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21.5 2C21.5 2 18.5 3 16 5.5C13.5 8 11.5 10 11.5 10L9 9.5L10 12.5L5 16L7.5 14L4 21L10.5 15.5L13 18L13 13.5C13 13.5 16.5 12.5 19 9.5C21.5 6.5 21.5 2 21.5 2Z" />
              </svg>
            </div>
            <span className="text-gray-900 font-bold text-lg tracking-tight">
              CSVNest
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-slate-500 hover:text-slate-900 text-[15px] font-medium transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Section: Dark Mode & Action Button */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              className="text-slate-500 hover:text-slate-900 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              <Moon size={20} strokeWidth={2} />
            </button>
            <button className="bg-[#18181B] hover:bg-black text-white px-5 py-2.5 rounded-full flex items-center gap-2 text-[15px] font-medium transition-colors duration-200">
              Get Started
              <ArrowRight size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button className="text-slate-500 hover:text-slate-900 transition-colors">
              <Moon size={20} strokeWidth={2} />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-800 hover:text-black focus:outline-none"
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-80 border-t border-gray-200/60" : "max-h-0"
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1 bg-[#F3F5F6] shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block px-3 py-3 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 px-3">
            <button className="w-full bg-[#18181B] hover:bg-black text-white px-5 py-3.5 rounded-full flex items-center justify-center gap-2 text-base font-medium transition-colors">
              Get Started
              <ArrowRight size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}