import { NextRequest } from "next/server";
import { handleGithubRoute } from "@/lib/github/route-helpers";
import { getCommits, type ListQuery } from "@/lib/github/commits";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ owner: string; repo: string }> },
) {
  const { owner, repo } = await ctx.params;
  const params = request.nextUrl.searchParams;
  const query: ListQuery = {
    page: Number(params.get("page") ?? 1) || 1,
    perPage: Number(params.get("perPage") ?? 100) || 100,
  };
  return handleGithubRoute(() => getCommits(owner, repo, query));
}
