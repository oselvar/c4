import { C4Model, C4Object } from "../C4Model";
import { C4ModelBuilder } from "../C4ModelBuilder";
import { C4PumlModel, C4RenderedRelationship } from "./PlantUMLModel";

export type DiagramType = "SystemContext" | "Container" | "Component";

export function generateC4PlantUmlModel(
  model: C4Model,
  diagramType: DiagramType,
  objectName: string,
): C4PumlModel {
  const builder = new C4ModelBuilder(model);
  const root = builder.getObject(objectName);
  const internal = new Set<C4Object>();
  const externals = new Set<C4Object>();
  const relationships: C4RenderedRelationship[] = [];

  const addRel = (from: C4Object, to: C4Object, name: string) => {
    relationships.push({ from, to, name });
  };

  const collect = (obj: C4Object) => {
    for (const dep of builder.nestedOutsideDependencies(obj)) {
      const callee = builder.getObject(dep.calleeName);

      addRel(obj, callee, dep.name);
      if (!internal.has(callee)) {
        externals.add(callee);
      }
    }
  };

  if (diagramType === "SystemContext") {
    if (root.type !== "softwareSystem") {
      throw new Error(
        `SystemContext diagram requires a softwareSystem as root. Was ${root.type}.`,
      );
    }

    internal.add(root);

    for (const obj of model.objects) {
      if (obj === root) continue;

      for (const dep of builder.dependencies(obj)) {
        if (
          builder.getObject(dep.calleeName).variableName === root.variableName
        ) {
          internal.add(obj);
          addRel(obj, root, dep.name);
        }
      }

      for (const dep of builder.dependencies(root)) {
        if (
          builder.getObject(dep.calleeName).variableName === obj.variableName
        ) {
          internal.add(obj);
          addRel(root, obj, dep.name);
        }
      }
    }
  }

  if (diagramType === "Container") {
    if (root.type !== "softwareSystem") {
      throw new Error(
        `Container diagram requires a softwareSystem as root. Was ${root.type}.`,
      );
    }

    internal.add(root);

    for (const obj of model.objects) {
      if (
        obj.type === "container" &&
        obj.parentName &&
        builder.getObject(obj.parentName).variableName === root.variableName
      ) {
        internal.add(obj);
        collect(obj);
      }
    }
  }

  if (diagramType === "Component") {
    if (root.type !== "container") {
      throw new Error(
        `Component diagram requires a container as root. Was ${root.type}.`,
      );
    }

    internal.add(root);

    for (const obj of model.objects) {
      if (
        obj.type === "component" &&
        obj.parentName &&
        builder.getObject(obj.parentName).variableName === root.variableName
      ) {
        internal.add(obj);
        collect(obj);
      }
    }
  }

  return {
    root,
    internal: Array.from(internal),
    externals: Array.from(externals).filter((e) => !internal.has(e)),
    relationships,
  };
}
