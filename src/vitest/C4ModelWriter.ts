import { writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

import type { TestModule } from "vitest/node.js";
// import { TestCase } from "vitest/node";
import type { Reporter } from "vitest/reporters";

import type { C4Model } from "../core/C4Model";
import type { C4Meta } from "./C4Meta";

export type C4Output = {
  file: string;
  content: string;
};

export type C4ModelGeneratorParams = {
  model: C4Model;
  spans: Uint8Array<ArrayBufferLike>[];
};
export type C4ModelGenerator = (params: C4ModelGeneratorParams) => C4Output;

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
    const c4Model = testCase.meta().c4Model;
    if (c4Model) {
      this.c4Model = c4Model;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async onTestRunEnd(_testModules: any) {
    const testModules: TestModule[] = _testModules;

    const spans: Uint8Array<ArrayBufferLike>[] = testModules
      .map((testModule) => {
        const meta = testModule.meta() as C4Meta;
        return meta.serializedSpans;
      })
      .filter((span) => span !== undefined);

    if (!this.c4Model) {
      console.warn("⛔️ No C4 model found");
      return;
    }
    for (const generator of this.generators) {
      const output = generator({
        model: this.c4Model,
        spans,
      });
      await writeFile(output.file, output.content);
    }
    console.log("✅ C4 models updated");
  }
}
