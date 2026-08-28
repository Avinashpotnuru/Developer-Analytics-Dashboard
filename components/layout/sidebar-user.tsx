import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockProfile } from "@/lib/mock-data";
import { getInitials } from "@/lib/utils";

export function SidebarUser() {
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2">
      <Avatar>
        <AvatarImage src={mockProfile.avatarUrl} alt={mockProfile.name} />
        <AvatarFallback>{getInitials(mockProfile.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{mockProfile.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          @{mockProfile.username}
        </p>
      </div>
    </div>
  );
}
