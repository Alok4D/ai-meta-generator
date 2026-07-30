"use client";

import HowItWorks from "../_components/HowItWorks";
import CTA from "../_components/CTA";
import { motion } from "framer-motion";

export default function HowItWorksPage() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen flex flex-col"
    >
      <div className="flex-1">
        <HowItWorks />
        <CTA 
          title="Simple enough? Let's get started."
          subtitle="Try MetaGen AI for free — no credit card required."
          buttonText="Start for Free"
        />
      </div>
    </motion.main>
  );
}
