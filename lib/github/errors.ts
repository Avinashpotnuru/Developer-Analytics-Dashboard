export type GitHubErrorCode =
  | "not_found"
  | "rate_limit"
  | "auth"
  | "validation"
  | "forbidden"
  | "server"
  | "network";

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  resource: string;
}

export interface GitHubErrorPayload {
  code: GitHubErrorCode;
  message: string;
  status: number;
  rateLimit: RateLimitInfo | null;
}

export class GitHubError extends Error {
  readonly code: GitHubErrorCode;
  readonly status: number;
  readonly rateLimit: RateLimitInfo | null;

  constructor(
    code: GitHubErrorCode,
    message: string,
    status: number,
    rateLimit: RateLimitInfo | null,
  ) {
    super(message);
    this.name = "GitHubError";
    this.code = code;
    this.status = status;
    this.rateLimit = rateLimit;
  }
}
