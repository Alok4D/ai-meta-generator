"use client";

import { Check, ArrowRight } from "lucide-react";
import { useGetSubscriptionsQuery } from "@/lib/feature/subscription/subscriptionApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useState } from "react";
import PaymentModal from "@/components/PaymentModal";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Space_Grotesk } from 'next/font/google';

const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

const LandingPricing = () => {
    
  const { data: plans = [], isLoading } = useGetSubscriptionsQuery(undefined);
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handlePlanClick = (plan: any) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

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

  // Only take first 3 plans for landing page
  const displayPlans = plans.slice(0, 3);

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={`w-full bg-[#F9FAFB] py-12 md:py-16 ${space.className}`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-10 md:mb-12">
          <h2 className="text-[14px] font-semibold tracking-[0.15em] text-[#6A7181] leading-[20px] uppercase mb-4">
            PRICING
          </h2>
          <h3 className="text-[36px] md:text-[48px] font-bold md:leading-[50px] tracking-tight text-[#14181F] mb-6">
            Affordable plans for 
            <span className="text-slate-500"> every creator</span>
          </h3>
          <p className="text-[16px] md:text-[17px] text-slate-500 font-sans max-w-xl mx-auto">
            Choose the perfect plan to automate your metadata generation and skyrocket your stock photo sales.
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="flex flex-wrap justify-center gap-6 pt-4 max-w-6xl mx-auto">
          {isLoading ? (
            <>
              {[1, 2, 3].map((_, index) => (
                <Card key={index} className="flex flex-col relative animate-pulse w-full md:w-[calc(33.333%-1.5rem)] min-w-[280px] max-w-[340px]">
                  <CardHeader>
                    <div className="h-8 bg-muted rounded-md w-1/2 mb-2"></div>
                    <div className="h-4 bg-muted rounded-md w-full mb-1"></div>
                    <div className="h-4 bg-muted rounded-md w-4/5"></div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <div className="h-10 bg-muted rounded-md w-20"></div>
                      <div className="h-4 bg-muted rounded-md w-12"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3 mt-2">
                      {[1, 2, 3, 4, 5].map((_, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-3">
                          <div className="h-5 w-5 rounded-full bg-muted shrink-0"></div>
                          <div className="h-4 bg-muted rounded-md w-3/4"></div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <div className="h-12 bg-muted rounded-md w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </>
          ) : displayPlans.length === 0 ? (
            <div className="w-full text-center py-12 text-muted-foreground">No pricing plans available.</div>
          ) : (
            displayPlans.map((plan: any) => (
              <motion.div variants={itemVariants} key={plan._id} className="flex w-full md:w-[calc(33.333%-1.5rem)] min-w-[280px] max-w-[340px]">
                <Card className={`flex flex-col relative w-full ${plan.isPopular ? 'border-primary shadow-lg scale-105 z-10' : ''}`}>
                  {plan.isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-xs">{plan.description}</CardDescription>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground text-sm">/{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-2">
                    {user?.activePlan?._id === plan._id || user?.activePlan === plan._id || (plan.name?.toLowerCase() === 'free' && !user?.activePlan) ? (
                      <Button
                        variant={plan.isPopular ? 'default' : 'outline'}
                        className="w-full rounded-sm py-5 text-sm opacity-50 cursor-not-allowed"
                        disabled
                      >
                        {plan.buttonText}
                      </Button>
                    ) : (
                      <Button
                        variant={plan.isPopular ? 'default' : 'outline'}
                        className="w-full rounded-sm py-5 text-sm"
                        onClick={() => handlePlanClick(plan)}
                      >
                        {plan.buttonText}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </div>
        
        {/* View All Plans Button */}
        <div className="mt-16 flex justify-center">
          <Link 
            href="/pricing" 
            className="inline-flex items-center gap-2 text-[14px] font-semibold leading-[20px] text-[#14181F] hover:text-[#6A7181] transition-colors"
          >
            View all plans
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
      />
    </motion.section>
  );
};

export default LandingPricing;