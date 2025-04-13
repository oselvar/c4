import { C4Model, C4Object } from "./C4Model";
import { C4ModelBuilder } from "./C4ModelBuilder";
import { C4View, C4ViewObject } from "./C4View";

export function toSystemContextView(model: C4Model, scopeId: string): C4View {
  const builder = new C4ModelBuilder(model);
  const scopeObject = builder.getObject(scopeId, "softwareSystem");
  const objects: C4ViewObject[] = [toViewObject(scopeObject, builder)];
  return {
    type: "System Context",
    objects,
  };
}

function toViewObject(
  c4Object: C4Object,
  builder: C4ModelBuilder,
): C4ViewObject {
  // const relationships: C4ViewRelationship[] = builder
  //   .nestedDependencies(c4Object)
  //   .map((d) => ({
  //     name: d.name,
  //     sourceId: d.callerId,
  //     targetId: d.calleeId,
  //   }));
  return {
    id: c4Object.id,
    name: c4Object.name,
    description: "",
    type: c4Object.type,
    tags: c4Object.tags,
    children: [],
    relationships: [],
  };
}

export function toContainerView(model: C4Model, scopeId: string): C4View {
  const builder = new C4ModelBuilder(model);
  const scopeObject = builder.getObject(scopeId, "softwareSystem");
  const scopeChildren = builder.children(scopeObject);
  const objects: C4ViewObject[] = [
    {
      id: scopeObject.id,
      name: scopeObject.name,
      description: "",
      type: scopeObject.type,
      tags: scopeObject.tags,
      children: scopeChildren.map((c) => toViewObject(c, builder)),
      relationships: [],
    },
  ];

  return {
    type: "Container",
    objects,
  };
}

export function toComponentView(model: C4Model, scopeId: string): C4View {
  const builder = new C4ModelBuilder(model);
  const scopeObject = builder.getObject(scopeId, "container");
  const children = builder.children(scopeObject);
  const objects: C4ViewObject[] = [
    {
      id: scopeObject.id,
      name: scopeObject.name,
      description: "",
      type: scopeObject.type,
      tags: scopeObject.tags,
      children: children.map((c) => toViewObject(c, builder)),
      relationships: [],
    },
  ];

  return {
    type: "Component",
    objects,
  };
}
