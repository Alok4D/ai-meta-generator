"use client";

import React, { useState } from "react";
import { Moon, ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { logout } from "@/lib/feature/auth/authSlice";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

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
            {mounted && user ? (
              <div className="relative group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#18181B] flex items-center justify-center text-white font-medium text-[15px] uppercase overflow-hidden ring-2 ring-transparent transition-all group-hover:ring-gray-300">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0) || "U"
                  )}
                </div>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 w-48 flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-[14px] font-bold text-gray-900 truncate">{user.name || 'User'}</p>
                      <p className="text-[12px] text-gray-500 truncate mt-0.5">{user.email || ''}</p>
                    </div>
                    <Link href="/dashboard" className="px-4 py-2.5 text-[14px] font-medium text-gray-700 hover:bg-gray-50 hover:text-[#18181B] transition-colors">
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="px-4 py-2.5 text-[14px] font-medium text-left text-red-600 hover:bg-red-50 transition-colors">
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href={"/login"}>
                <button className="bg-[#18181B] hover:bg-black text-white px-5 py-2.5 rounded-full flex items-center gap-2 text-[15px] font-medium transition-colors duration-200">
                  Get Started
                  <ArrowRight size={18} strokeWidth={2} />
                </button>
              </Link>
            )}
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
          isMenuOpen ? "max-h-screen border-t border-gray-200/60" : "max-h-0"
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1 bg-[#F3F5F6] shadow-lg">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                    isActive
                      ? "bg-gray-100 text-gray-900 font-bold"
                      : "text-slate-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}
            
            <div className="px-4 pt-4 pb-2 border-t border-gray-200/60 mt-2">
              {mounted && user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-[#18181B] flex items-center justify-center text-white font-medium text-[15px] uppercase overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0) || "U"
                      )}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-gray-900">{user.name || 'User'}</p>
                      <p className="text-[12px] text-gray-500">{user.email || ''}</p>
                    </div>
                  </div>
                  <Link 
                    href="/dashboard"
                    className="block w-full text-center bg-[#F3F5F7] hover:bg-gray-200 text-[#18181B] px-5 py-3 rounded-xl text-[15px] font-bold transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-center bg-red-50 text-red-600 px-5 py-3 rounded-xl text-[15px] font-bold transition-colors"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login"
                  className="block w-full text-center bg-[#18181B] text-white px-5 py-3 rounded-xl text-[15px] font-bold transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              )}
            </div>
        </div>
      </div>
    </nav>
  );
}