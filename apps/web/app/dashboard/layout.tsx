"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { logout } from "@/lib/feature/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Home, History, Layers, CreditCard, LifeBuoy, User as UserIcon, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) {
    return null;
  }

  const routes = [
    { href: "/dashboard", label: "Overview", icon: Home },
    { href: "/dashboard/history", label: "History", icon: History },
    { href: "/dashboard/batch", label: "Batch", icon: Layers },
    { href: "/dashboard/pricing", label: "Pricing", icon: CreditCard },
    { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
    { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
  ];

  return (
    <div className="h-screen flex bg-muted/20 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              AI
            </div>
            <span className="text-xl font-bold tracking-tight">User Portal</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = route.href === "/dashboard" 
              ? pathname === "/dashboard" 
              : pathname.startsWith(route.href);

            return (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {route.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t space-y-4 shrink-0">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase overflow-hidden relative shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium leading-none truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground mt-1 capitalize">{user.role || 'user'}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-muted-foreground" 
            onClick={() => {
              dispatch(logout());
              router.push("/login");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
          {user.role === 'admin' && (
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground" 
              onClick={() => router.push("/admin")}
            >
              Go to Admin Portal
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-background border-b flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="font-bold text-lg hidden md:block">User Dashboard</div>
          <div className="font-bold md:hidden">User Portal</div>
          <div className="flex items-center gap-4">
            {user.role === 'admin' && (
              <Button variant="outline" size="sm" onClick={() => router.push("/admin")} className="hidden md:flex">
                Admin Portal
              </Button>
            )}
            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-sm font-medium leading-none">{user.name}</span>
                <span className="text-xs text-muted-foreground mt-1 capitalize">{user.role || 'user'}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase overflow-hidden relative shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
