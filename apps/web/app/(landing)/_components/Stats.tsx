import React from "react";

export default function Stats() {
  const statItems = [
    { value: "500+", label: "Files per batch" },
    { value: "6", label: "Platforms supported" },
    { value: "50+", label: "Keywords per image" },
    { value: "99%", label: "Accuracy rate" },
  ];

  return (
    <section className="w-full bg-[#F9FAFB] py-10 md:py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {statItems.map((stat, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center justify-center text-center"
            >
              <h3 className="text-[36px] font-bold text-[#14181F] leading-[40px] tracking-tight mb-2 md:mb-3">
                {stat.value}
              </h3>
              <p className="text-[14px] font-normal text-[#6A7181] leading-[20px]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}