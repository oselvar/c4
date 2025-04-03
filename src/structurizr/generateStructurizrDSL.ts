import { C4Model } from "../c4Model";

export function generateStructurizrDSL(model: C4Model): string {
  let dsl = `workspace {\n  model {\n`;

  model.systems.forEach((system) => {
    dsl += `    ${system.variableName} = softwareSystem "${system.name}" {\n`;
    system.tags?.forEach((tag) => {
      dsl += `        tags "${tag}"\n`;
    });
    model.containers
      .filter((container) => container.parent === system)
      .forEach((container) => {
        dsl += `      ${container.variableName} = container "${container.name}" {\n`;
        container.tags?.forEach((tag) => {
          dsl += `        tags "${tag}"\n`;
        });
        model.components
          .filter((component) => component.parent === container)
          .forEach((component) => {
            dsl += `        ${component.variableName} = component "${component.name}" {\n`;
            component.tags?.forEach((tag) => {
              dsl += `        tags "${tag}"\n`;
            });
            dsl += `        }\n`;
          });
        dsl += `      }\n`;
      });
    dsl += `    }\n`;
  });

  model.objects.forEach((c4Object) => {
    c4Object.getDependencies().forEach((dependency) => {
      dsl += `    ${c4Object.variableName} -> ${dependency.callee.variableName} "${dependency.name}"\n`;
    });
  });

  dsl += `  }
views {
  styles {
    element "Database" {
      shape cylinder
    }
  }
}
}
  `;
  return dsl;
}
