import { C4Model } from "../c4ModelZ";
import {
  DiagramType,
  generateC4PlantUmlModel,
} from "./generateC4PlantUmlModel";
import { renderC4PlantUml } from "./renderC4PlantUml";

export function generateC4PlantUml(
  model: C4Model,
  diagramType: DiagramType,
  objectName: string,
  mermaid: boolean = true,
): string {
  const puml = renderC4PlantUml(
    generateC4PlantUmlModel(model, diagramType, objectName),
  );

  if (!mermaid) {
    return puml;
  }

  const header = {
    SystemContext: "C4Container",
    Container: "C4Container",
    Component: "C4Component",
  }[diagramType];

  return gfmMermaid(`${header}\n\n${puml}`);
}

function gfmMermaid(mermaid: string): string {
  return `\`\`\`mermaid\n${mermaid}\`\`\``;
}
