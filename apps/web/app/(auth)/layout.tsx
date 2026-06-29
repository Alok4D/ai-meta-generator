import Link from "next/link";
import Image from "next/image";
import { AuthBackground } from "./_components/AuthBackground";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden p-4">
      {/* Dynamic Background */}
      <AuthBackground />

      {/* Central Content Container */}
      <div className="relative z-10 flex w-full max-w-[1400px] items-center justify-between">
        
        {/* Left side Logo (Hidden on mobile, visible on desktop) */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
            {/* Custom logo layout to match Adobe Stock style: Icon + Text */}
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="MetaGen AI Icon" 
                className="w-16 h-16 object-contain" 
              />
              <span className="text-white font-bold text-[40px] tracking-tight drop-shadow-md">
                MetaGen AI
              </span>
            </div>
          </Link>
        </div>

        {/* Right side Form Container */}
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="w-full max-w-[460px] bg-white shadow-sm border border-gray-100 rounded-md p-10 md:p-12 flex flex-col">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
