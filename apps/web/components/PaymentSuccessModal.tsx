"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  data: {
    amount: number;
    planName: string;
    transactionId: string;
  } | null;
}

export default function PaymentSuccessModal({ isOpen, data }: PaymentSuccessModalProps) {
  const router = useRouter();

  const handleClose = () => {
    // Navigate away to clear URL parameters and see updated history
    router.replace('/dashboard/transactions');
  };

  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <DialogTitle className="text-2xl text-center">Payment Successful!</DialogTitle>
          <DialogDescription className="text-center text-md">
            Thank you for upgrading. Your plan is now active.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 bg-muted/50 rounded-lg my-4 text-left px-6">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium">{data.planName} Plan</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-medium">${data.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-medium text-xs font-mono">{data.transactionId}</span>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-center w-full">
          <Button onClick={handleClose} className="w-full">
            Go to My Transactions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
