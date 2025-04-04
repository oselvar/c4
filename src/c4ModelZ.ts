// Types representing the C4 model structure
export type C4ObjectType =
  | "person"
  | "group"
  | "softwareSystem"
  | "container"
  | "component";

export type C4Dependency = {
  callerName: string;
  calleeName: string;
  name: string;
};

export type C4Object = {
  type: C4ObjectType;
  name: string;
  variableName: string;
  tags: readonly string[];
  parent: string | null;
};

export type C4Model = {
  objects: readonly C4Object[];
  dependencies: readonly C4Dependency[];
};
