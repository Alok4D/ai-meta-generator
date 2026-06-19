"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { useGetSubscriptionsQuery } from "@/lib/feature/subscription/subscriptionApi";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useState, useEffect, useRef } from "react";
import PaymentModal from "@/components/PaymentModal";
import PaymentSuccessModal from "@/components/PaymentSuccessModal";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { useVerifySessionMutation, useCancelSubscriptionMutation } from "@/lib/feature/payment/paymentApi";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/feature/auth/authSlice";

export default function PricingPage() {

  const { data: plans = [], isLoading } = useGetSubscriptionsQuery(undefined);
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifySession] = useVerifySessionMutation();
  const dispatch = useDispatch();
  const [cancelSubscription, { isLoading: isCanceling }] = useCancelSubscriptionMutation();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const hasVerified = useRef(false);

  const handleCancelSubscription = async () => {
    try {
      const res = await cancelSubscription({}).unwrap();
      if (res.success && res.user) {
        dispatch(setUser(res.user));
        setIsCancelModalOpen(false);
        toast.success("Subscription canceled successfully.");
      }
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      toast.error("Failed to cancel subscription. Please try again.");
    }
  };

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success && sessionId && !hasVerified.current) {
      hasVerified.current = true;
      router.replace('/dashboard/pricing', { scroll: false });
      
      verifySession({ sessionId })
        .unwrap()
        .then((res) => {
          setSuccessData(res);
          if (res.user) {
            dispatch(setUser(res.user));
          }
          toast.success('Payment successful! Your subscription has been updated.');
        })
        .catch((err) => {
          console.error(err);
          toast.error('Could not verify payment session.');
        });
    } else if (canceled && !hasVerified.current) {
      hasVerified.current = true;
      router.replace('/dashboard/pricing', { scroll: false });
      toast.error('Payment was canceled.');
    }
  }, [searchParams, router, verifySession, dispatch]);

  const handlePlanClick = (plan: any) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto py-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your needs. Upgrade anytime to unlock more features and credits.
        </p>
      </div>

      {user?.activePlan && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary">Your Active Plan: {user.activePlan.name || 'Free'}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Valid until: {user.planExpireDate ? new Date(user.planExpireDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-center gap-3">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
              {user.credits} Credits Remaining
            </div>
            {user.activePlan?.name !== 'Free' && user.activePlan?.name !== 'Basic' && (
              <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogTrigger render={<Button variant="destructive" />}>
                  Cancel Subscription
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Subscription</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel your subscription? You will be downgraded to the Free plan immediately.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCancelModalOpen(false)} disabled={isCanceling}>
                      Go Back
                    </Button>
                    <Button variant="destructive" onClick={handleCancelSubscription} disabled={isCanceling}>
                      {isCanceling ? 'Canceling...' : 'Confirm Cancel'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-8 pt-4 max-w-6xl mx-auto">
        {isLoading ? (
          <>
            {[1, 2, 3].map((_, index) => (
              <Card key={index} className="flex flex-col relative animate-pulse w-full md:w-[calc(33.333%-1.5rem)] min-w-[300px] max-w-[350px]">
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
          <div className="w-full text-center py-12 text-muted-foreground">No pricing plans available.</div>
        ) : (
          plans.map((plan: any) => (
            <Card key={plan._id} className={`flex flex-col relative w-full md:w-[calc(33.333%-1.5rem)] min-w-[300px] max-w-[380px] ${plan.isPopular ? 'border-primary shadow-lg scale-105 z-10' : ''}`}>
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
                {user?.activePlan?._id === plan._id || user?.activePlan === plan._id || (plan.name?.toLowerCase() === 'free' && !user?.activePlan) ? (
                  <Button 
                    variant={plan.isPopular ? 'default' : 'outline'} 
                    className="w-full opacity-50 cursor-not-allowed rounded-md py-5"
                    disabled
                  >
                    {plan.buttonText}
                  </Button>
                ) : (
                  <Button 
                    variant={plan.isPopular ? 'default' : 'outline'} 
                    className="w-full rounded-md py-5"
                    onClick={() => handlePlanClick(plan)}
                  >
                    {plan.buttonText}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <PaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        plan={selectedPlan} 
      />

      <PaymentSuccessModal 
        isOpen={!!successData} 
        data={successData} 
      />
    </div>
  );
}
