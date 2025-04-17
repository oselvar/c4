import type { C4Call, C4CallKey, C4Object, C4ObjectKey } from "./C4Model";

export function callKey(call: C4Call): C4CallKey {
  return `${call.callerName}-${call.calleeName}-${call.operationName}` as C4CallKey;
}

export function objectKey(object: C4Object): C4ObjectKey {
  return makeObjectKey(object.type, object.name);
}

export function makeObjectKey(type: string, name: string): C4ObjectKey {
  return camelCase(`${type} ${name}`) as C4ObjectKey;
}

export function camelCase(input: string) {
  // 1️⃣ Remove all apostrophes (so “world’s” → “worlds”)
  const noApos = input.replace(/['’]/g, "");

  // 2️⃣ Split on anything that isn’t a letter or digit
  const segments = noApos.split(/[^A-Za-z0-9]+/).filter(Boolean);

  // 3️⃣ Lower‑case the first segment, capitalize the first letter of each following segment
  return segments
    .map((seg, i) => {
      const lower = seg.toLowerCase();
      if (i === 0) return lower;
      return lower[0].toUpperCase() + lower.slice(1);
    })
    .join("");
}
