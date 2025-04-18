import { defineConfig } from "vitest/config";

import { toLikeC4, toStructurizr } from "./src/generators/toDsl";
import { C4ModelWriter } from "./src/vitest/C4ModelWriter";

export default defineConfig({
  test: {
    setupFiles: [C4ModelWriter.setupFile],
    reporters: [
      "default",
      new C4ModelWriter(
        ({ model }) => ({
          file: "src/examples/workspace/workspace.dsl",
          content: toStructurizr(model),
        }),
        ({ model }) => ({
          file: "src/examples/workspace/workspace.c4",
          content: toLikeC4(model),
        })
      ),
    ],

    include: ["src/**/*.test.ts"],
  },
});
