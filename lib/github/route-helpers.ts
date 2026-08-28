import { GitHubError, type RateLimitInfo } from "./errors";

interface ErrorBody {
  error: {
    code: string;
    message: string;
    status: number;
  };
}

interface SuccessBody<T> {
  data: T;
  rateLimit: RateLimitInfo | null;
}

function withRateLimit(
  body: string,
  status: number,
  rateLimit: RateLimitInfo | null,
): Response {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (rateLimit) {
    headers["x-ratelimit-limit"] = String(rateLimit.limit);
    headers["x-ratelimit-remaining"] = String(rateLimit.remaining);
    headers["x-ratelimit-reset"] = String(rateLimit.reset);
  }
  return new Response(body, { status, headers });
}

export async function handleGithubRoute<T>(
  handler: () => Promise<{ data: T; rateLimit: RateLimitInfo | null }>,
): Promise<Response> {
  try {
    const result = await handler();
    const body: SuccessBody<T> = {
      data: result.data,
      rateLimit: result.rateLimit,
    };
    return withRateLimit(JSON.stringify(body), 200, result.rateLimit);
  } catch (error) {
    if (error instanceof GitHubError) {
      const body: ErrorBody = {
        error: {
          code: error.code,
          message: error.message,
          status: error.status,
        },
      };
      return withRateLimit(JSON.stringify(body), error.status, error.rateLimit);
    }
    const body: ErrorBody = {
      error: {
        code: "server",
        message: "An unexpected error occurred while contacting GitHub.",
        status: 500,
      },
    };
    return withRateLimit(JSON.stringify(body), 500, null);
  }
}
