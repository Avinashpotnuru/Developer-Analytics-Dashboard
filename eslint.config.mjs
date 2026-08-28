import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Agent tooling and skill scripts are outside the application source:
    ".opencode/**",
    ".agents/**",
  ]),
  {
    rules: {
      // TanStack Table v8 returns non-memoizable functions from useReactTable;
      // this is expected and safe for our usage.
      "react-hooks/incompatible-library": "off",
    },
  },
]);

export default eslintConfig;
