import { C4Model, C4Object, C4ObjectType } from "../c4Model";

export type DiagramType = "SystemContext" | "Container" | "Component";

export function generateC4PlantUml(
  model: C4Model,
  diagramType: DiagramType = "SystemContext",
  objects: string[] = model.objects.map((o) => o.name),
  indent = "  ",
): string {
  let s = "";

  // Add appropriate includes based on diagram type
  switch (diagramType) {
    case "SystemContext":
      s += `C4Context\n`;
      break;
    case "Container":
      s += `C4Container\n`;
      break;
    case "Component":
      s += `C4Component\n`;
      break;
  }

  s += "  title System Context diagram for Internet Banking System\n";

  s += recursiveWalk(
    model.rootObjects,
    1,
    (o) => o.type === "softwareSystem" || o.type === "group",
  );
  s += "\n";
  return s;
}

const typeNameByType: Record<C4ObjectType, string> = {
  softwareSystem: "System",
  container: "Container",
  component: "Component",
  group: "Enterprise_Boundary",
};

function recursiveWalk(
  objects: readonly C4Object[],
  indent: number,
  filter: (o: C4Object) => boolean,
): string {
  const s = "  ".repeat(indent);
  return objects
    .filter(filter)
    .map((object) => {
      const children = recursiveWalk(object.children, indent + 1, filter);

      const typeName = typeNameByType[object.type];
      const line = `${s}${typeName}(${object.variableName}, "${object.name}")${children.length > 0 ? " {" : ""}`;
      const close = children.length > 0 ? `${s}}` : "";
      return [line, children, close].filter(Boolean).join("\n");
    })
    .join("\n");
}
