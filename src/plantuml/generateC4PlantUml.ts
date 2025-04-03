import { C4Model } from "../c4Model";

export function generateC4PlantUml(model: C4Model, indent = "  "): string {
  //   let plantUml = `@startuml
  // !include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml
  // !include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml
  // !include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

  // LAYOUT_WITH_LEGEND()

  // title C4 System Diagram

  // `;

  let plantUml = "C4Context\n";
  // Add systems
  model.systems.forEach((system) => {
    const tags = system.tags?.length ? `<<${system.tags.join(",")}>>` : "";
    plantUml += `${indent}System(${system.variableName}, "${system.name}", "${tags}")\n`;
  });

  // Add containers
  model.containers.forEach((container) => {
    const tags = container.tags?.length
      ? `<<${container.tags.join(",")}>>`
      : "";
    plantUml += `${indent}Container(${container.variableName}, "${container.name}", "${tags}")\n`;
  });

  // Add components
  model.components.forEach((component) => {
    const tags = component.tags?.length
      ? `<<${component.tags.join(",")}>>`
      : "";
    plantUml += `${indent}Component(${component.variableName}, "${component.name}", "${tags}")\n`;
  });

  // Add relationships
  model.objects.forEach((c4Object) => {
    c4Object.getDependencies().forEach((dependency) => {
      plantUml += `${indent}Rel(${c4Object.variableName}, ${dependency.callee.variableName}, "${dependency.name}")\n`;
    });
  });

  // Add container boundaries
  model.systems.forEach((system) => {
    const containers = model.containers.filter((c) => c.parent === system);
    if (containers.length > 0) {
      plantUml += `${indent}System_Boundary(${system.variableName}_boundary, "${system.name}") {\n`;
      containers.forEach((container) => {
        plantUml += `${indent}  Container(${container.variableName}, "${container.name}")\n`;
      });
      plantUml += `${indent}}\n`;
    }
  });

  // Add component boundaries
  model.containers.forEach((container) => {
    const components = model.components.filter((c) => c.parent === container);
    if (components.length > 0) {
      plantUml += `${indent}Container_Boundary(${container.variableName}_boundary, "${container.name}") {\n`;
      components.forEach((component) => {
        plantUml += `${indent}  Component(${component.variableName}, "${component.name}")\n`;
      });
      plantUml += `${indent}}\n`;
    }
  });

  return plantUml;
}
