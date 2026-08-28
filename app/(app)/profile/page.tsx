"use client";

import * as React from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { LanguageDistributionChart } from "@/components/charts/language-distribution-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { RepoSelector } from "@/components/github/repo-selector";
import { useGitHubContext } from "@/components/github/github-context";
import { useDeveloperAnalytics } from "@/lib/analytics/queries";
import { formatDate, formatNumber } from "@/lib/format";
import { getInitials } from "@/lib/utils";
import type { ActivityEvent } from "@/lib/types";

export default function ProfilePage() {
  const { selectedRepo } = useGitHubContext();
  const {
    analytics,
    profile,
    commits,
    isLoading,
    isError,
    error,
    sectionErrors,
    refetch,
  } = useDeveloperAnalytics();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError || !analytics || !profile) {
    return (
      <ErrorState
        title="Could not load profile"
        message={error?.message ?? "An unexpected error occurred."}
        onRetry={refetch}
      />
    );
  }

  const recentEvents: ActivityEvent[] = (commits ?? []).slice(0, 8).map(
    (commit) => ({
      id: commit.id,
      type: "commit",
      repository: commit.repository,
      description: commit.message,
      date: commit.date,
    }),
  );

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
            {profile.bio ? (
              <p className="max-w-xl text-sm text-muted-foreground">
                {profile.bio}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {profile.company ? (
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-4" />
                  {profile.company}
                </span>
              ) : null}
              {profile.location ? (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {profile.location}
                </span>
              ) : null}
              {profile.website ? (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-foreground hover:underline"
                >
                  <LinkIcon className="size-4" />
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              ) : null}
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                Joined {formatDate(profile.joinedAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Followers" value={formatNumber(profile.followers)} icon={Users} />
        <StatCard label="Following" value={formatNumber(profile.following)} icon={UserCheck} />
        <StatCard label="Public Repos" value={formatNumber(profile.publicRepos)} icon={FolderGit2} />
        <StatCard label="Total Stars" value={formatNumber(analytics.overview.totalStars)} icon={Star} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedRepo ? (
              <EmptyState
                title="Select a repository"
                description="Choose a repository to view its language breakdown."
                action={<RepoSelector />}
              />
            ) : sectionErrors.languages ? (
              <ErrorState
                title="Languages unavailable"
                message={sectionErrors.languages.message}
                onRetry={refetch}
              />
            ) : (
              <LanguageDistributionChart data={analytics.languages.distribution} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest commits across the repository</CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedRepo ? (
              <EmptyState
                title="Select a repository"
                description="Choose a repository to view recent activity."
                action={<RepoSelector />}
              />
            ) : sectionErrors.commits ? (
              <ErrorState
                title="Activity unavailable"
                message={sectionErrors.commits.message}
                onRetry={refetch}
              />
            ) : recentEvents.length > 0 ? (
              <RecentActivity events={recentEvents} />
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No recent commits.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
