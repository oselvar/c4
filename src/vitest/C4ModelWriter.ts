import { writeFile } from "node:fs/promises";

import { Reporter } from "vitest/reporters";

import { C4Model } from "../c4Model";
import { globalC4Model } from "../globalC4Model";

export type C4Output = {
  file: string;
  content: string;
};
export type C4ModelGenerator = (model: C4Model) => C4Output;

export class C4ModelWriter implements Reporter {
  private readonly generators: C4ModelGenerator[];

  constructor(...generators: C4ModelGenerator[]) {
    this.generators = generators;
  }

  async onTestRunEnd() {
    for (const generator of this.generators) {
      const output = generator(globalC4Model);
      await writeFile(output.file, output.content);
    }
    console.log("✅ C4 models updated");
  }
}
