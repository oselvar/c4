import type { C4Model, C4Object } from "../core/C4Model";
import { C4ModelBuilder } from "../core/C4ModelBuilder";
import { getUniqueCalls } from "../core/getUniqueCalls";
import { camelCase, objectKey } from "../core/strings";

export function toStructurizr(model: C4Model): string {
  const builder = new C4ModelBuilder(model);

  let s = `workspace {\n  model {\n`;
  const level = 2;

  s = modelAndCalls(
    level,
    s,
    builder,
    model,
    (object: C4Object, indent: string) => {
      return object.tags.map((tag) => `${indent}  tags "${tag}"`).join("\n");
    },
  );

  s += `
    views {\n`;

  model.callchains.forEach((callchain) => {
    s += `      dynamic * {\n`;
    s += `        title "${callchain.name}" {\n`;
    callchain.calls.forEach((call) => {
      const caller = builder.getObject(call.callerName);
      const callee = builder.getObject(call.calleeName);
      s += `          ${objectKey(caller)} -> ${objectKey(callee)} "${call.operationName}"\n`;
    });
    s += `        }\n`;
    s += `      }\n`;
  });
  s += `      styles {
        element "Database" {
          shape cylinder
        }
      }
`;
  s += `    }
`;

  s += `  }\n}\n`;
  return s;
}

export function toLikeC4(model: C4Model): string {
  const builder = new C4ModelBuilder(model);

  let s = `model {\n`;
  const level = 1;
  s = modelAndCalls(level, s, builder, model, () => "");
  s += `}\n\nviews {
`;

  Object.values(model.objects)
    .filter(
      (object) =>
        object.type === "softwareSystem" || object.type === "container",
    )
    .forEach((object) => {
      s += `  view ${object.name} of ${objectKey(object)} {\n`;
      s += `    include *\n`;
      s += `  }\n`;
    });

  model.callchains.forEach((callchain) => {
    s += `  dynamic view ${camelCase(callchain.name)} {\n`;
    s += `    title "${callchain.name}"\n`;
    callchain.calls.forEach((call) => {
      const caller = builder.getObject(call.callerName);
      const callee = builder.getObject(call.calleeName);
      s += `    ${objectKey(caller)} -> ${objectKey(callee)} "${call.operationName}"\n`;
    });
    s += `  }\n`;
  });

  s += `}\n`;
  return s;
}

function modelAndCalls(
  level: number,
  s: string,
  builder: C4ModelBuilder,
  model: C4Model,
  renderTags: RenderTags,
) {
  const indent = "  ".repeat(level);
  s += recursiveWalk(builder.rootObjects(), builder, level, renderTags);
  s += "\n\n";
  Object.values(model.objects).forEach((object: C4Object) => {
    Object.values(getUniqueCalls(model.callchains))
      .filter((call) => call.callerName === object.name)
      .forEach((call) => {
        s += `${indent}${objectKey(object)} -> ${objectKey(builder.getObject(call.calleeName))} "${call.operationName}"\n`;
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
      const line = `${indent}${objectKey(object)} = ${object.type} "${object.name}" {`;
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
