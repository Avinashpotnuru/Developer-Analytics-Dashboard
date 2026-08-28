import {
  Building2,
  CalendarDays,
  FolderGit2,
  LinkIcon,
  MapPin,
  Star,
  UserCheck,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { LanguageDistributionChart } from "@/components/charts/language-distribution-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { formatDate, formatNumber } from "@/lib/format";
import { getInitials } from "@/lib/utils";
import { mockActivity, mockAnalytics, mockProfile } from "@/lib/mock-data";

export default function ProfilePage() {
  const profile = mockProfile;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Your GitHub-style developer profile."
      />

      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
          <div className="ring-brand-gradient shrink-0 rounded-full p-1">
            <Avatar className="!size-24">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback className="text-2xl">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-3">
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                {profile.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                @{profile.username}
              </p>
            </div>
            <p className="max-w-xl text-sm text-muted-foreground">
              {profile.bio}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {profile.company ? (
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-4" />
                  {profile.company}
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {profile.location}
              </span>
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-foreground hover:underline"
              >
                <LinkIcon className="size-4" />
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                Joined {formatDate(profile.joinedAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Followers"
          value={formatNumber(profile.followers)}
          icon={Users}
        />
        <StatCard
          label="Following"
          value={formatNumber(profile.following)}
          icon={UserCheck}
        />
        <StatCard
          label="Public Repos"
          value={formatNumber(profile.publicRepos)}
          icon={FolderGit2}
        />
        <StatCard
          label="Total Stars"
          value={formatNumber(profile.totalStars)}
          icon={Star}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageDistributionChart
              data={mockAnalytics.languageDistribution}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity events={mockActivity.slice(0, 8)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
