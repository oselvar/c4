import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    isolate: false,
    fileParallelism: false,
    setupFiles: ["src/examples/write-c4-models.ts"],
    include: ["src/**/*.test.ts"],
  },
});
