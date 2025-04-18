import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { ExportResultCode } from "@opentelemetry/core";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  BatchSpanProcessor,
  type ReadableSpan,
} from "@opentelemetry/sdk-trace-base";
import { afterEach, beforeEach } from "vitest";

import { globalC4ModelBuilder, globalC4Ready } from "../core/globals";
import type { C4Meta } from "./C4Meta";
let processor: BatchSpanProcessor;
let sdk: NodeSDK;
let spans: ReadableSpan[];

beforeEach((test) => {
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

  const callchainName = test.task.name || "Unnamed Test";
  globalC4ModelBuilder.startCallchain(callchainName);
});

afterEach(async (test) => {
  const meta = test.task.meta as C4Meta;
  meta.c4Model = globalC4ModelBuilder.build();

  await processor.forceFlush();
  await sdk.shutdown();
  meta.spans = spans.map(({ name, attributes, duration }) => ({
    name,
    attributes,
    duration,
  }));
});
