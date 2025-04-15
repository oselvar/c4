import { defineConfig } from "vitest/config";

import { toLikeC4, toStructurizr } from "./src/generators/toDsl";
import { C4ModelWriter } from "./src/vitest/C4ModelWriter";

export default defineConfig({
  test: {
    isolate: false,
    fileParallelism: false,
    setupFiles: [C4ModelWriter.setupFile],
    reporters: [
      "default",
      new C4ModelWriter(
        (c4Model) => ({
          file: "src/examples/workspace/workspace.dsl",
          content: toStructurizr(c4Model),
        }),
        (c4Model) => ({
          file: "src/examples/workspace/workspace.c4",
          content: toLikeC4(c4Model),
        }),
      ),
    ],

    include: ["src/**/*.test.ts"],
  },
});
