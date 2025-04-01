import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/hono/index.ts",
    "src/workflows/index.ts",
    "src/workflows/cloudflare/index.ts",
  ],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: "esm",
  dts: true,
});
