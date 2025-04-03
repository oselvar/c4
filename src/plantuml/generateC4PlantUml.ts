import { C4Model, C4Object, C4ObjectType } from "../c4Model";

export type DiagramType = "SystemContext" | "Container" | "Component";

type Filter = (o: C4Object) => boolean;

export function generateC4PlantUml(
  model: C4Model,
  diagramType: DiagramType,
  objectName: string
): string {
  let s = "";

  // Add appropriate includes based on diagram type
  let filter: Filter;
  let typeName: string | null;
  switch (diagramType) {
    case "SystemContext":
      s += `C4Context\n`;
      filter = (o) => o.type === "softwareSystem" || o.type === "group";
      typeName = "Enterprise_Boundary";
      break;
    case "Container":
      s += `C4Container\n`;
      filter = (o) => o.type === "container";
      typeName = "Container_Boundary";
      break;
    case "Component":
      s += `C4Component\n`;
      filter = (o) => o.type === "component";
      typeName = null;
      break;
  }

  s += `  title ${diagramType} diagram for X\n\n`;

  const objects = model.objects.filter((o) => o.name === objectName);
  s += recursiveWalk(typeName, objects, 1, filter);
  s += "\n";
  return s;
}

const typeNameByType: Record<C4ObjectType, string> = {
  softwareSystem: "System",
  container: "Container",
  component: "Component",
  group: "HHHHHHHH",
};

function recursiveWalk(
  typeName: string | null,
  objects: readonly C4Object[],
  indent: number,
  filter: (o: C4Object) => boolean
): string {
  const s = "  ".repeat(indent);
  return objects
    .filter(filter)
    .map((object) => {
      if (typeName === null) {
        typeName = typeNameByType[object.type];
      }
      const childFilter: Filter = (c) => {
        switch (object.type) {
          case "softwareSystem":
            return c.type === "container";
          case "container":
            return c.type === "component";
          default:
            return true;
        }
      };
      const children = recursiveWalk(
        null,
        object.children,
        indent + 1,
        childFilter
      );
      const line = `${s}${typeName}(${object.variableName}, "${object.name}")${children.length > 0 ? " {" : ""}`;
      const close = children.length > 0 ? `${s}}` : "";
      return [line, children, close].filter(Boolean).join("\n");
    })
    .join("\n");
}
