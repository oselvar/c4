import type { C4Call, C4Callchain } from "./C4Model";
import { callKey } from "./strings";

export function getUniqueCalls(
  callchains: readonly C4Callchain[],
): readonly C4Call[] {
  const calls = Object.fromEntries(
    callchains
      .flatMap((callchain) => callchain.calls)
      .map((call) => [callKey(call), call]),
  );
  return Object.values(calls).toSorted((a, b) =>
    callKey(a).localeCompare(callKey(b)),
  );
}
