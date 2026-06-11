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
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="bg-[#18181B] w-8 h-8 rounded-lg flex items-center justify-center">
              {/* Same custom bird SVG as the Navbar */}
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="white" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21.5 2C21.5 2 18.5 3 16 5.5C13.5 8 11.5 10 11.5 10L9 9.5L10 12.5L5 16L7.5 14L4 21L10.5 15.5L13 18L13 13.5C13 13.5 16.5 12.5 19 9.5C21.5 6.5 21.5 2 21.5 2Z" />
              </svg>
            </div>
            <span className="text-gray-900 font-bold text-[17px] tracking-tight">
              CSVNest
            </span>
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
            © 2026 CSVNest. All rights reserved.
          </div>

        </div>
      </div>
    </footer>
  );
}