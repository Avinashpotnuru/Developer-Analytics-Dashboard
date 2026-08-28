import { Brand } from "./brand";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center border-b px-5">
        <Brand />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <SidebarNav />
      </div>
      <div className="border-t p-3">
        <SidebarUser />
      </div>
    </aside>
  );
}
