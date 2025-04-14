import { C4Model, C4Object } from "../C4Model";
import { C4ModelBuilder } from "../C4ModelBuilder";

export function toStructurizr(model: C4Model): string {
  const builder = new C4ModelBuilder(model);

  let s = `workspace {\n  model {\n`;
  s += recursiveWalk(builder.rootObjects(), builder, 2);
  s += "\n\n";
  model.objects.forEach((object) => {
    builder.dependencies(object).forEach((dependency) => {
      s += `    ${object.id} -> ${builder.getObject(dependency.calleeName).id} "${dependency.label}"\n`;
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
  return s;
}

function recursiveWalk(
  objects: readonly C4Object[],
  builder: C4ModelBuilder,
  indent: number,
): string {
  const s = "  ".repeat(indent);
  return objects
    .map((object) => {
      const line = `${s}${object.id} = ${object.type} "${object.name}" {`;
      const tags = object.tags.map((tag) => `${s}  tags "${tag}"`).join("\n");
      const children = recursiveWalk(
        builder.children(object),
        builder,
        indent + 1,
      );
      const close = `${s}}`;
      return [line, tags, children, close].filter(Boolean).join("\n");
    })
    .join("\n");
}
