import React from 'react';
import { MousePointerClick, LayoutDashboard, Search, ImageIcon, Video, BadgeDollarSign } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      title: "One-Click Product Upload",
      desc: "Upload your product image and let our AI handle everything — from description to SEO-ready content — with just a single click.",
      icon: <MousePointerClick size={20} />,
    },
    {
      title: "Shopify & WooCommerce Ready",
      desc: "Seamlessly publish your AI-generated product listings directly to Shopify or WooCommerce with no extra formatting required.",
      icon: <LayoutDashboard size={20} />,
    },
    {
      title: "AI-Generated Descriptions & SEO Meta Tags",
      desc: "Automatically generate product descriptions and meta tags optimized for SEO, so your listings rank higher without extra effort.",
      icon: <Search size={20} />,
    },
    {
      title: "Automatic Images & Videos Suggestion",
      desc: "Get high-quality image and video suggestions related to your product that you can download and use instantly.",
      icon: <Video size={20} />,
    },
    {
      title: "Image Editing",
      desc: "Automatically edit and optimize product images with AI — remove backgrounds, enhance quality, and prepare visuals ready for your store.",
      icon: <ImageIcon size={20} />,
    },
    {
      title: "Pricing Analysis & Recommendations",
      desc: "Analyze real market prices across major platforms to identify competitive price ranges, track historical and seasonal trends.",
      icon: <BadgeDollarSign size={20} />,
    },
  ];

  return (
    <section className="w-full py-24 bg-white overflow-hidden">
      <div className="max-w-[996px] mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-[#00A64C] text-5xl font-bold mb-4">Key Benefits</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
           Upload your product image and let our AI handle everything — from description to SEO-ready content — with just a single click.
          </p>
        </div>

        {/* Staggered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px] items-start">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              style={{
                border: '0.8px solid transparent',
                backgroundImage: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%), linear-gradient(135deg, #10B981 0%, rgba(0, 71, 48, 0.3) 100%)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
              }}
              className={`
                p-[24px] rounded-[24px] flex flex-col gap-[16px] shadow-sm transition-all duration-300
                ${index % 2 !== 0 ? 'md:mt-12' : ''}
              `}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-[#00A64C] flex items-center justify-center text-white shrink-0 shadow-inner">
                {benefit.icon}
              </div>

              {/* Text Area */}
              <div>
                <h3 className="text-[#111827] font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-[13px] leading-relaxed">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;