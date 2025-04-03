import { writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll } from "vitest";

import { c4Model } from "../globalModel";
import { generateStructurizrDSL } from "../structurizr/generateStructurizrDSL";

afterAll(async () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  await writeFile(
    `${__dirname}/workspace/workspace.dsl`,
    generateStructurizrDSL(c4Model),
  );
  // await writeFile(
  //   `${__dirname}/system-context.md`,
  //   gfmMermaid(generateC4PlantUml(c4Model, "SystemContext", "Bank"))
  // );
  // await writeFile(
  //   `${__dirname}/container-api-application.md`,
  //   gfmMermaid(generateC4PlantUml(c4Model, "Container", "Bank"))
  // );
});

// function gfmMermaid(mermaid: string): string {
//   return `\`\`\`mermaid\n${mermaid}\`\`\``;
// }
