export type RootNode = {
  type: "root";
  body: ASTNode[];
};

export type StepNode = {
  type: "step";
  label: string;
};

export type IfNode = {
  type: "if";
  condition: string;
  thenBranch?: ASTNode;
  elseBranch?: ASTNode;
};

export type ThenNode = {
  type: "then";
  body: ASTNode[];
};

export type ElseNode = {
  type: "else";
  body: ASTNode[];
};

export type LoopNode = {
  type: "loop";
  label: string;
  body: ASTNode[];
};

export type ParallelNode = {
  type: "parallel";
  label: string;
  body: ASTNode[];
};

export type BodyNode = RootNode | ThenNode | ElseNode | LoopNode | ParallelNode;
export type ASTNode = BodyNode | StepNode | IfNode;
