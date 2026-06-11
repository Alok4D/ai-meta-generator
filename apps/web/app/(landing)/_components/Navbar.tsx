"use client";

import React, { useState } from "react";
import { Moon, ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Features", href: "/features" },
    { name: "How it works", href: "/how-it-works" },
    { name: "Testimonials", href: "/testimonials" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <nav className="w-full bg-[#F3F5F6] sticky top-0 z-50 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        <div className="flex justify-between items-center h-[72px]">
          
          {/* Logo Section */}
        <Link href={"/"}>
          <div className="flex items-center gap-1 cursor-pointer">
            <img src="/logo.png" alt="MetaGen AI Logo" className="w-10 h-10 object-contain" />
            <span className="text-gray-900 font-bold text-xl tracking-tight">
              MetaGen AI
            </span>
          </div>
        </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[15px] transition-colors duration-200 ${
                    isActive ? "text-gray-900 font-bold" : "text-slate-500 font-medium hover:text-slate-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Section: Dark Mode & Action Button */}
          <div className="hidden md:flex items-center gap-6">
           
            <Link href={"/login"}>
            <button className="bg-[#18181B] hover:bg-black text-white px-5 py-2.5 rounded-full flex items-center gap-2 text-[15px] font-medium transition-colors duration-200">
              Get Started
              <ArrowRight size={18} strokeWidth={2} />
            </button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4"> 
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
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-3 py-3 rounded-md text-base transition-colors ${
                  isActive 
                    ? "font-bold text-gray-900 bg-slate-200/50" 
                    : "font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
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