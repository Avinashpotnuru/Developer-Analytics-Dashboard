"use client";

import * as React from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CircleDot,
  FolderGit2,
  GitCommitHorizontal,
  GitPullRequest,
  Languages,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGitHubContext } from "@/components/github/github-context";

type GuideIcon = React.ComponentType<{ className?: string }>;

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.42.36.8 1.08.8 2.18v3.23c0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.74 18.27.5 12 .5Z" />
    </svg>
  );
}

const STEPS: { icon: GuideIcon; title: string; text: string }[] = [
  {
    icon: Search,
    title: "Enter a GitHub username",
    text: "Type any public GitHub username in the search box above and press View to load their analytics.",
  },
  {
    icon: GitHubMark,
    title: "Or sign in with GitHub",
    text: "Click “Sign in with GitHub” in the top-right, then choose “Show my analytics” to view your own data.",
  },
  {
    icon: BarChart3,
    title: "Explore the dashboard",
    text: "Switch repositories, change the date range, and dig into commits, pull requests, issues and languages.",
  },
];

const METRICS = [
  {
    icon: FolderGit2,
    label: "Repositories",
    text: "Public repositories with their stars and forks.",
  },
  {
    icon: GitCommitHorizontal,
    label: "Commits",
    text: "Recent commit activity and trends over time.",
  },
  {
    icon: GitPullRequest,
    label: "Pull Requests",
    text: "Open, merged and closed PRs plus the merge rate.",
  },
  {
    icon: CircleDot,
    label: "Issues",
    text: "Issue tracking across the selected repositories.",
  },
  {
    icon: Languages,
    label: "Languages",
    text: "Language breakdown of the codebase.",
  },
  {
    icon: CalendarDays,
    label: "Contribution Graph",
    text: "A daily coding-activity heatmap.",
  },
];

export function OnboardingGuide({
  variant = "page",
}: {
  variant?: "page" | "dialog";
}) {
  const { setUsername } = useGitHubContext();
  const [value, setValue] = React.useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = value.trim();
    if (next) setUsername(next);
  };

  return (
    <div className="space-y-8">
      {variant === "page" ? (
        <div className="relative overflow-hidden rounded-2xl border bg-card p-8 text-center">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-brand-gradient" />
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Welcome to the Developer Analytics Dashboard
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Enter a GitHub username or sign in to explore commits, pull
            requests, issues, languages and contribution trends.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 flex max-w-md items-center gap-2"
          >
            <Input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="GitHub username (e.g. torvalds)"
              aria-label="GitHub username"
              className="flex-1"
            />
            <Button type="submit">
              View analytics
              <ArrowRight className="size-4" />
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            or{" "}
            <a
              href="/api/auth/github"
              className="font-medium text-brand underline-offset-4 hover:underline"
            >
              sign in with GitHub
            </a>{" "}
            to see your own data.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Only public data is shown. Private repositories are not included.
          </p>
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          {variant === "page" ? "How to use this dashboard" : "Getting started"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-xl border bg-card p-4">
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <step.icon className="size-5" />
              </div>
              <p className="text-sm font-medium">
                {index + 1}. {step.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          What you’ll see
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map((metric) => (
            <div
              key={metric.label}
              className="flex gap-3 rounded-xl border bg-card p-4"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <metric.icon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{metric.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {metric.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Tip: after signing in, open the account menu and choose “Show my
        analytics” to load your profile automatically.
      </p>
    </div>
  );
}
