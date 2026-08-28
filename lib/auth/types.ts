export interface SessionUser {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string;
}

export interface GitHubIdentity {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
}

export interface GitHubOAuthToken {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface GitHubOAuthError {
  error: string;
  error_description?: string;
  error_uri?: string;
}

export type GitHubOAuthResponse = GitHubOAuthToken | GitHubOAuthError;

export function isOAuthError(
  response: GitHubOAuthResponse,
): response is GitHubOAuthError {
  return (response as GitHubOAuthError).error !== undefined;
}
