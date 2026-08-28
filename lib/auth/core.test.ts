import { describe, expect, it } from "vitest";

import {
  OAuthExchangeError,
  UserFetchError,
  buildAuthorizeUrl,
  buildSuccessRedirect,
  exchangeCodeForToken,
  fetchAuthenticatedUser,
  generateState,
  signSession,
  verifySession,
  verifyState,
} from "./core";

const config = {
  clientId: "id",
  clientSecret: "secret",
  callbackUrl: "http://cb",
};
const secret = "s3cr3t";

describe("generateState", () => {
  it("returns a unique 64-char hex string", () => {
    const a = generateState();
    const b = generateState();
    expect(a).toMatch(/^[a-f0-9]{64}$/);
    expect(a).not.toBe(b);
  });
});

describe("verifyState", () => {
  it("matches equal values", () => {
    const s = generateState();
    expect(verifyState(s, s)).toBe(true);
  });
  it("rejects mismatches and nulls", () => {
    expect(verifyState("a", "b")).toBe(false);
    expect(verifyState(null, "b")).toBe(false);
    expect(verifyState("a", null)).toBe(false);
    expect(verifyState(undefined, undefined)).toBe(false);
  });
});

describe("buildAuthorizeUrl", () => {
  it("includes client_id, redirect_uri, state and no scope", () => {
    const url = buildAuthorizeUrl(config, "xyz");
    expect(url).toContain("github.com/login/oauth/authorize");
    expect(url).toContain("client_id=id");
    expect(url).toContain("redirect_uri=");
    expect(url).toContain("state=xyz");
    expect(url).not.toContain("scope");
  });
});

describe("buildSuccessRedirect", () => {
  it("redirects to the dashboard for the login", () => {
    expect(buildSuccessRedirect("alice")).toBe("/dashboard?user=alice");
  });
});

describe("session signing", () => {
  const user = { id: 1, login: "alice", name: "Alice", avatarUrl: "x" };
  it("round-trips a valid token", () => {
    const token = signSession(user, secret);
    expect(verifySession(token, secret)).toEqual(user);
  });
  it("rejects a wrong secret", () => {
    const token = signSession(user, secret);
    expect(verifySession(token, "other")).toBeNull();
  });
  it("rejects a tampered payload", () => {
    const token = signSession(user, secret);
    const [payload, signature] = token.split(".");
    const tampered = `${payload.slice(0, -1)}a.${signature}`;
    expect(verifySession(tampered, secret)).toBeNull();
  });
  it("rejects an expired token", () => {
    const token = signSession(user, secret, -10);
    expect(verifySession(token, secret)).toBeNull();
  });
  it("returns null for empty or missing token", () => {
    expect(verifySession("", secret)).toBeNull();
    expect(verifySession(null, secret)).toBeNull();
    expect(verifySession(undefined, secret)).toBeNull();
  });
});

describe("exchangeCodeForToken", () => {
  it("returns the access token on success", async () => {
    const fetchMock = (async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({ access_token: "tok", token_type: "bearer", scope: "" }),
      }) as Response) as typeof fetch;
    const token = await exchangeCodeForToken(config, "code", fetchMock);
    expect(token).toBe("tok");
  });
  it("throws OAuthExchangeError on a GitHub error", async () => {
    const fetchMock = (async () =>
      ({
        ok: false,
        status: 400,
        json: async () => ({ error: "bad_verification_code" }),
      }) as Response) as typeof fetch;
    await expect(exchangeCodeForToken(config, "code", fetchMock)).rejects.toBeInstanceOf(
      OAuthExchangeError,
    );
  });
  it("throws when the token is missing", async () => {
    const fetchMock = (async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({}),
      }) as Response) as typeof fetch;
    await expect(exchangeCodeForToken(config, "code", fetchMock)).rejects.toBeInstanceOf(
      OAuthExchangeError,
    );
  });
});

describe("fetchAuthenticatedUser", () => {
  it("maps the GitHub identity to a SessionUser", async () => {
    const fetchMock = (async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({ id: 2, login: "bob", name: null, avatar_url: "y" }),
      }) as Response) as typeof fetch;
    const user = await fetchAuthenticatedUser("tok", fetchMock);
    expect(user).toEqual({ id: 2, login: "bob", name: null, avatarUrl: "y" });
  });
  it("throws UserFetchError on a non-ok response", async () => {
    const fetchMock = (async () =>
      ({
        ok: false,
        status: 401,
        json: async () => ({}),
      }) as Response) as typeof fetch;
    await expect(fetchAuthenticatedUser("tok", fetchMock)).rejects.toBeInstanceOf(
      UserFetchError,
    );
  });
  it("throws when required fields are missing", async () => {
    const fetchMock = (async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({ login: "bob" }),
      }) as Response) as typeof fetch;
    await expect(fetchAuthenticatedUser("tok", fetchMock)).rejects.toBeInstanceOf(
      UserFetchError,
    );
  });
});
