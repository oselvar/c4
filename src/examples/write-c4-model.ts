import { writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll } from "vitest";

import { c4Model } from "../globalModel";
import { generateC4PlantUml } from "../plantuml";
import { generateStructurizrDSL } from "../structurizr/generateStructurizrDSL";

afterAll(async () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  await writeFile(
    `${__dirname}/workspace/workspace.dsl`,
    generateStructurizrDSL(c4Model),
  );
  await writeFile(
    `${__dirname}/mermaid-plantuml.md`,
    `\`\`\`mermaid\n${generateC4PlantUml(c4Model)}\`\`\``,
  );
});
