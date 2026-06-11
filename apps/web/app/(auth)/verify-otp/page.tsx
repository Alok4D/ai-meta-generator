"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyOTP, resendOTP } from "@/actions/auth";

function VerifyOtpForm() {
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Missing required parameters.");
      return;
    }
    setIsLoading(true);
    try {
      const data = await verifyOTP({ email, otp: otpCode });
      if (data.success) {
        toast.success(data.message || "OTP verified successfully");
        router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otpCode)}`);
      } else {
        toast.error(data.message || "Failed to verify OTP");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Missing required parameters.");
      return;
    }
    setIsResending(true);
    try {
      const data = await resendOTP(email);
      if (data.success) {
        toast.success(data.message || "OTP resent successfully");
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg rounded-2xl border-muted/50">
      <div className="flex justify-center pt-8 pb-2">
        <Link href="/">
          <img src="/auth-logo.png" alt="MetaGen AI" className="h-24 w-auto object-contain" />
        </Link>
      </div>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">Verify OTP</CardTitle>
        <CardDescription className="text-center">
          Enter the OTP sent to {email || "your email"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otpCode">OTP Code</Label>
            <Input 
              id="otpCode" 
              type="text" 
              required 
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Enter your OTP"
            />
          </div>
          <Button type="submit" className="w-full text-md h-10" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-4 border-t">
        <div className="text-sm text-center text-muted-foreground flex flex-col space-y-2">
          <span>
            Didn't receive the code?{" "}
            <button 
              type="button" 
              onClick={handleResend} 
              disabled={isResending} 
              className="text-primary hover:underline font-medium"
            >
              {isResending ? "Resending..." : "Resend OTP"}
            </button>
          </span>
          <span>
            <Link href="/forgot-password" className="text-primary hover:underline font-medium">
              Go back
            </Link>
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function VerifyOtp() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted/30">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyOtpForm />
      </Suspense>
    </div>
  );
}
