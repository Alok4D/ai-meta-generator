
const CTA = () => {
  return (
    <section className="w-full py-24 bg-[#E9F9EF] px-4">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        
        {/* Heading */}
        <h2 className="text-3xl md:text-6xl font-bold text-[#111827] leading-tight mb-8">
          Ready to <span className="text-[#00A64C]">Improve Your</span> <br />
          <span className="text-[#00A64C]">E-commerce Inventory</span> Faster?
        </h2>

        {/* Subtext */}
        <p className="text-gray-500 text-sm md:text-base max-w-2xl mb-10 leading-relaxed">
          Improve your e-commerce workflow with AI that creates product photos, descriptions, 
          specs, and metadata instantly. No more manual typing, editing, or searching — 
          just upload an image and get a full, ready-to-publish product listing in seconds.
        </p>

        {/* Primary Button */}
        <button className="bg-[#00A64C] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#008f41] transition-all shadow-md active:scale-95">
          Join Early Access
        </button>

      </div>
    </section>
  );
};

export default CTA;