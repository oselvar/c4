// Types representing the C4 model structure
export type C4ObjectType =
  | "person"
  | "group"
  | "softwareSystem"
  | "container"
  | "component";

export type C4Call = Readonly<{
  callerName: C4Name;
  calleeName: C4Name;
  operationName: string;
}>;

export type C4Callchain = Readonly<{
  name: string;
  calls: C4Call[];
}>;

export type C4Name = string & { __brand: "name" };
export type C4Id = string & { __brand: "id" };

export type C4Object = Readonly<{
  id: C4Id; // Unique identifier for the object. This is typically a "variable name" in order to make e.g. Structurizr diagrams more readable.
  type: C4ObjectType;
  name: C4Name;
  // TODO: Add description
  tags: readonly string[];
  parentName: C4Name | null;
}>;

export type C4Model = Readonly<{
  objects: Record<string, C4Object>;
  calls: Record<string, C4Call>;
  callchains: readonly C4Callchain[];
}>;
