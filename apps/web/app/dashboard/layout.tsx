import { ReactNode } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
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
              Dashboard
            </Link>
            <Link href="/dashboard/history" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              History
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">Log out</Button>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
