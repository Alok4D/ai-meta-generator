"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, googleProvider } from "@/lib/firebase";
import { setUser } from "@/lib/feature/auth/authSlice";
import { useRegisterMutation, useGoogleLoginMutation, useVerifyOtpMutation, useResendOtpMutation } from "@/lib/feature/auth/authApi";
import { Mail, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function Register() {
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const [verifyOtp, { isLoading: isVerifyLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResendLoading }] = useResendOtpMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    try {
      const data = await register({ name, email, password }).unwrap();
      
      // If the backend indicates verification is needed
      if (data.message && data.message.includes("verify")) {
        setShowOtpScreen(true);
        toast.success(data.message);
      } else if (data.token) {
        // Fallback if token is returned immediately
        dispatch(setUser(data));
        toast.success("Account created successfully!");
        if (data.role === 'admin') {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error: any) {
      const errorMessage = error.data?.error || "Failed to register";
      if (errorMessage.includes("Disposable") || errorMessage.includes("temporary email")) {
        setEmailError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const data = await googleLogin({
        name: user.displayName,
        email: user.email,
      }).unwrap();

      dispatch(setUser(data));
      toast.success("Account created with Google!");
      if (data.role === 'admin') {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || error.data?.error || "Google registration failed");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await verifyOtp({ email, otp }).unwrap();
      dispatch(setUser(data));
      toast.success("Email verified and logged in successfully!");
      if (data.role === 'admin') {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.data?.error || "Invalid OTP or expired.");
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp({ email }).unwrap();
      toast.success("A new verification code has been sent to your email.");
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to resend OTP.");
    }
  };

  const isLoading = isRegisterLoading || isGoogleLoading;

  if (showOtpScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-muted/30">
        <Card className="w-full max-w-md shadow-lg rounded-2xl border-muted/50 p-6">
          <div className="flex flex-col items-center justify-center pt-4 pb-6 space-y-4 text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Verify Your Email</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              We've sent a 6-digit verification code to your email
            </CardDescription>
          </div>
          
          <CardContent className="space-y-6 px-0">
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-xs font-semibold uppercase text-muted-foreground">Verification Code</Label>
                <Input 
                  id="otp" 
                  type="text" 
                  placeholder="Enter OTP" 
                  className="text-center tracking-widest text-lg h-12"
                  maxLength={6}
                  required 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-12 text-md font-medium" disabled={isVerifyLoading}>
                {isVerifyLoading ? "Verifying..." : "Verify & Log In"}
              </Button>
            </form>

            <div className="flex flex-col space-y-4 items-center">
              <button 
                type="button" 
                onClick={handleResendOtp}
                disabled={isResendLoading}
                className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors disabled:opacity-50 disabled:hover:no-underline"
              >
                {isResendLoading ? "Resending..." : "Didn't receive code? Resend"}
              </button>
              <div className="text-sm font-medium pt-2">
                Verifying: <span className="text-primary">{email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-lg rounded-2xl border-muted/50">
        <div className="flex justify-center pt-8 pb-2">
          <Link href="/">
            <img src="/auth-logo.png" alt="MetaGen AI" className="h-24 w-auto object-contain" />
          </Link>
        </div>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="John Doe" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                className={emailError ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {emailError && (
                <p className="text-[13px] text-red-500 font-medium mt-1">
                  {emailError}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full text-md h-10" disabled={isLoading}>
              {isLoading ? "Creating..." : "Sign up"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
