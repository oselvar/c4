import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/cli/index.ts",
    "src/index.ts",
    "src/hono/index.ts",
    "src/workflows/index.ts",
    "src/workflows/cloudflare/index.ts",
    "src/structurizr/index.ts",
    "src/plantuml/index.ts",
    "src/openapi/index.ts",
    "src/vitest/index.ts",
    "src/vitest/setup.ts",
  ],
  external: ["vitest", "hono"],
  splitting: true,
  sourcemap: true,
  clean: true,
  format: "esm",
  dts: true,
});
