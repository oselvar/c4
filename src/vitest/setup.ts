import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { ExportResultCode } from "@opentelemetry/core";
import { JsonTraceSerializer } from "@opentelemetry/otlp-transformer";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  BatchSpanProcessor,
  type ReadableSpan,
} from "@opentelemetry/sdk-trace-base";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";

import { globalC4ModelBuilder, globalC4Ready } from "../core/globals";
import type { C4Meta } from "./C4Meta";

let processor: BatchSpanProcessor;
let sdk: NodeSDK;
let spans: ReadableSpan[];

beforeAll(() => {
  if (processor) {
    return;
  }
  spans = [];

  processor = new BatchSpanProcessor({
    export: (_spans, resultCallback) => {
      spans = [...spans, ..._spans];
      resultCallback({ code: ExportResultCode.SUCCESS });
    },
    shutdown: async () => {},
  });

  sdk = new NodeSDK({
    spanProcessor: processor,
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
  globalC4Ready();
});

afterAll(async (suite) => {
  await processor.forceFlush();
  await sdk.shutdown();

  if (spans.length > 0) {
    const serializedSpans = JsonTraceSerializer.serializeRequest(spans);
    if (serializedSpans) {
      const meta = suite.meta as C4Meta;
      meta.serializedSpans = serializedSpans;
    }
  }
});

beforeEach((test) => {
  const callchainName = test.task.name || "Unnamed Test";
  globalC4ModelBuilder.startCallchain(callchainName);
});

afterEach(async (test) => {
  const meta = test.task.meta as C4Meta;
  meta.c4Model = globalC4ModelBuilder.build();
});
