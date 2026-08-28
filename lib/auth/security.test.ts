import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const clientFiles = [
  "lib/auth/queries.ts",
  "lib/auth/messages.ts",
  "components/layout/user-menu.tsx",
  "components/auth/auth-error-banner.tsx",
];

describe("auth secret isolation", () => {
  const importPattern =
    /(import|from)\s+["'][^"']*auth\/(config|session|core)["']/;
  const serverOnlyPattern = /from\s+["']next\/headers["']/;

  for (const file of clientFiles) {
    it(`${file} does not import server-only auth modules`, () => {
      const content = readFileSync(join(process.cwd(), file), "utf8");
      expect(content).not.toMatch(/GITHUB_CLIENT_SECRET/);
      expect(content).not.toMatch(/process\.env/);
      expect(content).not.toMatch(importPattern);
      expect(content).not.toMatch(serverOnlyPattern);
    });
  }
});
