// Types representing the C4 model structure
export type C4ObjectType =
  | "person"
  | "group"
  | "softwareSystem"
  | "container"
  | "component";

export type C4Dependency = Readonly<{
  callerId: string;
  calleeId: string;
  name: string;
}>;

export type C4Object = Readonly<{
  id: string; // Unique identifier for the object. This is typically a "variable name" in order to make e.g. Structurizr diagrams more readable.
  type: C4ObjectType;
  name: string;
  // TODO: Add description
  tags: readonly string[];
  parentId: string | null;
}>;

export type C4Model = Readonly<{
  objects: readonly C4Object[];
  dependencies: readonly C4Dependency[];
}>;
