import { writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { c4Model } from "@oselvar/c4";
import { afterAll } from "vitest";

afterAll(async () => {
  const dsl = c4Model.generateStructurizrDSL();
  const __dirname = dirname(fileURLToPath(import.meta.url));
  await writeFile(`${__dirname}/workspace/workspace.dsl`, dsl);
});
