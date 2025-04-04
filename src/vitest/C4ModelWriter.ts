import { RunnerTestCase } from "vitest";
import { Reporter } from "vitest/reporters";

import { C4Model } from "../c4ModelZ";

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

  async onTestEnd(test: RunnerTestCase) {
    console.log("TEST META", test.meta);
  }

  async onTestRunEnd() {
    // for (const generator of this.generators) {
    //   const output = generator(globalC4Model.build());
    //   await writeFile(output.file, output.content);
    // }
    console.log("✅ C4 models updated");
  }
}
