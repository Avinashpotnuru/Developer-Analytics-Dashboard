"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGitHubContext } from "@/components/github/github-context";

const USERNAME_PATTERN = /^[A-Za-z0-9-]+$/;

export function UsernameInput() {
  const { username, setUsername, setSelectedRepo } = useGitHubContext();
  const [value, setValue] = React.useState(username);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = value.trim();
    if (!next) {
      setError("Enter a GitHub username.");
      return;
    }
    if (!USERNAME_PATTERN.test(next)) {
      setError("Letters, numbers and hyphens only.");
      return;
    }
    setError(null);
    setSelectedRepo(null);
    setUsername(next);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2" />
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="GitHub username"
            aria-label="GitHub username"
            className="w-44 pl-8"
          />
        </div>
        <Button type="submit" size="sm">
          View
        </Button>
      </div>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </form>
  );
}
