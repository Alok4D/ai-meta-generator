"use client";

import React, { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest) + suffix);

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, to, { duration: 2, ease: "easeOut" });
      return controls.stop;
    }
  }, [count, isInView, to]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export default function Stats() {
  const statItems = [
    { value: 500, suffix: "+", label: "Files per batch" },
    { value: 6, suffix: "", label: "Platforms supported" },
    { value: 50, suffix: "+", label: "Keywords per image" },
    { value: 99, suffix: "%", label: "Accuracy rate" },
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
                <CountUp to={stat.value} suffix={stat.suffix} />
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