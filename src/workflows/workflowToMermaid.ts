import type { ASTNode, RootNode } from "./WorkflowAst";

export function workflowToMermaid(rootNode: RootNode): string {
  let idCounter = 0;
  const getId = (): string => `node${idCounter++}`;

  const lines: string[] = ["flowchart TD"];

  type Exit = {
    id: string;
    type: ASTNode["type"];
  };

  interface VisitResult {
    entry: string;
    exits: Exit[];
  }

  // Processes an array of nodes sequentially and connects the exits of one
  // node to the entry of the next.
  function visitBody(nodes: ASTNode[], depth: number): VisitResult {
    const indent = "  ".repeat(depth);
    let result: VisitResult | null = null;
    for (const node of nodes) {
      const current = visit(node, depth);
      if (result === null) {
        result = current;
      } else {
        // Connect every exit from the previous node to the entry of the current node.
        for (const exit of result.exits) {
          lines.push(
            `${indent}${exit.id} --> ${exit.type === "else" ? "|no| " : ""}${current.entry}`,
          );
        }
        result = { entry: result.entry, exits: current.exits };
      }
    }
    return result || { entry: "", exits: [] };
  }

  // Main visitor function that returns the entry and exit node IDs.
  function visit(node: ASTNode, depth: number): VisitResult {
    const indent = "  ".repeat(depth);
    switch (node.type) {
      case "root": {
        // Process children without wrapping them in a subgraph.
        return visitBody(node.body, depth);
      }
      case "step": {
        const id = getId();
        // Render step node as a square box.
        lines.push(`${indent}${id}[${node.label}]`);
        return { entry: id, exits: [{ id, type: "step" }] };
      }
      case "if": {
        const id = getId();
        // Render the if node as a diamond (rhombus).
        lines.push(`${indent}${id}{${node.condition}}`);
        const branchExits: Exit[] = [];
        // Process the then branch if it exists.
        if (node.thenBranch) {
          const thenRes = visit(node.thenBranch, depth);
          lines.push(`${indent}${id} --> |yes| ${thenRes.entry}`);
          branchExits.push(...thenRes.exits);
        }
        // Process the else branch if it exists.
        if (node.elseBranch) {
          const elseRes = visit(node.elseBranch, depth);
          if (elseRes.entry) {
            lines.push(`${indent}${id} --> |no| ${elseRes.entry}`);
          }
          branchExits.push(...elseRes.exits);
        }
        // When only a then branch exists, add the if node itself as an exit
        // so an edge will be drawn from the if node to the next node.
        if (node.thenBranch && !node.elseBranch) {
          branchExits.push({ id, type: "else" });
        }
        // If no branch is provided, treat the if node as both entry and exit.
        if (branchExits.length === 0) {
          branchExits.push({ id, type: "then" });
        }
        return { entry: id, exits: branchExits };
      }
      case "then": {
        // Process then node body without creating a subgraph.
        return visitBody(node.body, depth);
      }
      case "else": {
        // Process else node body without creating a subgraph.
        return visitBody(node.body, depth);
      }
      case "loop": {
        // Use a subgraph for the for node.
        const sgId = getId();
        lines.push(`${indent}subgraph ${sgId} [${node.label}]`);
        const res = visitBody(node.body, depth + 1);
        lines.push(`${indent}end`);
        lines.push(`${indent}class ${sgId} loop`);
        return res;
      }
      case "parallel": {
        // Use a subgraph for the parallel node.
        const sgId = getId();
        lines.push(`${indent}subgraph ${sgId} [${node.label}]`);
        const res = visitBody(node.body, depth + 1);
        lines.push(`${indent}end`);
        lines.push(`${indent}class ${sgId} parallel`);
        return res;
      }
      default: {
        // In case of an unexpected node type.
        return { entry: "", exits: [] };
      }
    }
  }

  // Start the traversal from the root node at depth 1.
  visit(rootNode, 1);
  lines.push("  classDef loop fill:#f9f");
  lines.push("  classDef parallel fill:#9ff");
  return lines.join("\n");
}
