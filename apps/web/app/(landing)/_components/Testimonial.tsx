"use client";

import { Star, ArrowRight } from 'lucide-react';
import { Space_Grotesk } from 'next/font/google';
import Link from 'next/link';
import { motion } from 'framer-motion';

const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

interface TestimonialsProps {
  variant?: 'landing' | 'full';
}

export default function Testimonials({ variant = 'full' }: TestimonialsProps) {
  const reviews = [
    {
      text: "\"MetaGen AI cut my metadata workflow from 4 hours to 15 minutes. Absolutely game-changing.\"",
      name: "Sarah Chen",
      role: "Stock Photographer",
      initial: "S",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    },
    {
      text: "\"The AI understands my illustrations perfectly. My sales have increased 40% since switching.\"",
      name: "Marcus Reid",
      role: "Digital Artist",
      initial: "M",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
    {
      text: "\"Finally a tool that handles video metadata too. The batch processing is incredibly fast and reliable.\"",
      name: "Anika Patel",
      role: "Video Creator",
      initial: "A",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    },
    {
      text: "\"I was skeptical about AI keywords, but the quality is consistently high. It saves me so much time.\"",
      name: "James Whitfield",
      role: "Freelance Photographer",
      initial: "J",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      text: "\"As someone with 10,000+ vectors, the multi-platform export is a lifesaver. My workflow is 10x faster.\"",
      name: "Lina Yamamoto",
      role: "Vector Illustrator",
      initial: "L",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    },
    {
      text: "\"The prefix/suffix features are brilliant for brand consistency, and negative keywords ensure relevant tags.\"",
      name: "David Okafor",
      role: "Stock Contributor",
      initial: "D",
      image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face",
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={`w-full bg-[#F3F5F7] py-20 md:py-20 ${space.className}`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-16 md:mb-20">
          {variant === 'landing' && (
            <h2 className="text-[14px] font-semibold tracking-[0.15em] text-[#6A7181] leading-[20px] uppercase mb-4">
              TESTIMONIALS
            </h2>
          )}
         
          <h3 className="text-[36px] md:text-[48px] font-bold leading-[1.1] tracking-tight text-[#14181F] mb-6">
            {variant === 'landing' ? (
              "Loved by creators"
            ) : (
              <>Loved by creators <br className="hidden md:block" />around the world</>
            )}
          </h3>
          {variant !== 'landing' && (
            <p className="text-[16px] md:text-[17px] text-slate-500 font-sans max-w-xl mx-auto">
              Hear from stock contributors who transformed their metadata workflow with MetaGen AI.
            </p>
          )}
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-stretch mt-8">
          {(variant === 'landing' ? reviews.slice(0, 3) : reviews).map((review, index) => (
            <motion.div 
              variants={itemVariants}
              key={index} 
              className="bg-white rounded-xl p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col h-full transition-transform hover:-translate-y-1 duration-300 relative"
            >
              <div className="flex flex-col h-full">
                {/* Stars */}
                <div className="flex items-center gap-1.5 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                
                {/* Review Text */}
                <p className="text-[14px] text-[#14181F] leading-[23px] font-normal mb-8 flex-1">
                  {review.text}
                </p>
                
                {/* User Info */}
                <div className="flex items-center gap-3.5 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-[#EEF0F2] flex items-center justify-center text-[#14181F] font-bold text-[14px] overflow-hidden shrink-0">
                    {review.image ? (
                      <img src={review.image} alt={review.name} className="w-full h-full object-cover" />
                    ) : (
                      review.initial
                    )}
                  </div>
                  <div className="flex flex-col font-sans">
                    <span className="text-[15px] font-bold text-[#14181F] leading-tight">{review.name}</span>
                    <span className="text-[12px] text-slate-500 mt-0.5">{review.role}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      {/* View All Features Link */}
        {variant === 'landing' && (
          <div className="mt-16 flex justify-center">
            <Link 
              href="/testimonials" 
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#14181F] hover:text-[#6A7181] transition-colors"
            >
              Read more testimonials
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        )}
      </div>
    </motion.section>
  );
}