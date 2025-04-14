import { defineConfig } from "vitest/config";

import { toStructurizr } from "./src/generators/toStructurizr";
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
          file: "src/examples/workspace/workspace.json",
          content: JSON.stringify(c4Model, null, 2),
        })
      ),
      // (c4Model) => ({
      //   file: "src/examples/system-context-bank.md",
      //   content: generateC4PlantUml(c4Model, "System Context", "Bank"),
      // }),
      // (c4Model) => ({
      //   file: "src/examples/container-bank.md",
      //   content: generateC4PlantUml(c4Model, "Container", "Bank"),
      // }),
      // (c4Model) => ({
      //   file: "src/examples/component-api-application.md",
      //   content: generateC4PlantUml(c4Model, "Component", "APIApplication"),
      // })
    ],

    include: ["src/**/*.test.ts"],
  },
});
