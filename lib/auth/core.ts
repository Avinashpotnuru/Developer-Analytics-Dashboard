import crypto from "node:crypto";

import type { GitHubIdentity, SessionUser } from "./types";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const STATE_MAX_AGE_SECONDS = 10 * 60; // 10 minutes

export interface OAuthConfigValues {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

export function generateState(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function verifyState(
  provided: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (!provided || !expected) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

export function buildAuthorizeUrl(
  config: OAuthConfigValues,
  state: string,
): string {
  const url = new URL(GITHUB_AUTHORIZE_URL);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.callbackUrl);
  url.searchParams.set("state", state);
  // Intentionally no `scope` — request only the default public identity.
  return url.toString();
}

export function buildSuccessRedirect(login: string): string {
  return `/dashboard?user=${encodeURIComponent(login)}`;
}

function toBase64Url(value: Buffer | string): string {
  return Buffer.from(value).toString("base64url");
}

export function signSession(
  user: SessionUser,
  secret: string,
  maxAgeSeconds: number = SESSION_MAX_AGE_SECONDS,
): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + maxAgeSeconds;
  const payload = toBase64Url(
    JSON.stringify({ user, iat: issuedAt, exp: expiresAt }),
  );
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySession(
  token: string | null | undefined,
  secret: string,
): SessionUser | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      user: SessionUser;
      exp: number;
    };
    if (typeof data.exp !== "number" || data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return data.user;
  } catch {
    return null;
  }
}

export type FetchLike = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

export class OAuthExchangeError extends Error {
  readonly reason: string;
  constructor(reason: string) {
    super(`GitHub OAuth token exchange failed: ${reason}`);
    this.name = "OAuthExchangeError";
    this.reason = reason;
  }
}

export async function exchangeCodeForToken(
  config: OAuthConfigValues,
  code: string,
  fetchFn: FetchLike = fetch,
): Promise<string> {
  const response = await fetchFn(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.callbackUrl,
    }),
  });

  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
  } | null;

  if (!response.ok || !data || typeof data.access_token !== "string") {
    throw new OAuthExchangeError(data?.error ?? "token_exchange_failed");
  }

  return data.access_token;
}

export class UserFetchError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`Failed to fetch authenticated GitHub user (status ${status})`);
    this.name = "UserFetchError";
    this.status = status;
  }
}

export async function fetchAuthenticatedUser(
  accessToken: string,
  fetchFn: FetchLike = fetch,
): Promise<SessionUser> {
  const response = await fetchFn("https://api.github.com/user", {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${accessToken}`,
      "user-agent": "DeveloperAnalyticsDashboard",
      "x-github-api-version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new UserFetchError(response.status);
  }

  const identity = (await response.json()) as Partial<GitHubIdentity>;
  if (typeof identity.id !== "number" || typeof identity.login !== "string") {
    throw new UserFetchError(0);
  }

  return {
    id: identity.id,
    login: identity.login,
    name: identity.name ?? null,
    avatarUrl: identity.avatar_url ?? "",
  };
}
