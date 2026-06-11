"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { logout } from "@/lib/feature/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LayoutDashboard, Users, Image as ImageIcon, BarChart3, Settings, LifeBuoy, LogOut, User as UserIcon, SubscriptIcon, Menu, PanelLeft } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth <= 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
          <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const routes = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/subscriptions-management", label: "Subscriptions Management", icon: SubscriptIcon },
    { href: "/admin/images", label: "Images", icon: ImageIcon },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/support", label: "Support", icon: LifeBuoy },
    { href: "/admin/profile", label: "Profile", icon: UserIcon },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? "w-20" : "w-64"} bg-background border-r flex flex-col hidden md:flex transition-all duration-300 ease-in-out`}>
        <div className="h-16 flex items-center px-6 border-b overflow-hidden">
          <Link href="/admin" className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
              AI
            </div>
            {!isCollapsed && <span className="text-xl font-bold tracking-tight whitespace-nowrap">Admin Portal</span>}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 overflow-x-hidden">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                title={isCollapsed ? route.label : undefined}
                className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} py-2 rounded-md text-sm font-medium transition-colors ${isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">{route.label}</span>}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t space-y-4 overflow-hidden">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"}`}>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase overflow-hidden relative shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium leading-none truncate">{user.name}</span>
                <span className="text-xs text-muted-foreground mt-1">Admin</span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size={isCollapsed ? "icon" : "default"}
            title={isCollapsed ? "Log out" : undefined}
            className="w-full justify-center text-muted-foreground"
            onClick={() => {
              dispatch(logout());
              router.push("/login");
            }}
          >
            <LogOut className={`h-4 w-4 shrink-0 ${isCollapsed ? "" : "mr-2"}`} />
            {!isCollapsed && "Log out"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-background border-b flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="h-16 flex items-center px-6 border-b shrink-0">
                  <Link href="/admin" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      AI
                    </div>
                    <span className="text-xl font-bold tracking-tight">Admin Portal</span>
                  </Link>
                </div>
                <div className="flex flex-col h-[calc(100vh-4rem)]">
                  <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {routes.map((route) => {
                      const Icon = route.icon;
                      const isActive = pathname === route.href;
                      return (
                        <Link
                          key={route.href}
                          href={route.href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
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
                  <div className="p-4 border-t mt-auto space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-muted-foreground"
                      onClick={() => {
                        setOpen(false);
                        dispatch(logout());
                        router.push("/login");
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex shrink-0 -ml-2 text-muted-foreground hover:text-foreground">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <div className="font-bold text-lg hidden md:block">Admin Dashboard</div>
            <div className="font-bold md:hidden">{user.name}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-sm font-medium leading-none">{user.name}</span>
                <span className="text-xs text-muted-foreground mt-1 capitalize">{user.role}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase overflow-hidden relative">
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
