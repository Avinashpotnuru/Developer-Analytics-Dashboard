export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  denied:
    "GitHub authorization was denied. You can still analyze any public profile.",
  state: "The login request was invalid or expired. Please try again.",
  code: "The login request was missing required information. Please try again.",
  token: "We could not complete GitHub sign-in. Please try again.",
  user: "We could not load your GitHub account. Please try again.",
  rate_limit:
    "GitHub rate limit reached. Please try signing in again later.",
  config: "GitHub sign-in is not configured on this server.",
  redirect:
    "The GitHub callback URL does not match the OAuth app configuration.",
  unknown:
    "An unexpected error occurred during sign-in. Please try again.",
};

export function getAuthErrorMessage(
  code: string | null | undefined,
): string | null {
  if (!code) return null;
  return AUTH_ERROR_MESSAGES[code] ?? AUTH_ERROR_MESSAGES.unknown;
}
