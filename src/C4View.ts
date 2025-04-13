import { C4ObjectType } from "./C4Model";

export type C4ViewType = "System Context" | "Container" | "Component";

export type C4ViewRelationship = {
  targetId: string;
  name: string;
};

export type C4ViewObject = {
  id: string;
  name: string;
  description: string;
  type: C4ObjectType;
  tags: readonly string[];
  children: readonly C4ViewObject[];
  relationships: C4ViewRelationship[];
};

export type C4View = {
  type: C4ViewType;
  objects: C4ViewObject[];
};
