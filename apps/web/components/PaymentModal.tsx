"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateCheckoutSessionMutation, useSubmitManualPaymentMutation } from "@/lib/feature/payment/paymentApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
}

export default function PaymentModal({ isOpen, onClose, plan }: PaymentModalProps) {
  const [createCheckoutSession, { isLoading }] = useCreateCheckoutSessionMutation();
  const [submitManualPayment, { isLoading: isManualLoading }] = useSubmitManualPaymentMutation();

  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");

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

  const handleManualPayment = async () => {
    if (!senderNumber || !trxId) {
      toast.error("Please enter sender number and transaction ID.");
      return;
    }

    try {
      const amountBdt = Math.round(plan.price * 120);
      const response = await submitManualPayment({
        planId: plan._id,
        paymentMethod,
        senderNumber,
        trxId,
        amount: amountBdt,
      }).unwrap();

      if (response.success) {
        toast.success("Payment submitted successfully. Please wait for admin verification.");
        onClose();
        setSenderNumber("");
        setTrxId("");
      }
    } catch (error: any) {
      console.error("Failed to submit manual payment:", error);
      toast.error(error?.data?.error || "Failed to submit manual payment. Please try again.");
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
        
        <Tabs defaultValue="card" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="card">Credit Card (Stripe)</TabsTrigger>
            <TabsTrigger value="mobile">bKash / Nagad</TabsTrigger>
          </TabsList>
          
          <TabsContent value="card">
            <div className="py-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Unlimited access to all selected plan features</li>
                <li>✓ Credits will be refreshed instantly upon payment</li>
                <li>✓ Cancel anytime from your billing dashboard</li>
              </ul>
            </div>
            <DialogFooter className="sm:justify-end mt-4">
              <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleCheckout} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Proceed to Payment
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="mobile">
            <div className="py-4 space-y-4">
              <div className="bg-primary/10 p-4 rounded-md">
                <p className="text-sm font-medium mb-1">Payment Instructions:</p>
                <p className="text-sm text-muted-foreground">
                  Send <strong>{Math.round(plan.price * 120)} BDT</strong> to <strong>01719277951</strong> (Personal).
                  Then submit your sender number and Transaction ID below.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sender Number</Label>
                  <Input 
                    placeholder="e.g. 01712345678" 
                    value={senderNumber} 
                    onChange={(e) => setSenderNumber(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Transaction ID (TrxID)</Label>
                  <Input 
                    placeholder="e.g. 9B123XYZ456" 
                    value={trxId} 
                    onChange={(e) => setTrxId(e.target.value)} 
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="sm:justify-end mt-4">
              <Button variant="ghost" onClick={onClose} disabled={isManualLoading}>
                Cancel
              </Button>
              <Button onClick={handleManualPayment} disabled={isManualLoading}>
                {isManualLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Payment
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
