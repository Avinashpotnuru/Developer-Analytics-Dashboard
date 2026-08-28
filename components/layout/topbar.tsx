import { Brand } from "./brand";
import { MobileNavigation } from "./mobile-navigation";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="md:hidden">
        <MobileNavigation />
      </div>
      <div className="md:hidden">
        <Brand />
      </div>
      <div className="flex-1" />
      <ThemeToggle />
      <UserMenu />
    </header>
  );
}
