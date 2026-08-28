import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Brand } from "./brand";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";
import { cn } from "@/lib/utils";

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col border-r bg-card transition-[width] duration-300 md:flex",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className="absolute top-8 right-0 z-40 flex size-8 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground shadow-sm outline-none transition-colors hover:border-brand hover:bg-brand/5 hover:text-brand focus-visible:ring-2 focus-visible:ring-ring"
      >
        {collapsed ? (
          <PanelLeftOpen className="size-4" />
        ) : (
          <PanelLeftClose className="size-4" />
        )}
      </button>
      <div
        className={cn(
          "flex h-16 items-center border-b px-5",
          collapsed && "justify-center px-0",
        )}
      >
        <Brand collapsed={collapsed} />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <SidebarNav collapsed={collapsed} />
      </div>
      <div className="border-t p-3">
        <SidebarUser collapsed={collapsed} />
      </div>
    </aside>
  );
}
