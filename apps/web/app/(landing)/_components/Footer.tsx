import React from "react";

export default function Footer() {
  
  const footerLinks = [
    { name: "Features", href: "#" },
    { name: "How it works", href: "#" },
    { name: "Testimonials", href: "#" },
    { name: "Pricing", href: "#" },
    { name: "Privacy", href: "#" },
    { name: "Terms", href: "#" },
  ];

  return (
    <footer className="w-full bg-[#F3F5F6] border-t border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-6">
              <img src="/logo.png" alt="MetaGen AI Logo" className="w-8 h-8 object-contain" />
              <span className="text-[#14181F] font-bold text-[19px] tracking-tight">
                MetaGen AI
              </span>
            </div>
            <p className="text-[15px] text-slate-500 font-sans leading-[1.6]">
              The smartest way to generate stock metadata and manage your creative portfolio.
            </p>
          </div>

          {/* Links Section */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 lg:gap-x-8 gap-y-3">
            {footerLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-slate-500 hover:text-slate-900 text-[14px] font-medium transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Copyright Section */}
          <div className="text-slate-500 text-[14px]">
            © 2026 MetaGen AI. All rights reserved.
          </div>

        </div>
      </div>
    </footer>
  );
}