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

export function camelCase(words: string) {
  const upperCamelCase = words.replace(/(?:^|[\s-_])(\w)/g, (_, char) =>
    char.toUpperCase(),
  );
  // Lowercase the first letter
  return upperCamelCase.replace(/^[A-Z]/, (char) => char.toLowerCase());
}
