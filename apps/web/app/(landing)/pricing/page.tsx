"use client";

import React from "react";
import { Check } from "lucide-react";
import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";
import CTA from "../_components/CTA";
import { useGetSubscriptionsQuery } from "@/lib/feature/subscription/subscriptionApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const { data: plans = [], isLoading } = useGetSubscriptionsQuery(undefined);

  return (
    <>
      <Navbar />
      
      <section className="w-full bg-[#F3F5F7] py-16 md:py-18 min-h-[80vh]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-16">
          
          {/* Section Header */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your needs. Upgrade anytime to unlock more features and credits.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-3 gap-8 pt-8 max-w-5xl mx-auto">
            {isLoading ? (
              <div className="col-span-3 text-center py-12 text-muted-foreground">Loading pricing plans...</div>
            ) : plans.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-muted-foreground">No pricing plans available.</div>
            ) : (
              plans.map((plan: any) => (
                <Card key={plan._id} className={`flex flex-col relative ${plan.isPopular ? 'border-primary shadow-lg scale-105 z-10' : ''}`}>
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
                    <Button 
                      variant={plan.isPopular ? 'default' : 'outline'} 
                      className="w-full rounded-md py-5 text-md"
                    >
                      {plan.buttonText}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      <CTA 
        title="Start generating metadata today"
        subtitle={<>Try MetaGen AI for free with 150 daily credits. No credit card <br className="hidden sm:block" />required.</>}
        buttonText="Get Started Free"
      />
      <Footer />
    </>
  );
}