import { defineConfig } from "vitest/config";

import { generateC4PlantUml } from "./src/plantuml/index";
import { generateStructurizrDSL } from "./src/structurizr/generateStructurizrDSL";
import { C4ModelWriter } from "./src/vitest/C4ModelWriter";
export default defineConfig({
  test: {
    isolate: false,
    fileParallelism: false,
    reporters: [
      "default",
      new C4ModelWriter(
        (c4Model) => ({
          file: "src/examples/workspace/workspace.dsl",
          content: generateStructurizrDSL(c4Model),
        }),
        (c4Model) => ({
          file: "src/examples/system-context.md",
          content: generateC4PlantUml(c4Model, "SystemContext", "Bank"),
        }),
        (c4Model) => ({
          file: "src/examples/container-api-application.md",
          content: generateC4PlantUml(c4Model, "Container", "Bank"),
        }),
      ),
    ],

    include: ["src/**/*.test.ts"],
  },
});
