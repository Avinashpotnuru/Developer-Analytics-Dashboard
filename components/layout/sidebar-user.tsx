"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGitHubContext } from "@/components/github/github-context";
import { useUser } from "@/lib/github/queries";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function SidebarUser({ collapsed }: { collapsed?: boolean }) {
  const { username } = useGitHubContext();
  const { data: profile } = useUser(username);
  const name = profile?.name ?? username;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-2 py-2",
        collapsed && "justify-center px-0",
      )}
    >
      <Avatar>
        <AvatarImage src={profile?.avatarUrl} alt={name} />
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      {!collapsed ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-xs text-muted-foreground">@{username}</p>
        </div>
      ) : null}
    </div>
  );
}
