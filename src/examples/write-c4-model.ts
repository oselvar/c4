import { writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll } from "vitest";

import { c4Model } from "../c4Model";
import { generateStructurizrDSL } from "../structurizr/generateStructurizrDSL";

afterAll(async () => {
  const dsl = generateStructurizrDSL(c4Model);
  // const wspace = RawInterpreter.visit(cst) as Workspace;
  const __dirname = dirname(fileURLToPath(import.meta.url));
  await writeFile(`${__dirname}/workspace/workspace.dsl`, dsl);
});
