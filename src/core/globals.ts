import { C4ModelBuilder } from "./C4ModelBuilder";

if (!globalThis.__C4_MODEL_BUILDER__) {
  const readyPromise = new Promise<void>((resolve) => {
    globalThis.__C4_READY_RESOLVE__ = resolve;
  });
  globalThis.__C4_MODEL_BUILDER__ = new C4ModelBuilder(
    {
      objects: {},
      callchains: [],
    },
    readyPromise,
  );
}

export const globalC4ModelBuilder = globalThis.__C4_MODEL_BUILDER__;

export const globalC4Ready = globalThis.__C4_READY_RESOLVE__;
