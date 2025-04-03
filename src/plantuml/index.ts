import { C4Model } from "../c4Model";
import { generateC4PlantUmlModel } from "./generateC4PlantUmlModel";
import { DiagramType } from "./PlantUMLModel";
import { renderC4PlantUml } from "./renderC4PlantUml";

export function generateC4PlantUml(
  model: C4Model,
  diagramType: DiagramType,
  objectName: string,
): string {
  return renderC4PlantUml(
    generateC4PlantUmlModel(model, diagramType, objectName),
  );
}
