import React from 'react';
import { AlertCircle, Sparkles, XCircle, CheckCircle2 } from 'lucide-react';

const Comparison = () => {
  const manualItems = [
    "Writing product descriptions from scratch",
    "Researching SEO keywords manually",
    "Guessing competitive market pricing",
    "Editing background images manually",
  ];

  const aiItems = [
    "Instant AI-generated descriptions",
    "Auto-optimized SEO tags & keywords",
    "Smart pricing recommendations",
    "Auto-removed & enhanced backgrounds",
  ];

  return (
    <section className="w-full py-20 bg-white px-4">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h2 className="text-[#00A64C] text-4xl md:text-5xl font-bold text-center mb-16">
          Why Chose eComSnap
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Manual Workflow Card */}
          <div className="bg-[#FDECEC] rounded-[32px] p-8 md:p-12 flex flex-col justify-between border border-[#FAD2D2]">
            <div>
              <div className="flex items-center gap-3 mb-10">
                <AlertCircle className="text-[#D93025]" size={32} />
                <h3 className="text-2xl font-bold text-[#1A1A1A]">Manual Workflow</h3>
              </div>
              
              <ul className="space-y-6">
                {manualItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <XCircle className="text-[#D93025] shrink-0" size={20} />
                    <span className="text-[#D93025] text-lg font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-16 pt-8 border-t border-[#FAD2D2]/50">
              <p className="text-[#D93025] text-xl font-semibold">
                ~ 45 minutes <span className="text-[#D93025]/70 font-normal">per product</span>
              </p>
            </div>
          </div>

          {/* AI Workflow Card */}
          <div className="bg-[#E9F9EF] rounded-[32px] p-8 md:p-12 flex flex-col justify-between border border-[#D1F2DE]">
            <div>
              <div className="flex items-center gap-3 mb-10">
                <Sparkles className="text-[#00A64C]" size={32} />
                <h3 className="text-2xl font-bold text-[#1A1A1A]">eComSnap AI Workflow</h3>
              </div>
              
              <ul className="space-y-6">
                {aiItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <CheckCircle2 className="text-[#00A64C] shrink-0" size={20} />
                    <span className="text-[#00A64C] text-lg font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-16 pt-8 border-t border-[#D1F2DE]/50">
              <p className="text-[#00A64C] text-xl font-semibold">
                ~ 30 seconds <span className="text-[#00A64C]/70 font-normal">per product</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Comparison;