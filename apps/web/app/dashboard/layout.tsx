import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <DashboardHeader />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
