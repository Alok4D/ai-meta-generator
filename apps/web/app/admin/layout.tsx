"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { logout } from "@/store/authSlice";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: ReactNode }) {
  
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <header className="sticky top-0 z-10 w-full bg-background border-b shadow-sm border-primary/20">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6 max-w-7xl mx-auto">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              AI
            </div>
            <span className="text-xl font-bold tracking-tight">Admin Portal</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">
              Overview
            </Link>
            <Link href="/admin/users" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Users
            </Link>
            <Link href="/admin/images" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Images
            </Link>
            <Link href="/admin/analytics" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Analytics
            </Link>
            <Link href="/admin/support" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Support
            </Link>
            <Link href="/admin/settings" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Settings
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:inline-block">
              App
            </Link>
            <span className="text-sm font-medium hidden sm:inline-block">
              {user.name} (Admin)
            </span>
            <Button variant="outline" size="sm" onClick={() => {
              dispatch(logout());
              router.push("/login");
            }}>Log out</Button>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
