import type { ReadableSpan } from "@opentelemetry/sdk-trace-base";

import type { C4Model } from "../core";

export type C4Span = Pick<ReadableSpan, "name" | "attributes" | "duration">;

export type C4Meta = {
  c4Model: C4Model;
  spans: C4Span[];
};
