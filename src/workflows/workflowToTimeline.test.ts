import path from "path";
import { describe, expect, it } from "vitest";

import { parseCloudflareWorkflowSource } from "./cloudflare/parseCloudflareWorkflowSource";
import { workflowToTimeline } from "./workflowToTimeline";
describe("workflowToTimeline", () => {
  it("should convert a workflow to a timeline", () => {
    const rootNode = parseCloudflareWorkflowSource(
      path.join(__dirname, "cloudflare/examples/SampleWorkflow.ts"),
    );
    const timeline = workflowToTimeline(rootNode);
    expect(timeline).toEqual([
      "Step-X",
      "Step-Y",
      "Do stuff in parallel",
      "Process all items",
    ]);
  });
});
