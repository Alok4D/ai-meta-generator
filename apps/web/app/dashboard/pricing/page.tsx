"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto py-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your needs. Upgrade anytime to unlock more features and credits.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 pt-8">
        <Card className="flex flex-col relative">
          <CardHeader>
            <CardTitle className="text-2xl">Free</CardTitle>
            <CardDescription>Perfect for trying out the platform.</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/forever</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 10 images per day</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Standard SEO Output</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Basic History</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>Current Plan</Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col border-primary relative shadow-lg scale-105 z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">Pro</CardTitle>
            <CardDescription>For freelancers and content creators.</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$19</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 500 images per day</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Adobe & Shutterstock Modes</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Batch Upload (up to 50)</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> CSV & TXT Export</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Priority Support</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Upgrade to Pro</Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col relative">
          <CardHeader>
            <CardTitle className="text-2xl">Agency</CardTitle>
            <CardDescription>Unlimited power for your entire team.</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited images</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> All Output Modes</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited Batch Upload</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Custom API Access</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 24/7 Dedicated Support</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Contact Sales</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
