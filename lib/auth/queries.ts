"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { SessionUser } from "./types";

interface SessionResponse {
  user: SessionUser | null;
}

async function fetchSession(): Promise<SessionUser | null> {
  const response = await fetch("/api/auth/session");
  if (!response.ok) {
    throw new Error("Failed to load session");
  }
  const data = (await response.json()) as SessionResponse;
  return data.user;
}

export function useSession() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["auth", "session"],
    queryFn: fetchSession,
    staleTime: 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      await queryClient.invalidateQueries({ queryKey: ["github"] });
    }
  };

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    logout,
  };
}
