import type { TracesData } from "../opentelemetry/proto/trace/v1/trace";
import type { C4Model, C4Name } from "./C4Model";
import { C4ModelBuilder } from "./C4ModelBuilder";
import { otelAttributesToRecord } from "./otelAttributesToRecord";

export function toC4Name(name: string): C4Name {
  return name as C4Name;
}

export function buildC4ModelFromOtel(traces: TracesData[]): C4Model {
  const readyPromise = Promise.resolve();
  const builder = new C4ModelBuilder(
    { objects: {}, callchains: [] },
    readyPromise,
  );

  // Process each trace
  for (const trace of traces) {
    for (const resourceSpan of trace.resourceSpans) {
      for (const scopeSpan of resourceSpan.scopeSpans) {
        for (const span of scopeSpan.spans) {
          switch (span.name) {
            case "softwareSystem": {
              const attributes = otelAttributesToRecord<{
                name: string;
                tags?: string[];
              }>(span.attributes || []);

              builder.addSoftwareSystem(toC4Name(attributes.name), {
                tags: attributes.tags,
              });
              break;
            }

            case "container": {
              const attributes = otelAttributesToRecord<{
                name: string;
                parentName: string;
                tags?: string[];
              }>(span.attributes || []);

              builder.addContainer(toC4Name(attributes.name), {
                softwareSystem: toC4Name(attributes.parentName),
                tags: attributes.tags,
              });
              break;
            }

            case "component": {
              const attributes = otelAttributesToRecord<{
                name: string;
                parentName: string;
                tags?: string[];
              }>(span.attributes || []);

              builder.addComponent(toC4Name(attributes.name), {
                container: toC4Name(attributes.parentName),
                tags: attributes.tags,
              });
              break;
            }

            case "callchain": {
              const attributes = otelAttributesToRecord<{
                name: string;
              }>(span.attributes || []);

              builder.startCallchain(attributes.name);
              break;
            }

            case "call": {
              const attributes = otelAttributesToRecord<{
                callerName: string;
                calleeName: string;
                operationName: string;
              }>(span.attributes || []);

              // Add the call to the current callchain
              if (span.parentSpanId) {
                // This is a nested call
                const parentSpan = scopeSpan.spans.find(
                  (s) => s.spanId === span.parentSpanId,
                );
                if (parentSpan) {
                  builder.addCall(
                    toC4Name(attributes.callerName),
                    toC4Name(attributes.calleeName),
                    attributes.operationName,
                  );
                }
              } else {
                // This is a top-level call
                builder.addCall(
                  toC4Name(attributes.callerName),
                  toC4Name(attributes.calleeName),
                  attributes.operationName,
                );
              }
              break;
            }
          }
        }
      }
    }
  }

  return builder.build();
}
