import { NextRequest } from "next/server";
import { handleGithubRoute } from "@/lib/github/route-helpers";
import { getRepository } from "@/lib/github/repositories";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ owner: string; repo: string }> },
) {
  const { owner, repo } = await ctx.params;
  return handleGithubRoute(() => getRepository(owner, repo));
}
