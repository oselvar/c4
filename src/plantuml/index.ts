import { C4Model } from "../C4Model";
import { C4ViewType } from "../C4View";
import {
  toComponentView,
  toContainerView,
  toSystemContextView,
} from "../toView";
import { toPuml } from "./toPuml";

export function generateC4PlantUml(
  model: C4Model,
  viewType: C4ViewType,
  objectName: string,
  mermaid: boolean = true,
): string {
  let diagram;
  switch (viewType) {
    case "System Context":
      diagram = toSystemContextView(model, objectName);
      break;
    case "Container":
      diagram = toContainerView(model, objectName);
      break;
    case "Component":
      diagram = toComponentView(model, objectName);
      break;
    default:
      throw new Error(`Unknown view type: ${viewType}`);
  }
  const puml = toPuml(diagram);
  if (!mermaid) {
    return puml;
  }

  const header = {
    "System Context": "C4Container",
    Container: "C4Container",
    Component: "C4Component",
  }[viewType];

  return gfmMermaid(`${header}\n\n${puml}`);
}

function gfmMermaid(content: string): string {
  return "```mermaid\n" + content + "\n```";
}
