import { CallExpression, Node, Project, SourceFile } from "ts-morph";

import type {
  BodyNode,
  ElseNode,
  IfNode,
  LoopNode,
  ParallelNode,
  RootNode,
  StepNode,
  ThenNode,
} from "../WorkflowAst";

/**
 * Analyze a TypeScript file containing Cloudflare workflow code
 */
export function parseCloudflareWorkflowSource(filePath: string) {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);
  return parse(sourceFile);
}

function parse(sourceFile: SourceFile): RootNode {
  const bodyNodes: BodyNode[] = [];

  function push(node: BodyNode) {
    bodyNodes.push(node);
  }

  function pop(): BodyNode {
    const top = bodyNodes.pop();
    if (!top) {
      throw new Error("No body node to pop");
    }
    return top;
  }

  push({ type: "root", body: [] });
  descend(sourceFile, false);
  const rootNode = pop();
  return rootNode as RootNode;

  function descend(node: Node, inStep: boolean) {
    const bodyNode = bodyNodes[bodyNodes.length - 1];
    if (isStepCall(node)) {
      const stepNode: StepNode = { type: "step", label: getStepLabel(node) };
      bodyNode.body.push(stepNode);
      node.forEachChild((child) => descend(child, true));
    } else if (Node.isIfStatement(node) && !inStep) {
      const condition = node.getExpression().getText();

      const ifNode: IfNode = { type: "if", condition };
      bodyNode.body.push(ifNode);

      const thenStatement = node.getThenStatement();
      if (thenStatement) {
        const thenNode: ThenNode = { type: "then", body: [] };
        ifNode.thenBranch = thenNode;
        push(thenNode);
        descend(thenStatement, inStep);
        pop();
      }
      const elseStatement = node.getElseStatement();
      if (elseStatement) {
        const elseNode: ElseNode = { type: "else", body: [] };
        ifNode.elseBranch = elseNode;
        push(elseNode);
        descend(elseStatement, inStep);
        pop();
      }
    } else if (isPromiseAllCall(node) && !inStep) {
      const comment = node
        .getAncestors()
        .map((ancestor) =>
          ancestor
            .getLeadingCommentRanges()
            .flatMap((range) => range.getText()),
        )
        .flat()[0];
      const label = comment ? comment.replace(/^\/\//, "").trim() : "parallel";
      const parallelNode: ParallelNode = { type: "parallel", label, body: [] };
      bodyNode.body.push(parallelNode);
      push(parallelNode);
      descend(node.getArguments()[0], inStep);
      pop();
    } else if (Node.isForStatement(node) && !inStep) {
      const forNode: LoopNode = { type: "loop", label: "FOR", body: [] };
      bodyNode.body.push(forNode);
      push(forNode);
      node.forEachChild((child) => descend(child, inStep));
      pop();
    } else if (Node.isForOfStatement(node) && !inStep) {
      const comment = node
        .getLeadingCommentRanges()
        .map((range) => range.getText())[0];
      const label = comment
        ? comment.replace(/^\/\//, "").trim()
        : `foreach ${node.getExpression().getText()}`;

      const forNode: LoopNode = { type: "loop", label, body: [] };
      bodyNode.body.push(forNode);
      push(forNode);
      node.forEachChild((child) => descend(child, inStep));
      pop();
    } else {
      node.forEachChild((child) => descend(child, inStep));
    }
  }
}

function isStepCall(node: Node): node is CallExpression {
  if (!Node.isCallExpression(node)) {
    return false;
  }
  const expression = node.getExpression();
  return (
    Node.isPropertyAccessExpression(expression) &&
    expression.getName() === "do" &&
    expression.getExpression().getText() === "step"
  );
}

function isPromiseAllCall(node: Node): node is CallExpression {
  if (!Node.isCallExpression(node)) {
    return false;
  }
  const expression = node.getExpression();
  return (
    Node.isPropertyAccessExpression(expression) &&
    expression.getName() === "all" &&
    expression.getExpression().getText() === "Promise"
  );
}

function getStepLabel(node: CallExpression): string {
  const args = node.getArguments();
  if (args.length > 0 && Node.isStringLiteral(args[0])) {
    return args[0].getLiteralText();
  }
  return `Step ${node.getText()}`;
}
