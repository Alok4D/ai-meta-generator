import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative w-full pt-32 pb-20 px-4 flex flex-col items-center" style={{ background: 'linear-gradient(to bottom, #56FF9D, #FFFFFF)' }}>
      
      {/* Badge */}
      <div className="flex items-center gap-2 bg-white/60 text-[#006B32] px-4 py-2 mt-[50px] rounded-full mb-8 border border-[#00A64C]/30 backdrop-blur-sm">
        <ShoppingBag size={18} />
        <span className="text-sm font-semibold tracking-wide uppercase">
          AI-Powered E-commerce Creation
        </span>
      </div>

      {/* Main Heading */}
      <div className="max-w-6xl text-center mb-6">
        <h1 className="text-4xl md:text-[72px] font-semibold text-[#181818] leading-[1.15] tracking-tight">
          Upload a product image and let AI <br className="hidden md:block" />
          <span className="text-[#00A64C]">create everything you need.</span>
        </h1>
      </div>

      {/* Subtext */}
      <div className="max-w-2xl text-center mb-10">
        <p className="text-gray-700 text-base md:text-lg leading-relaxed">
          Upload a single product photo and let AI create everything for you — descriptions, 
          images, videos, and SEO tags — all ready to publish in seconds.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <button className="bg-[#00A64C] text-white px-8 py-4 rounded-full flex items-center gap-2 font-bold text-lg hover:bg-[#008f41] transition-all shadow-md active:scale-95">
          Join Early Access
          <ArrowRight size={20} />
        </button>
        
        <button className="bg-white/80 border-2 border-[#00A64C] text-[#00A64C] px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-all shadow-sm active:scale-95">
          See Benefits
        </button>
      </div>

      {/* Trust Text */}
      <div className="flex items-center gap-2 text-gray-600 text-sm italic">
        <Sparkles size={14} className="text-[#00A64C]" />
        <p>Join our early access program and be among the first to experience eComSnap</p>
      </div>

    </section>
  );
};

export default Hero;