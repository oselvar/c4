import { C4Model } from "../c4Model";

export type DiagramType = "SystemContext" | "Container" | "Component";

export function generateC4PlantUml(
  model: C4Model,
  diagramType: DiagramType = "SystemContext",
  objects: string[] = model.objects.map((o) => o.name),
  indent = "  ",
): string {
  let plantUml = "";

  // Add appropriate includes based on diagram type
  switch (diagramType) {
    case "SystemContext":
      plantUml += `C4Context\n`;
      break;
    case "Container":
      plantUml += `C4Container\n`;
      break;
    case "Component":
      plantUml += `C4Component\n`;
      break;
  }

  // plantUml += `title C4 ${diagramType} Diagram\n\n`;

  // Add systems
  model.systems.forEach((system) => {
    const tags = system.tags?.length ? `<<${system.tags.join(",")}>>` : "";
    plantUml += `${indent}System(${system.variableName}, "${system.name}", "${tags}")\n`;
  });

  // Add relationships
  model.objects.forEach((c4Object) => {
    c4Object.dependencies.forEach((dependency) => {
      // Only show relationships where both ends are in our filtered objects
      if (objects.includes(dependency.callee.name)) {
        plantUml += `${indent}Rel(${c4Object.variableName}, ${dependency.callee.variableName}, "${dependency.name}")\n`;
      }
    });
  });

  // Add container boundaries
  model.systems.forEach((system) => {
    const containers = model.containers.filter((c) => c.parent === system);
    if (containers.length > 0) {
      plantUml += `\n${indent}System_Boundary(${system.variableName}_boundary, "${system.name}") {\n`;
      containers.forEach((container) => {
        plantUml += `${indent}  Container(${container.variableName}, "${container.name}")\n`;
      });
      plantUml += `${indent}}\n`;
    }
  });

  return plantUml;
}
