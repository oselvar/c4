import { describe, expect, it } from "vitest";

import type { RootNode } from "./WorkflowAst";
import { workflowToMermaid } from "./workflowToMermaid";

describe("astToMermaid", () => {
  it("should convert a workflow to a Mermaid diagram", () => {
    const rootNode: RootNode = {
      type: "root",
      body: [
        { type: "step", label: "step-X" },
        {
          type: "if",
          condition: "c1",
          thenBranch: {
            type: "then",
            body: [{ type: "step", label: "step-a" }],
          },
          elseBranch: {
            type: "else",
            body: [
              { type: "step", label: "step-b" },
              { type: "step", label: "step-c" },
            ],
          },
        },
        { type: "step", label: "step-Y" },
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
                  { type: "step", label: "parallel-p" },
                  { type: "step", label: "parallel-q" },
                ],
              },
            ],
          },
        },
        { type: "step", label: "step-Z" },
        {
          type: "loop",
          label: "foreach potatoes",
          body: [
            { type: "step", label: "step-serial-s" },
            { type: "step", label: "step-serial-t" },
          ],
        },
      ],
    };
    const mermaid = workflowToMermaid(rootNode);
    // console.log(mermaid);
    expect(mermaid).toEqual(`flowchart TD
  node0[step-X]
  node1{c1}
  node2[step-a]
  node1 --> |yes| node2
  node3[step-b]
  node4[step-c]
  node3 --> node4
  node1 --> |no| node3
  node0 --> node1
  node5[step-Y]
  node2 --> node5
  node4 --> node5
  node6{c2}
  subgraph node7 [Do stuff in parallel]
    node8[parallel-p]
    node9[parallel-q]
    node8 --> node9
  end
  class node7 parallel
  node6 --> |yes| node8
  node5 --> node6
  node10[step-Z]
  node9 --> node10
  node6 --> |no| node10
  subgraph node11 [foreach potatoes]
    node12[step-serial-s]
    node13[step-serial-t]
    node12 --> node13
  end
  class node11 loop
  node10 --> node12
  classDef loop fill:#f9f
  classDef parallel fill:#9ff`);
  });
});
