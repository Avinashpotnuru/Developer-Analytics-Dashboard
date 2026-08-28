import { NextRequest } from "next/server";
import { handleGithubRoute } from "@/lib/github/route-helpers";
import { getIssues, type IssueQuery } from "@/lib/github/issues";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ owner: string; repo: string }> },
) {
  const { owner, repo } = await ctx.params;
  const params = request.nextUrl.searchParams;
  const query: IssueQuery = {
    page: Number(params.get("page") ?? 1) || 1,
    perPage: Number(params.get("perPage") ?? 100) || 100,
    state: (params.get("state") as IssueQuery["state"]) ?? "all",
  };
  return handleGithubRoute(() => getIssues(owner, repo, query));
}
