import { cookies } from "next/headers";

import {
  SESSION_MAX_AGE_SECONDS,
  STATE_MAX_AGE_SECONDS,
  signSession,
  verifySession,
} from "./core";
import type { SessionUser } from "./types";

export const SESSION_COOKIE = "gh_session";
export const STATE_COOKIE = "gh_oauth_state";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySession(token, secret);
}

export async function setSessionUser(user: SessionUser): Promise<void> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return;
  const store = await cookies();
  store.set(
    SESSION_COOKIE,
    signSession(user, secret),
    cookieOptions(SESSION_MAX_AGE_SECONDS),
  );
}

export async function clearSessionUser(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function setStateCookie(state: string): Promise<void> {
  const store = await cookies();
  store.set(
    STATE_COOKIE,
    state,
    cookieOptions(STATE_MAX_AGE_SECONDS),
  );
}

export async function getStateCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(STATE_COOKIE)?.value;
}

export async function clearStateCookie(): Promise<void> {
  const store = await cookies();
  store.delete(STATE_COOKIE);
}
