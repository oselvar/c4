import type { C4Callchain, C4Model, C4Object } from "./C4Model";

export function makeC4Model(
  objects: C4Object[],
  callchains: C4Callchain[],
): C4Model {
  return {
    objects: Object.fromEntries(objects.map((object) => [object.name, object])),
    callchains,
  };
}
