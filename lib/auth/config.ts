import type { OAuthConfigValues } from "./core";

export interface AuthConfig extends OAuthConfigValues {
  sessionSecret: string;
}

export function getAuthConfig(): AuthConfig | null {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const callbackUrl = process.env.GITHUB_CALLBACK_URL;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!clientId || !clientSecret || !callbackUrl || !sessionSecret) {
    return null;
  }

  return { clientId, clientSecret, callbackUrl, sessionSecret };
}
