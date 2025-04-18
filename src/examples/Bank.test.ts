import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { ExportResultCode } from "@opentelemetry/core";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  BatchSpanProcessor,
  type ReadableSpan,
} from "@opentelemetry/sdk-trace-base";
import { beforeEach, describe, it } from "vitest";

import { globalC4Ready } from "../core";
import { Database, SecurityComponent, SignInController } from "./Bank";

describe("Bank", () => {
  let processor: BatchSpanProcessor;
  let sdk: NodeSDK;
  let spanLists: ReadableSpan[][];

  beforeEach(() => {
    spanLists = [];

    processor = new BatchSpanProcessor({
      export: (_spans, resultCallback) => {
        spanLists = [...spanLists, _spans];
        resultCallback({ code: ExportResultCode.SUCCESS });
      },
      shutdown: async () => {},
    });

    sdk = new NodeSDK({
      spanProcessor: processor,
      instrumentations: [getNodeAutoInstrumentations()],
    });

    console.log("Starting SDK");
    sdk.start();
    console.log("SDK started");
    globalC4Ready();
  });

  it("keeps or money safe", async () => {
    const database = new Database();
    const securityComponent = new SecurityComponent(database);
    const signinController = new SignInController(securityComponent);

    signinController.signIn();

    await processor.forceFlush();
    await sdk.shutdown();

    // for (const spanList of spanLists) {
    //   console.log(spanList);
    // }
  });
});
