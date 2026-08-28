import { Brand } from "./brand";
import { MobileNavigation } from "./mobile-navigation";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { HelpDialog } from "./help-dialog";
import { UsernameInput } from "@/components/github/username-input";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center gap-3 border-b bg-background/80 px-4 py-2 backdrop-blur md:px-6 md:py-0">
      <div className="md:hidden">
        <MobileNavigation />
      </div>
      <div className="md:hidden">
        <Brand />
      </div>
      <div className="flex-1" />
      <div className="order-last w-full sm:order-none sm:w-auto">
        <UsernameInput />
      </div>
      <HelpDialog />
      <ThemeToggle />
      <div className="hidden md:flex">
        <UserMenu />
      </div>
    </header>
  );
}
