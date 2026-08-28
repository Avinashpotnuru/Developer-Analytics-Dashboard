import { NextRequest, NextResponse } from "next/server";

import { getAuthConfig } from "@/lib/auth/config";
import { buildAuthorizeUrl, generateState } from "@/lib/auth/core";
import { setStateCookie } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const config = getAuthConfig();
  if (!config) {
    return NextResponse.redirect(
      new URL("/dashboard?auth_error=config", request.nextUrl.origin),
    );
  }

  const state = generateState();
  await setStateCookie(state);
  return NextResponse.redirect(buildAuthorizeUrl(config, state));
}
