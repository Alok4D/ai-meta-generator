import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Linkedin, Copyright } from 'lucide-react';

const Footer = () => {
  const navLinks = [
    { name: 'Home', href: '#', active: true },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
  ];

  const socialLinks = [
    { icon: <Facebook size={18} />, href: '#' },
    { icon: <Instagram size={18} />, href: '#' },
    { icon: <Twitter size={18} />, href: '#' },
    { icon: <Linkedin size={18} />, href: '#' },
  ];

  return (
    <footer className="w-full py-12 bg-white flex flex-col items-center border-t border-gray-100">
      <div className="container px-4 flex flex-col items-center">
        
        {/* Logo */}
        <div className="mb-6">
          <span className="text-[#00A64C] text-3xl font-bold">
            eComSnap
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                link.active ? 'text-[#00A64C]' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Social Icons */}
        <div className="flex items-center gap-4 mb-10">
          {socialLinks.map((social, index) => (
            <Link
              key={index}
              href={social.href}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#E9EDF2] text-gray-500 hover:bg-gray-200 transition-all hover:scale-110"
            >
              {social.icon}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
          <Copyright size={14} />
          <span>2026 eComSnap. All rights reserved.</span>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;