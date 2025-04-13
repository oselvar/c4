#!/usr/bin/env node

import { existsSync } from "node:fs";

import { Command, InvalidArgumentError } from "commander";
import { z } from "zod";

import { parseCloudflareWorkflowSource } from "../workflows/cloudflare/parseCloudflareWorkflowSource";
import { workflowToMermaid } from "../workflows/workflowToMermaid";
import { workflowToTimeline } from "../workflows/workflowToTimeline";

const program = new Command();

const pkg = await import("../../package.json", { assert: { type: "json" } });

program
  .name("c4")
  .description("CLI to generate C4 diagrams")
  .version(pkg.version);

const WorkflowType = z.enum(["mermaid", "timeline"]);

program
  .command("workflow")
  .description("Generate diagram or timeline from a workflow file")
  .requiredOption("-f, --format <type>", "mermaid or timeline", (value) => {
    if (!WorkflowType.safeParse(value).success) {
      throw new InvalidArgumentError(`Invalid format: ${value}`);
    }
    return value;
  })
  .argument("<workflowPath>", "Path to the workflow file", (value) => {
    if (!existsSync(value)) {
      throw new InvalidArgumentError(`File does not exist: ${value}`);
    }
    return value;
  })
  .action(
    (workflowPath, { format }: { format: z.infer<typeof WorkflowType> }) => {
      const rootNode = parseCloudflareWorkflowSource(workflowPath);
      switch (format) {
        case "mermaid": {
          const mermaid = workflowToMermaid(rootNode);
          console.log(mermaid);
          break;
        }
        case "timeline": {
          const timeline = workflowToTimeline(rootNode);
          console.log(timeline);
          break;
        }
      }
    },
  );

program.parse(process.argv);
