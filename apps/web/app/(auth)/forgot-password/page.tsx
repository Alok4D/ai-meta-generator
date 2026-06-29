"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/actions/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await forgotPassword({ email });
      if (data.success) {
        toast.success(data.message || "Email sent successfully");
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(data.message || "Failed to send reset email");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full text-gray-900">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-[32px] font-bold tracking-tight text-gray-900 mb-2">Forgot Password</h1>
        <p className="mt-1 text-[13px] text-gray-600">
          Enter your email address and we will send you a link to reset your password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[12px] font-semibold text-[#505050]">Email address</Label>
          <Input 
            id="email" 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="h-10 bg-white border-gray-300 focus-visible:ring-[#1473E6] rounded-sm text-sm"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            className="px-8 h-9 font-bold text-[13px] rounded-full bg-[#1473E6] hover:bg-[#0d66d0] text-white transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-[13px] text-gray-600">
          Remember your password?{" "}
          <Link href="/login" className="text-[#1473E6] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
