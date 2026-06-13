"use client";

import { Check } from "lucide-react";
import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";
import CTA from "../_components/CTA";
import { useGetSubscriptionsQuery } from "@/lib/feature/subscription/subscriptionApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useState, Suspense } from "react";
import PaymentModal from "@/components/PaymentModal";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

function PricingContent() {
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

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen flex flex-col"
    >
      <Navbar />
      
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="w-full bg-[#F3F5F7] py-16 md:py-18 flex-1"
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-16">
          
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your needs. Upgrade anytime to unlock more features and credits.
            </p>
          </motion.div>

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-3 gap-8 pt-8 max-w-5xl mx-auto">
            {isLoading ? (
              <>
                {[1, 2, 3].map((_, index) => (
                  <Card key={index} className="flex flex-col relative animate-pulse">
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
                      <ul className="space-y-4 mt-2">
                        {[1, 2, 3, 4, 5].map((_, fIndex) => (
                          <li key={fIndex} className="flex items-center gap-3">
                            <div className="h-5 w-5 rounded-full bg-muted shrink-0"></div>
                            <div className="h-4 bg-muted rounded-md w-3/4"></div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <div className="h-14 bg-muted rounded-md w-full"></div>
                    </CardFooter>
                  </Card>
                ))}
              </>
            ) : plans.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-muted-foreground">No pricing plans available.</div>
            ) : (
              plans.map((plan: any) => (
                <motion.div variants={itemVariants} key={plan._id} className="flex h-full">
                  <Card className={`flex flex-col relative w-full ${plan.isPopular ? 'border-primary shadow-lg scale-105 z-10' : ''}`}>
                    {plan.isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary shrink-0" /> 
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {user?.activePlan?._id === plan._id || user?.activePlan === plan._id ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger 
                            render={
                              <div className="w-full cursor-not-allowed" tabIndex={0}>
                                <Button 
                                  variant={plan.isPopular ? 'default' : 'outline'} 
                                  className="w-full rounded-md py-5 text-md opacity-50 pointer-events-none" 
                                  tabIndex={-1}
                                >
                                  {plan.buttonText}
                                </Button>
                              </div>
                            } 
                          />
                          <TooltipContent>
                            <p>You already have this plan active</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Button 
                        variant={plan.isPopular ? 'default' : 'outline'} 
                        className="w-full rounded-md py-5 text-md"
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
        </div>
      </motion.section>

      <CTA 
        title="Claim Your Free Welcome Bonus!"
        subtitle={<>Start your journey with 100 free credits. No credit card <br className="hidden sm:block" />required.</>}
        claimBonusMode={true}
      />
      <Footer />

      <PaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        plan={selectedPlan} 
      />
    </motion.main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PricingContent />
    </Suspense>
  )
}