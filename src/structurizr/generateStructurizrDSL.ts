import { C4Model, C4Object } from "../c4Model";

export function generateStructurizrDSL(model: C4Model): string {
  let s = `workspace {\n  model {\n`;
  s += recursiveWalk(model.rootObjects, 2);
  s += "\n\n";
  model.objects.forEach((c4Object) => {
    c4Object.dependencies.forEach((dependency) => {
      s += `    ${c4Object.variableName} -> ${dependency.callee.variableName} "${dependency.name}"\n`;
    });
  });

  s += `
    views {
      styles {
        element "Database" {
          shape cylinder
        }
      }
    }
`;

  s += `  }\n}\n`;

  //   }
  // }
  //   `;
  return s;
}

function recursiveWalk(objects: readonly C4Object[], indent: number): string {
  const s = "  ".repeat(indent);
  return objects
    .map((object) => {
      const line = `${s}${object.variableName} = ${object.type} "${object.name}" {`;
      const tags = object.tags.map((tag) => `${s}  tags "${tag}"`).join("\n");
      const children = recursiveWalk(object.children, indent + 1);
      const close = `${s}}`;
      return [line, tags, children, close].filter(Boolean).join("\n");
    })
    .join("\n");
}
