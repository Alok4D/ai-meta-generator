"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { logout } from "@/lib/feature/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-10 w-full bg-background border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6 max-w-7xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            AI
          </div>
          <span className="text-xl font-bold tracking-tight">Meta Generator</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Generate
          </Link>
          <Link href="/dashboard/history" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            History
          </Link>
          <Link href="/dashboard/batch" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Batch
          </Link>
          <Link href="/dashboard/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="/dashboard/support" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Support
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {mounted && user?.role === 'admin' && (
            <Link href="/admin" className="text-sm font-medium text-primary hover:underline hidden sm:inline-block">
              Admin Portal
            </Link>
          )}
          {mounted ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard/profile" className="flex items-center gap-2 text-sm font-medium hidden sm:flex hover:text-primary transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs uppercase overflow-hidden relative">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || "U"
                    )}
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{user?.name || "User"}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm font-medium hidden sm:flex">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase overflow-hidden relative">
                    U
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>User</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>Log out</Button>
        </div>
      </div>
    </header>
  );
}
