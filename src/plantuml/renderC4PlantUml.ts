import { C4Object } from "../c4Model";
import { C4PumlModel } from "./PlantUMLModel";

export function renderC4PlantUml(model: C4PumlModel): string {
  const lines: string[] = [];

  for (const el of model.internal) {
    lines.push(renderC4Object(el, false));
  }

  for (const el of model.externals) {
    lines.push(renderC4Object(el, true));
  }

  lines.push("");

  for (const rel of model.relationships) {
    lines.push(
      `Rel(${rel.from.variableName}, ${rel.to.variableName}, "${rel.name}")`,
    );
  }

  lines.push("");

  return lines.join("\n");
}

function renderC4Object(obj: C4Object, external: boolean): string {
  const description = obj.name;
  const label = obj.name.replace(/"/g, '\\"'); // escape quotes
  const typeFn = getPlantUmlKeyword(obj, external);

  return `${typeFn}(${obj.variableName}, "${label}", "${description}")`;
}

function getPlantUmlKeyword(obj: C4Object, external: boolean): string {
  switch (obj.type) {
    case "softwareSystem":
      return external ? "System_Ext" : "System";
    case "container":
      return external ? "Container_Ext" : "Container";
    case "component":
      return external ? "Component_Ext" : "Component";
    default:
      return "System"; // fallback for group etc
  }
}
