import { parseCloudflareWorkflowSource } from "../cloudflare/parseCloudflareWorkflowSource";
import { workflowToMermaid } from "../workflowToMermaid";

const workflowPath = process.argv[2];
if (!workflowPath) {
  throw new Error("Workflow path is required");
}
const rootNode = parseCloudflareWorkflowSource(workflowPath);
const mermaid = workflowToMermaid(rootNode);
console.log("# " + workflowPath.split("/").pop());
console.log("```mermaid");
console.log(mermaid);
console.log("```");
