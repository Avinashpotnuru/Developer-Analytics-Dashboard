"use client";

import * as React from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Brand } from "./brand";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";
import { UserMenu } from "./user-menu";

export function MobileNavigation() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 flex-col gap-0 p-0">
        <SheetHeader className="border-b">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <div className="px-2">
            <Brand />
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-3">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
        <div className="border-t p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <SidebarUser />
            </div>
            <UserMenu />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
