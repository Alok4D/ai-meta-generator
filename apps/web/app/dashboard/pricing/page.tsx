"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useGetSubscriptionsQuery } from "@/lib/feature/subscription/subscriptionApi";

export default function PricingPage() {
  const { data: plans = [], isLoading } = useGetSubscriptionsQuery(undefined);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto py-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your needs. Upgrade anytime to unlock more features and credits.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 pt-8">
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
                  className="w-full"
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
