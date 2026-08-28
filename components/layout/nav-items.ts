import {
  CircleDot,
  FolderGit2,
  GitCommitHorizontal,
  GitPullRequest,
  LayoutDashboard,
  type LucideIcon,
  User,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview of your developer activity",
  },
  {
    title: "Repositories",
    href: "/repositories",
    icon: FolderGit2,
    description: "Browse and analyze repositories",
  },
  {
    title: "Commits",
    href: "/commits",
    icon: GitCommitHorizontal,
    description: "Commit history and statistics",
  },
  {
    title: "Pull Requests",
    href: "/pull-requests",
    icon: GitPullRequest,
    description: "Track pull request activity",
  },
  {
    title: "Issues",
    href: "/issues",
    icon: CircleDot,
    description: "Open and closed issues",
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    description: "Your GitHub profile",
  },
];
