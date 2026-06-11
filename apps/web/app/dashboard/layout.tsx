"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { logout } from "@/lib/feature/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, History, Layers, CreditCard, LifeBuoy, User as UserIcon, LogOut, Menu, PanelLeft, LayoutDashboard, Wand2, Calendar, Palette, Image as ImageIcon } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  
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

  useEffect(() => {
    if (user?.role === 'admin') {
      router.push("/admin");
    }
  }, [user, router]);

  if (!user || user.role === 'admin') {
    return null;
  }

  const routes = [
    { href: "/dashboard", label: "Overview", icon: Home },
    { href: "/dashboard/generator", label: "Generator", icon: Wand2 },
    { href: "/dashboard/batch", label: "Batch", icon: Layers },
    { href: "/dashboard/history", label: "Generation History", icon: History },
    { href: "/dashboard/pricing", label: "Pricing", icon: CreditCard },
    { href: "/dashboard/events", label: "Events", icon: Calendar },
    { href: "/dashboard/color-palette", label: "Color Palette", icon: Palette },
    { href: "/dashboard/image-converter", label: "Image Converter", icon: ImageIcon },
    { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
    { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
  ];

  return (
    <div className="h-screen flex bg-muted/20 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? "w-20" : "w-64"} bg-background border-r flex flex-col hidden md:flex shrink-0 transition-all duration-300 ease-in-out`}>
        <div className="h-16 flex items-center px-6 border-b shrink-0 overflow-hidden">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <div className=" flex justify-center text-primary-foreground font-bold overflow-hidden shrink-0">
              <img src="/logo.png" alt="MetaGen AI Logo" className="w-10 h-10 object-contain" />
            </div>
            {!isCollapsed && <span className="text-xl font-bold tracking-tight whitespace-nowrap">MetaGen AI</span>}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 overflow-x-hidden">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = route.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(route.href);

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

        <div className="p-4 border-t space-y-4 shrink-0 overflow-hidden">
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
                <span className="text-xs text-muted-foreground mt-1 capitalize">{user.role || 'user'}</span>
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
        <header className="h-16 bg-background border-b flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden shrink-0" />}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="h-16 flex items-center px-6 border-b shrink-0">
                  <Link href="/" className="flex items-center gap-2">
                    <div className=" flex justify-center text-primary-foreground font-bold overflow-hidden">
                      <img src="/logo.png" alt="MetaGen AI Logo" className="w-10 h-10 object-contain" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">MetaGen AI</span>
                  </Link>
                </div>
                <div className="flex flex-col h-[calc(100vh-4rem)]">
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
            <div className="font-bold text-lg hidden md:block">User Dashboard</div>
            <div className="font-bold md:hidden">{user.name}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4">
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
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
