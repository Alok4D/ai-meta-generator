"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const searchParams = useSearchParams();
  const oobCode = searchParams?.get("oobCode") || "";

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) {
      toast.error("Invalid or missing reset token");
      return;
    }
    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Password has been reset!");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg rounded-2xl border-muted/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">New Password</CardTitle>
        <CardDescription className="text-center">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full text-md h-10" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline font-medium">
            Back to Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ResetPassword() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted/30">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
