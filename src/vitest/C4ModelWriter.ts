import { writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

// import { TestCase } from "vitest/node";
import { Reporter } from "vitest/reporters";

import { C4Model } from "../C4Model";

export type C4Output = {
  file: string;
  content: string;
};
export type C4ModelGenerator = (model: C4Model) => C4Output;

export class C4ModelWriter implements Reporter {
  private c4Model: C4Model | undefined;
  private readonly generators: C4ModelGenerator[];
  static setupFile = join(
    import.meta.dirname,
    "setup" + extname(import.meta.url),
  );

  constructor(...generators: C4ModelGenerator[]) {
    this.generators = generators;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async onTestCaseResult(testCase: any) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.c4Model = testCase.meta().c4Model;
    if (!this.c4Model) {
      console.warn("⛔️ No C4 model found in test case meta:", testCase.meta());
      return;
    }
  }

  async onTestRunEnd() {
    if (!this.c4Model) {
      console.warn("⛔️ No C4 model found");
      return;
    }
    for (const generator of this.generators) {
      const output = generator(this.c4Model);
      await writeFile(output.file, output.content);
    }
    console.log("✅ C4 models updated");
  }
}
