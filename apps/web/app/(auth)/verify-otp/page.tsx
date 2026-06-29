"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="w-full text-gray-900">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-[32px] font-bold tracking-tight text-gray-900 mb-2">Verify OTP</h1>
        <p className="mt-1 text-[13px] text-gray-600">
          Enter the code sent to <span className="font-semibold text-gray-900">{email || "your email"}</span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="otpCode" className="text-[12px] font-semibold text-[#505050]">Verification Code</Label>
          <Input 
            id="otpCode" 
            type="text" 
            required 
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="h-10 bg-white border-gray-300 focus-visible:ring-[#1473E6] rounded-sm text-sm tracking-widest text-center font-medium"
            maxLength={6}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="px-8 h-9 font-bold text-[13px] rounded-full bg-[#1473E6] hover:bg-[#0d66d0] text-white transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[13px] text-gray-600">
            Didn't receive the code?{" "}
            <button 
              type="button" 
              onClick={handleResend} 
              disabled={isResending} 
              className="text-[#1473E6] hover:underline font-medium disabled:opacity-50"
            >
              {isResending ? "Resending..." : "Click to resend"}
            </button>
          </p>
        </div>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
      </div>

      <div className="text-center">
        <Link href="/forgot-password" className="text-[13px] text-gray-600 hover:text-gray-900 font-medium">
          ← Go back
        </Link>
      </div>
    </div>
  );
}

export default function VerifyOtp() {
  return (
    <div className="w-full">
      <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
        <VerifyOtpForm />
      </Suspense>
    </div>
  );
}
