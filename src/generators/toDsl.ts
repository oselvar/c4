import { C4Dependency, C4Model, C4Object } from "../C4Model";
import { C4ModelBuilder } from "../C4ModelBuilder";

export function toStructurizr(model: C4Model): string {
  const builder = new C4ModelBuilder(model);

  let s = `workspace {\n  model {\n`;
  const level = 2;

  s = modelAndRelationships(
    level,
    s,
    builder,
    model,
    (object: C4Object, indent: string) => {
      return object.tags.map((tag) => `${indent}  tags "${tag}"`).join("\n");
    },
  );

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

export function toLikeC4(model: C4Model): string {
  const builder = new C4ModelBuilder(model);

  let s = `model {\n`;
  const level = 1;
  s = modelAndRelationships(level, s, builder, model, () => "");
  s += `}\n\nviews {
`;

  model.objects
    .filter((object) => object.type === "softwareSystem")
    .forEach((object) => {
      s += `  view ${object.name} of ${object.id} {\n`;
      s += `    include *\n`;
      s += `  }\n`;
    });

  s += `}\n`;
  return s;
}

function modelAndRelationships(
  level: number,
  s: string,
  builder: C4ModelBuilder,
  model: Readonly<{
    objects: readonly C4Object[];
    dependencies: readonly C4Dependency[];
  }>,
  renderTags: RenderTags,
) {
  const indent = "  ".repeat(level);
  s += recursiveWalk(builder.rootObjects(), builder, level, renderTags);
  s += "\n\n";
  model.objects.forEach((object) => {
    builder.dependencies(object).forEach((dependency) => {
      s += `${indent}${object.id} -> ${builder.getObject(dependency.calleeName).id} "${dependency.label}"\n`;
    });
  });
  return s;
}

type RenderTags = (object: C4Object, indent: string) => string;

function recursiveWalk(
  objects: readonly C4Object[],
  builder: C4ModelBuilder,
  level: number,
  renderTags: RenderTags,
): string {
  const indent = "  ".repeat(level);
  return objects
    .map((object) => {
      const line = `${indent}${object.id} = ${object.type} "${object.name}" {`;
      const tags = renderTags(object, indent);
      const children = recursiveWalk(
        builder.children(object),
        builder,
        level + 1,
        renderTags,
      );
      const close = `${indent}}`;
      return [line, tags, children, close].filter(Boolean).join("\n");
    })
    .join("\n");
}
