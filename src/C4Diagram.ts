export type C4DiagramType = "System Context" | "Container" | "Component";

export type C4Relationship = {
  targetId: string;
  name: string;
};

export type C4Node = {
  id: string;
  name: string;
  description: string;
  tags: readonly string[];
  children: readonly C4Node[];
  relationships: C4Relationship[];
};

export type C4Diagram = {
  type: C4DiagramType;
  nodes: C4Node[];
};
