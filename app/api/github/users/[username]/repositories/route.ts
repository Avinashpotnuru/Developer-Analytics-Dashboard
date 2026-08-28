import { NextRequest } from "next/server";
import { handleGithubRoute } from "@/lib/github/route-helpers";
import { getUserRepositories, type RepositoryQuery } from "@/lib/github/users";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ username: string }> },
) {
  const { username } = await ctx.params;
  const params = request.nextUrl.searchParams;
  const query: RepositoryQuery = {
    page: Number(params.get("page") ?? 1) || 1,
    perPage: Number(params.get("perPage") ?? 30) || 30,
    sort: (params.get("sort") as RepositoryQuery["sort"]) ?? undefined,
    type: (params.get("type") as RepositoryQuery["type"]) ?? undefined,
  };
  return handleGithubRoute(() => getUserRepositories(username, query));
}
