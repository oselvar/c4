import { C4Object } from "../c4Model";

export type DiagramType = "SystemContext" | "Container" | "Component";

export interface C4RenderedRelationship {
  from: C4Object;
  to: C4Object;
  name: string;
}

export interface C4PumlModel {
  root: C4Object;
  internal: C4Object[];
  externals: C4Object[];
  relationships: C4RenderedRelationship[];
}
