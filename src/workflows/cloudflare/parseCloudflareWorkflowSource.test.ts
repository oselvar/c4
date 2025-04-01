import path from "path";
import { describe, expect, it } from "vitest";

import type { RootNode } from "../WorkflowAst";
import { parseCloudflareWorkflowSource } from "./parseCloudflareWorkflowSource";

describe("parseCloudflareWorkflow", () => {
  it("should create a conditional workflow", async () => {
    const rootNode = parseCloudflareWorkflowSource(
      path.join(__dirname, "./examples/SampleWorkflow.ts"),
    );
    const expected: RootNode = {
      type: "root",
      body: [
        {
          type: "step",
          label: "Step-X",
        },
        {
          type: "if",
          condition: "c1",
          thenBranch: {
            type: "then",
            body: [
              {
                type: "step",
                label: "step-a",
              },
            ],
          },
          elseBranch: {
            type: "else",
            body: [
              {
                type: "step",
                label: "step-b",
              },
              {
                type: "step",
                label: "step-c",
              },
            ],
          },
        },
        {
          type: "step",
          label: "Step-Y",
        },
        {
          type: "if",
          condition: "c2",
          thenBranch: {
            type: "then",
            body: [
              {
                type: "parallel",
                label: "Do stuff in parallel",
                body: [
                  {
                    type: "step",
                    label: "parallel-p",
                  },
                  {
                    type: "step",
                    label: "parallel-q",
                  },
                ],
              },
            ],
          },
        },
        {
          type: "step",
          label: "step-Z",
        },
        {
          type: "loop",
          label: "Process all items",
          body: [
            {
              type: "step",
              label: "step-serial-s",
            },
          ],
        },
      ],
    };
    expect(rootNode).toEqual(expected);
  });
});
