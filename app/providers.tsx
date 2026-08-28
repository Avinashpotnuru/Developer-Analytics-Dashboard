"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "@/hooks/use-theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GitHubProvider } from "@/components/github/github-context";
import { ApiError } from "@/lib/github/queries";

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (error instanceof ApiError) {
    // Client errors (404 not found, 403 rate limit/forbidden) are not
    // transient, so retrying wastes requests and risks rate limits.
    if (error.status >= 400 && error.status < 500) return false;
  }
  return true;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: shouldRetry,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <GitHubProvider>{children}</GitHubProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
