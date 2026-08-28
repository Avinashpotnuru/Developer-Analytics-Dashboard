import { NextRequest, NextResponse } from "next/server";

import { getAuthConfig } from "@/lib/auth/config";
import {
  OAuthExchangeError,
  UserFetchError,
  buildSuccessRedirect,
  exchangeCodeForToken,
  fetchAuthenticatedUser,
  verifyState,
} from "@/lib/auth/core";
import {
  clearStateCookie,
  getStateCookie,
  setSessionUser,
} from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mapGithubError(githubError: string): string {
  if (githubError === "access_denied") return "denied";
  if (githubError === "redirect_uri_mismatch") return "redirect";
  return "denied";
}

function errorRedirect(origin: string, code: string): NextResponse {
  return NextResponse.redirect(
    new URL(`/dashboard?auth_error=${encodeURIComponent(code)}`, origin),
  );
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const params = request.nextUrl.searchParams;
  const githubError = params.get("error");

  if (githubError) {
    return errorRedirect(origin, mapGithubError(githubError));
  }

  const code = params.get("code");
  const state = params.get("state");

  if (!code) {
    return errorRedirect(origin, "code");
  }

  const expectedState = await getStateCookie();
  if (!verifyState(state, expectedState)) {
    return errorRedirect(origin, "state");
  }

  const config = getAuthConfig();
  if (!config) {
    return errorRedirect(origin, "config");
  }

  try {
    const token = await exchangeCodeForToken(config, code);
    const user = await fetchAuthenticatedUser(token);
    await setSessionUser(user);
    await clearStateCookie();
    return NextResponse.redirect(
      new URL(buildSuccessRedirect(user.login), origin),
    );
  } catch (cause) {
    let codeKey = "unknown";
    if (cause instanceof OAuthExchangeError) {
      codeKey = "token";
    } else if (cause instanceof UserFetchError) {
      codeKey = cause.status === 403 ? "rate_limit" : "user";
    }
    return errorRedirect(origin, codeKey);
  }
}
