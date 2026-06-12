"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateCheckoutSessionMutation } from "@/lib/feature/payment/paymentApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
}

export default function PaymentModal({ isOpen, onClose, plan }: PaymentModalProps) {
  const [createCheckoutSession, { isLoading }] = useCreateCheckoutSessionMutation();

  const handleCheckout = async () => {
    try {
      const response = await createCheckoutSession({ planId: plan._id }).unwrap();
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error("Failed to create checkout session", error);
      toast.error("Failed to initiate checkout. Please try again.");
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Upgrade</DialogTitle>
          <DialogDescription>
            You are about to purchase the <strong>{plan.name}</strong> plan for <strong>${plan.price}/{plan.period}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Unlimited access to all selected plan features</li>
            <li>✓ Credits will be refreshed instantly upon payment</li>
            <li>✓ Cancel anytime from your billing dashboard</li>
          </ul>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCheckout} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Proceed to Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
