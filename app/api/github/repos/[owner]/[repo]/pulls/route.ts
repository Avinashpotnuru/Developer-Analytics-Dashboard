import { NextRequest } from "next/server";
import { handleGithubRoute } from "@/lib/github/route-helpers";
import { getPullRequests, type PullRequestQuery } from "@/lib/github/pull-requests";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ owner: string; repo: string }> },
) {
  const { owner, repo } = await ctx.params;
  const params = request.nextUrl.searchParams;
  const query: PullRequestQuery = {
    page: Number(params.get("page") ?? 1) || 1,
    perPage: Number(params.get("perPage") ?? 100) || 100,
    state: (params.get("state") as PullRequestQuery["state"]) ?? "all",
  };
  return handleGithubRoute(() => getPullRequests(owner, repo, query));
}
