import React from "react";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";

const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function Footer() {
  return (
    <footer className={`w-full bg-[#14181F] text-white pt-20 pb-10 ${space.className}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-10">
          
          {/* Brand & Description */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-2">
                 <img src="/logo.png" alt="MetaGen AI Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-white font-bold text-[24px] tracking-tight">
                MetaGen AI
              </span>
            </Link>
            <p className="text-[15px] text-slate-400 leading-[1.7] max-w-sm mb-8">
              The smartest way to generate stock metadata and manage your creative portfolio. Stop wasting hours on manual tagging and automate your entire workflow today.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"/><path d="M9 18c-4.5 1.5-5-2.5-7-3"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          {/* Links Columns Container */}
          <div className="md:col-span-6 grid grid-cols-2 gap-8">
            
            {/* Links Column 1 */}
            <div className="flex flex-col">
              <h4 className="text-[16px] font-bold text-white mb-6">Product</h4>
              <div className="flex flex-col gap-4">
                <Link href="/#features" className="text-slate-400 hover:text-white text-[15px] transition-colors">Features</Link>
                <Link href="/how-it-works" className="text-slate-400 hover:text-white text-[15px] transition-colors">How it works</Link>
                <Link href="/pricing" className="text-slate-400 hover:text-white text-[15px] transition-colors">Pricing</Link>
                <Link href="/testimonials" className="text-slate-400 hover:text-white text-[15px] transition-colors">Testimonials</Link>
              </div>
            </div>

            {/* Links Column 2 */}
            <div className="flex flex-col">
              <h4 className="text-[16px] font-bold text-white mb-6">Company</h4>
              <div className="flex flex-col gap-4">
                <Link href="#" className="text-slate-400 hover:text-white text-[15px] transition-colors">About Us</Link>
                <Link href="#" className="text-slate-400 hover:text-white text-[15px] transition-colors">Blog</Link>
                <Link href="#" className="text-slate-400 hover:text-white text-[15px] transition-colors">Contact</Link>
                <Link href="/privacy" className="text-slate-400 hover:text-white text-[15px] transition-colors">Privacy Policy</Link>
              </div>
            </div>

          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-[14px]">
            © {new Date().getFullYear()} MetaGen AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-slate-500 hover:text-white text-[14px] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-500 hover:text-white text-[14px] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}