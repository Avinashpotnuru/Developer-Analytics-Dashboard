import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({
  _cookies: {} as Record<string, string>,
  get(name: string) {
    return this._cookies[name]
      ? { name, value: this._cookies[name] }
      : undefined;
  },
  set(name: string, value: string) {
    this._cookies[name] = value;
  },
  delete(name: string) {
    delete this._cookies[name];
  },
  clear() {
    this._cookies = {};
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(store)),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

const SECRET = "test-session-secret";
const ORIGIN = "http://localhost:3000";

beforeAll(() => {
  process.env.GITHUB_CLIENT_ID = "client-id";
  process.env.GITHUB_CLIENT_SECRET = "client-secret";
  process.env.GITHUB_CALLBACK_URL = `${ORIGIN}/api/auth/github/callback`;
  process.env.SESSION_SECRET = SECRET;
});

beforeEach(() => {
  store.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn(
      (async (input: string) => {
        if (input.includes("/login/oauth/access_token")) {
          return jsonResponse({ access_token: "tok" });
        }
        if (input === "https://api.github.com/user") {
          return jsonResponse({
            id: 1,
            login: "alice",
            name: "Alice",
            avatar_url: "https://x/y.png",
          });
        }
        return jsonResponse({}, 404);
      }) as typeof fetch,
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

import { NextRequest } from "next/server";
import { signSession, verifySession } from "@/lib/auth/core";
import { GET as githubGet } from "@/app/api/auth/github/route";
import { GET as callbackGet } from "@/app/api/auth/github/callback/route";
import { POST as logoutPost } from "@/app/api/auth/logout/route";
import { GET as sessionGet } from "@/app/api/auth/session/route";

function request(url: string): NextRequest {
  return new NextRequest(url, { method: "GET" });
}

describe("GET /api/auth/github", () => {
  it("redirects to GitHub with a state param and stores the state cookie", async () => {
    const res = await githubGet(request(`${ORIGIN}/api/auth/github`));
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("github.com/login/oauth/authorize");
    expect(location).toContain("state=");
    expect(location).not.toContain("scope=");
    const state = new URL(location).searchParams.get("state");
    expect(state).toBeTruthy();
    expect(store._cookies["gh_oauth_state"]).toBe(state);
  });
});

describe("GET /api/auth/github/callback", () => {
  it("exchanges the code and redirects to the authenticated dashboard", async () => {
    const start = await githubGet(request(`${ORIGIN}/api/auth/github`));
    const state = new URL(start.headers.get("location") ?? "").searchParams.get(
      "state",
    );

    const res = await callbackGet(
      request(
        `${ORIGIN}/api/auth/github/callback?code=abc&state=${encodeURIComponent(state ?? "")}`,
      ),
    );
    const location = res.headers.get("location") ?? "";
    expect(location).toContain(`/dashboard?user=alice`);

    const session = store._cookies["gh_session"];
    expect(session).toBeTruthy();
    expect(verifySession(session, SECRET)?.login).toBe("alice");
    expect(store._cookies["gh_oauth_state"]).toBeUndefined();
  });

  it("handles user denial", async () => {
    const res = await callbackGet(
      request(`${ORIGIN}/api/auth/github/callback?error=access_denied`),
    );
    expect(res.headers.get("location")).toContain("auth_error=denied");
  });

  it("rejects an invalid state", async () => {
    const res = await callbackGet(
      request(`${ORIGIN}/api/auth/github/callback?code=abc&state=wrong`),
    );
    expect(res.headers.get("location")).toContain("auth_error=state");
  });

  it("rejects a missing code", async () => {
    const res = await callbackGet(
      request(`${ORIGIN}/api/auth/github/callback?state=abc`),
    );
    expect(res.headers.get("location")).toContain("auth_error=code");
  });
});

describe("GET /api/auth/session", () => {
  it("returns the verified user when a session cookie exists", async () => {
    store._cookies["gh_session"] = signSession(
      { id: 1, login: "alice", name: "Alice", avatarUrl: "x" },
      SECRET,
    );
    const res = await sessionGet();
    const body = (await res.json()) as { user: { login: string } | null };
    expect(body.user?.login).toBe("alice");
  });

  it("returns a null user when there is no session", async () => {
    store.clear();
    const res = await sessionGet();
    const body = (await res.json()) as { user: { login: string } | null };
    expect(body.user).toBeNull();
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the session cookie", async () => {
    store._cookies["gh_session"] = "something";
    const res = await logoutPost();
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(true);
    expect(store._cookies["gh_session"]).toBeUndefined();
  });
});
