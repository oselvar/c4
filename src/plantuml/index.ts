import { C4DiagramType } from "../C4Diagram";
import { C4Model } from "../C4Model";
import { toDiagram } from "../toDiagram";
import { toPuml } from "./toPuml";

export function generateC4PlantUml(
  model: C4Model,
  diagramType: C4DiagramType,
  objectName: string,
  mermaid: boolean = true,
): string {
  const diagram = toDiagram(model, diagramType, objectName);
  const puml = toPuml(diagram);

  if (!mermaid) {
    return puml;
  }

  const header = {
    "System Context": "C4Container",
    Container: "C4Container",
    Component: "C4Component",
  }[diagramType];

  return gfmMermaid(`${header}\n\n${puml}`);
}

function gfmMermaid(content: string): string {
  return "```mermaid\n" + content + "\n```";
}
