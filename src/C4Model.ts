// Types representing the C4 model structure
export type C4ObjectType =
  | "person"
  | "group"
  | "softwareSystem"
  | "container"
  | "component";

export type C4Dependency = Readonly<{
  callerName: string;
  calleeName: string;
  name: string;
}>;

export type C4Object = Readonly<{
  type: C4ObjectType;
  name: string;
  variableName: string;
  tags: readonly string[];
  parentName: string | null;
}>;

export type C4Model = Readonly<{
  objects: readonly C4Object[];
  dependencies: readonly C4Dependency[];
}>;
