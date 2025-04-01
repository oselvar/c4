import type { ASTNode, RootNode } from "./WorkflowAst";

export function workflowToTimeline(rootNode: RootNode): string[] {
  const timelineSteps: string[] = [];

  // The visitor function recurses the AST and collects steps.
  function visit(node: ASTNode): void {
    switch (node.type) {
      case "root":
      case "then":
      case "else":
        // For nodes that simply wrap a body of children, iterate over the children.
        for (const child of node.body) {
          visit(child);
        }
        break;
      case "step":
        // For a simple step, push its label if it starts with a capital letter.
        if (node.label.charAt(0) === node.label.charAt(0).toUpperCase()) {
          timelineSteps.push(node.label);
        }
        break;
      case "loop":
        // For a loop, add a timeline step and then visit its body.
        if (node.label.charAt(0) === node.label.charAt(0).toUpperCase()) {
          timelineSteps.push(node.label);
        }
        break;
      case "parallel":
        // For parallel nodes, add an indicator and then visit each branch.
        if (node.label.charAt(0) === node.label.charAt(0).toUpperCase()) {
          timelineSteps.push(node.label);
        }
        break;
      case "if":
        // For if nodes, you might not want to show the condition itself as a step.
        // Instead, process both branches (or only the then branch if no else exists).
        if (node.thenBranch) {
          visit(node.thenBranch);
        }
        if (node.elseBranch) {
          visit(node.elseBranch);
        }
        break;
      default:
        // For any unknown node type, do nothing.
        break;
    }
  }

  visit(rootNode);
  return timelineSteps;
}
