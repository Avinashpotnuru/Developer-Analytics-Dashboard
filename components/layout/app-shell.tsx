"use client";

import * as React from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { AuthErrorBanner } from "@/components/auth/auth-error-banner";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />
      <div
        className={cn(
          "transition-[padding] duration-300 md:pl-64",
          sidebarCollapsed && "md:pl-20",
        )}
      >
        <Topbar />
        <main className="w-full px-4 py-6 md:px-6 md:py-8">
          <AuthErrorBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
